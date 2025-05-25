/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'm.media-amazon.com' },
      { protocol: 'https', hostname: 'coverartarchive.org' },
      { protocol: 'https', hostname: 'covers.openlibrary.org' },
      { protocol: 'https', hostname: 's4.anilist.co' },
      { protocol: 'https', hostname: 'is1-ssl.mzstatic.com' },
    ],
    domains: ['res.cloudinary.com', 'is1-ssl.mzstatic.com'],
    formats: ['image/avif', 'image/webp'],
  },
  // Enable compression
  compress: true,
  // Enable production source maps for better debugging
  productionBrowserSourceMaps: false,
  // Optimize bundle size
  swcMinify: true,
  // Enable static page optimization
  poweredByHeader: false,
  // Configure caching
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
};
module.exports = nextConfig; 