/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/uploads/**',
      },
    ],
    // Allow localhost images in development
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    unoptimized: process.env.NODE_ENV === 'development',
  },
  experimental: {
    scrollRestoration: true,
  },
  async rewrites() {
    return [
      {
        source: '/products/:path*',
        destination: 'http://localhost:5000/uploads/products/:path*',
      },
    ];
  },
}

module.exports = nextConfig
