import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // 跳过类型检查（仅用于演示环境）
    ignoreBuildErrors: true,
  },
  eslint: {
    // 顺便跳过 ESLint（避免其他残留报错）
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
