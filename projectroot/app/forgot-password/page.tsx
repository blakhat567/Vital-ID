import { ShieldPlus } from "lucide-react";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <main className="page-shell relative flex min-h-screen items-center justify-center px-4 py-10">
      <div className="relative z-10 grid w-full max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="flex flex-col justify-center rounded-[2rem] border border-white/60 bg-white/65 p-8 shadow-panel backdrop-blur lg:p-12">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-teal-100 p-3 text-teal-800">
              <ShieldPlus className="h-6 w-6" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-800">
              Trusted Medical Platform
            </p>
          </div>
          <h1 className="mt-8 max-w-xl font-serif text-5xl leading-tight text-slate-900">
            Recover your account securely.
          </h1>
          <p className="mt-6 max-w-lg text-slate-600">
            Enter your email address and we'll send you a secure link to reset your
            password. You'll have 24 hours to complete the reset process.
          </p>
        </section>

        <section className="flex flex-col items-center justify-center">
          <ForgotPasswordForm />
        </section>
      </div>
    </main>
  );
}
