/** @type {import('next').NextConfig} */
// /home/nzela37/Kwizera/Projects/uru-ruziga/next.config.js
const nextConfig = {
  // Set explicit workspace root to avoid lockfile confusion
  outputFileTracingRoot: __dirname,
  
  // Bypass TypeScript errors during build (remove once all translation keys are synced)
  typescript: {
    // ignoreBuildErrors: true, // Enabled strict checking
  },

  // Ensure custom font files are served with correct headers
  async headers() {
    return [
      {
        source: '/:path*.ttf',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
          { key: 'Content-Type', value: 'font/ttf' },
        ],
      },
      {
        source: '/:path*.woff',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
          { key: 'Content-Type', value: 'font/woff' },
        ],
      },
      {
        source: '/:path*.woff2',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
          { key: 'Content-Type', value: 'font/woff2' },
        ],
      },
      {
        source: '/:path*.otf',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
          { key: 'Content-Type', value: 'font/otf' },
        ],
      },
    ]
  },
}

module.exports = nextConfig