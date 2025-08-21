/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // <--- super important
  distDir: 'out',   // tells Next.js to export static HTML into /out
};

module.exports = nextConfig;
