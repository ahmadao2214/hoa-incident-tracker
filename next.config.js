/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable ISR (Incremental Static Regeneration)
  // This allows us to revalidate pages without rebuilding the entire site
  experimental: {
    // This is optional but can improve performance
    optimizeCss: true,
  },
};

module.exports = nextConfig;
