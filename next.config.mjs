/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['groq-sdk'],
  },
  env: {
    GROQ_API_KEY: process.env.GROQ_API_KEY,
  },
};

export default nextConfig;
