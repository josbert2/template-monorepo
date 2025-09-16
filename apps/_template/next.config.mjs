/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@clarity/design-system",
    "@clarity/ui",
  ],
  // host image
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "assets.aceternity.com" },
      { protocol: "https", hostname: "fortify-astro.vercel.app" },
    ],
  },
};

export default nextConfig;