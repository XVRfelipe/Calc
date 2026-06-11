/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // Necessário para evitar bloqueio de assets do Next em ambiente dev (proxy/origem diferente).
  allowedDevOrigins: ["localhost", "127.0.0.1", "192.168.64.9", "192.168.64.86"],
};

export default nextConfig;
