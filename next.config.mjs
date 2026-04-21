/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['groq-sdk'],
  env: {
    GROQ_API_KEY: process.env.GROQ_API_KEY || '',
  },
};

export default nextConfig;
