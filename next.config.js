/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    return [
      {
        source: '/api/coins',
        destination: `${backendUrl}/coins`,
      },
      {
        source: '/api/coins/:path*',
        destination: `${backendUrl}/coins/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
