/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
      // outputFileTracingRoot: undefined,
    },
    eslint: {
      // Remove useEslintrc and extensions options
      // Or disable ESLint during builds if you want to fix later:
      ignoreDuringBuilds: true,
    },
  }
  
  module.exports = nextConfig
  