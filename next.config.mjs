/** @type {import('next').NextConfig} */
const nextConfig = {
  // หน้าเว็บคือไฟล์เดียว public/index.html (ตามสเปก) ให้ "/" แสดงไฟล์นั้น
  async rewrites() {
    return {
      beforeFiles: [{ source: "/", destination: "/index.html" }],
    };
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "same-origin" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
};
export default nextConfig;
