/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/demo",
        destination: "/app",
        permanent: false,
      },
      {
        source: "/demo/:path*",
        destination: "/app/:path*",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
