/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@clarity/design-system",
    "@clarity/ui",
  ],
};

export default nextConfig;