# Backend Implementation Guide - Vital ID Platform

## Phase 1: Supabase Setup & Configuration

### Step 1: Create Supabase Project
1. Visit [supabase.com](https://supabase.com) and sign up/login
2. Create a new project:
   - Choose a project name (e.g., "vital-id-prod")
   - Set a strong database password
   - Select region closest to your users
   - Wait for initialization (5-10 minutes)

### Step 2: Configure Authentication
1. Go to **Authentication > Providers**
2. Enable **Email** provider:
   - Set "Confirm email" to ON
   - Set "Double confirm changes" to OFF initially
3. Go to **Authentication > Email Templates**
4. Configure email templates for:
   - **Confirm signup**: Customize with your branding
   - **Magic link**: For password reset
   - **Change email**: Optional
   - **Reset password**: Update redirect to `https://your-domain.com/reset-password?token={{ .token }}&type=recovery`

### Step 3: Configure Redirect URLs
1. Go to **Authentication > URL Configuration**
2. Add redirect URLs:
   ```
   http://localhost:3000 (development)
   https://your-domain.com (production)
   https://www.your-domain.com (production with www)
   ```

### Step 4: Create Database Schema
Execute the following SQL in Supabase SQL Editor:

```sql
-- Users profile table (extends built-in auth.users)
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  role VARCHAR(50) CHECK (role IN ('patient', 'doctor', 'admin')),
  blood_type VARCHAR(5),
  emergency_contact VARCHAR(255),
  phone_number VARCHAR(20),
  date_of_birth DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Doctor verification table
CREATE TABLE public.doctor_licenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  license_number VARCHAR(100) UNIQUE NOT NULL,
  specialty VARCHAR(100),
  issuing_country VARCHAR(100),
  issue_date DATE,
  expiry_date DATE,
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Medical records table
CREATE TABLE public.medical_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  recorded_at TIMESTAMP NOT NULL,
  blood_pressure VARCHAR(20),
  heart_rate INTEGER,
  oxygen_saturation FLOAT,
  temperature VARCHAR(10),
  height_cm FLOAT,
  weight_kg FLOAT,
  allergies TEXT[],
  conditions TEXT[],
  medications TEXT[],
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Consultations table
CREATE TABLE public.consultations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  specialist VARCHAR(100),
  scheduled_date TIMESTAMP NOT NULL,
  mode VARCHAR(20) CHECK (mode IN ('Virtual', 'In Person')),
  status VARCHAR(50) CHECK (status IN ('Scheduled', 'Confirmed', 'Pending', 'Completed', 'Cancelled')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Diagnosis entries table
CREATE TABLE public.diagnosis_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL,
  doctor_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  specialty VARCHAR(100),
  note TEXT NOT NULL,
  status VARCHAR(50) CHECK (status IN ('Shared', 'Needs Review', 'Resolved')),
  confidence_score FLOAT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Verified credentials table
CREATE TABLE public.credentials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  issuer_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  holder_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  credential_type VARCHAR(100) NOT NULL,
  subject VARCHAR(255),
  status VARCHAR(50) CHECK (status IN ('Verified', 'Pending Review', 'Action Needed')),
  blockchain_hash VARCHAR(255),
  last_checked TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnosis_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credentials ENABLE ROW LEVEL SECURITY;
```

### Step 5: Set Up Row Level Security (RLS) Policies
Execute in SQL Editor:

```sql
-- User profiles: Users can read their own profile
CREATE POLICY "Users can view own profile"
ON public.user_profiles FOR SELECT
USING (auth.uid() = id);

-- Medical records: Patients own their records, doctors can read with permission
CREATE POLICY "Patients can view own records"
ON public.medical_records FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Patients can insert own records"
ON public.medical_records FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Doctor licenses: Only doctors can view their own
CREATE POLICY "Doctors can view own license"
ON public.doctor_licenses FOR SELECT
USING (auth.uid() = user_id);

-- Consultations: Patients and assigned doctors can view
CREATE POLICY "Patients and doctors can view consultations"
ON public.consultations FOR SELECT
USING (
  auth.uid() = patient_id OR 
  auth.uid() = doctor_id
);
```

---

## Phase 2: Backend API Implementation (Node.js/Express recommended)

### Required Endpoints to Create

#### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Complete password reset
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh-token` - Refresh auth token

#### User Profiles
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/:id` - Get user by ID (with privacy checks)

#### Medical Records
- `GET /api/medical-records` - List user's records
- `POST /api/medical-records` - Create new record
- `GET /api/medical-records/:id` - Get specific record
- `PUT /api/medical-records/:id` - Update record
- `DELETE /api/medical-records/:id` - Delete record

#### Doctor Features
- `GET /api/doctors/verify-license` - Check license validity
- `POST /api/doctors/verify-license` - Verify doctor license
- `GET /api/consultations` - List consultations
- `POST /api/consultations` - Schedule consultation
- `PUT /api/consultations/:id` - Update consultation

#### Credentials & Trust
- `GET /api/credentials` - List verified credentials
- `POST /api/credentials/issue` - Issue new credential
- `GET /api/credentials/verify/:hash` - Verify credential blockchain

---

## Phase 3: Environment Variables Setup

### Current (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Add These Variables

#### Development (.env.local)
```
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:3001
API_SECRET_KEY=your-secret-key-here

# Email Configuration
SENDGRID_API_KEY=your-sendgrid-key
SENDGRID_FROM_EMAIL=noreply@vitalid.com

# JWT Configuration
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRY=24h

# Blockchain/Credentials (if using)
BLOCKCHAIN_API_KEY=your-blockchain-api-key
BLOCKCHAIN_NETWORK=testnet

# Feature Flags
ENABLE_DOCTOR_VERIFICATION=true
ENABLE_MFA=false
DEMO_MODE=false
```

#### Production (.env.production)
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

NEXT_PUBLIC_API_URL=https://api.vitalid.com
API_SECRET_KEY=your-production-secret-key

SENDGRID_API_KEY=your-sendgrid-key
SENDGRID_FROM_EMAIL=noreply@vitalid.com

JWT_SECRET=your-production-jwt-secret
JWT_EXPIRY=24h

BLOCKCHAIN_API_KEY=your-blockchain-api-key
BLOCKCHAIN_NETWORK=mainnet

ENABLE_DOCTOR_VERIFICATION=true
ENABLE_MFA=true
DEMO_MODE=false
```

### How to Get These Keys

1. **SUPABASE_ANON_KEY**: 
   - Supabase Dashboard > Settings > API > "anon public"

2. **SUPABASE_SERVICE_ROLE_KEY**:
   - Supabase Dashboard > Settings > API > "service_role secret"
   - ⚠️ KEEP THIS SECRET - Never expose in frontend

3. **SENDGRID_API_KEY**:
   - Sign up at sendgrid.com
   - Go to Settings > API Keys > Create API Key

4. **JWT_SECRET**:
   - Generate with: `openssl rand -base64 32`

5. **BLOCKCHAIN_API_KEY** (if using):
   - For credential verification system

---

## Phase 4: Database Migrations & Initial Data

### Create Initial Admin User
```sql
-- In Supabase SQL Editor
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  'admin@vitalid.com',
  crypt('AdminPassword123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
)
RETURNING id;

-- Then insert profile
INSERT INTO public.user_profiles (id, full_name, role)
VALUES ('<user-id-from-above>', 'Admin User', 'admin');
```

---

## Phase 5: Testing Checklist

- [ ] User registration works
- [ ] Email confirmation flow works
- [ ] Login/logout works
- [ ] Password reset works with email
- [ ] Doctor license verification works
- [ ] Medical records CRUD operations work
- [ ] RLS policies prevent unauthorized access
- [ ] Consultation scheduling works
- [ ] Credentials issuance works
- [ ] All API endpoints return proper error messages

---

## Phase 6: Security Implementation

- [ ] Add rate limiting to auth endpoints
- [ ] Implement CORS policies
- [ ] Add request validation middleware
- [ ] Set up API key rotation
- [ ] Enable 2FA for doctor accounts
- [ ] Add audit logging
- [ ] Set up HIPAA compliance logging
- [ ] Implement data encryption at rest

---

## Phase 7: Deployment

- [ ] Test in staging environment
- [ ] Set up SSL/TLS certificates
- [ ] Configure production database backups
- [ ] Set up monitoring and alerting
- [ ] Deploy to production (Vercel for frontend, Heroku/AWS for backend)
- [ ] Update production environment variables
- [ ] Run smoke tests

---

## Quick Start: Get Supabase Keys

1. Go to https://app.supabase.com
2. Click your project
3. Go to **Settings > API**
4. Copy:
   - `Project URL` → NEXT_PUBLIC_SUPABASE_URL
   - `anon public` → NEXT_PUBLIC_SUPABASE_ANON_KEY
   - `service_role secret` → SUPABASE_SERVICE_ROLE_KEY
5. Update `.env.local` and restart dev server

---

## Priority Order for Backend Development

1. **High Priority (Week 1)**
   - User authentication API
   - User profile management
   - Medical records API
   - Email verification

2. **Medium Priority (Week 2)**
   - Doctor license verification
   - Consultation scheduling
   - Access control/permissions

3. **Lower Priority (Week 3+)**
   - Credential blockchain integration
   - Advanced analytics
   - Audit logging system
