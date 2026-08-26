/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: process.cwd(),
  // Media is pre-optimised (WebP + JPG fallback + width variants) by
  // scripts/generate_media.py, so we serve it directly with <img srcset>.
  images: { unoptimized: true },
  async headers() {
    const media =
      process.env.NODE_ENV === 'production'
        ? 'public, max-age=31536000, immutable'
        : 'no-store';
    return [
      { source: '/media/:path*', headers: [{ key: 'Cache-Control', value: media }] },
    ];
  },
};

export default nextConfig;
