/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',              // Enables static export
  trailingSlash: true,           // Avoids route 404s on Netlify
  reactStrictMode: true,
  images: {
    unoptimized: true,           // Skip image optimization (Netlify handles static)
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'http', hostname: 'source.unsplash.com' },
      { protocol: 'https', hostname: 'ugc.same-assets.com' },
      { protocol: 'https', hostname: 'ext.same-assets.com' },
      { protocol: 'https', hostname: 'preview.same.app' }
    ],
  },
};

module.exports = nextConfig;