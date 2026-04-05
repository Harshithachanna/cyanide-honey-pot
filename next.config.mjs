/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // We need to allow cross-origin requests for the honeypot script
  async headers() {
    return [
      {
        source: "/api/detonate",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "POST, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
        ]
      },
      {
        source: "/honeypot.js",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" }
        ]
      }
    ];
  }
};

export default nextConfig;
