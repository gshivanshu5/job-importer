/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/api/:path*', // 🔁 Proxy to Express
      },
    ];
  },
};

export default nextConfig;
