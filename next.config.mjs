/** @type {import('next').NextConfig} */
const nextConfig = {
  // Nothing here uses next/image, so the image optimizer is only attack surface: Next 14's has an
  // unauthenticated RCE when it decodes a crafted AVIF (GHSA-2xp9-vwfh-vxw4, fixed from 15.5.24).
  images: { unoptimized: true },
  reactStrictMode: true,
  // No ESLint config shipped; type-safety is enforced by `npm run typecheck` + CI.
  eslint: { ignoreDuringBuilds: true },
  async headers() {
    // Mini apps are embedded in Farcaster/Base clients — must be framable.
    return [{ source: "/:path*", headers: [{ key: "X-Frame-Options", value: "ALLOWALL" }] }];
  },
};
export default nextConfig;
