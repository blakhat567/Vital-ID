/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance optimizations
  swcMinify: true,
  compress: true,
  productionBrowserSourceMaps: false,
  
  // Caching
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000,
    pagesBufferLength: 5
  },
  
  // Image optimization
  images: {
    unoptimized: false,
    formats: ['image/avif', 'image/webp']
  }
};

export default nextConfig;
