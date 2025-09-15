/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@acme/ui", "@acme/config", "@acme/tailwind-preset"],
  output: "export"
};

export default nextConfig;