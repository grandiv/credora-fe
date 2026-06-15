/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/demo",
        destination: "https://credora-2.gitbook.io/credora-docs/",
        permanent: false,
      },
      {
        source: "/demo/:path*",
        destination: "https://credora-2.gitbook.io/credora-docs/:path*",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
