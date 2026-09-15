/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // No ESLint config shipped; type-safety is enforced by `npm run typecheck` + CI.
  eslint: { ignoreDuringBuilds: true },
  async headers() {
    // Mini apps are embedded in Farcaster/Base clients — must be framable.
    return [{ source: "/:path*", headers: [{ key: "X-Frame-Options", value: "ALLOWALL" }] }];
  },
};
export default nextConfig;
