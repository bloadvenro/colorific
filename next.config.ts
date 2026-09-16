import type { NextConfig } from 'next';

const pagesPath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

const nextConfig: NextConfig = {
  assetPrefix: pagesPath || undefined,
  output: 'export',
  trailingSlash: true,
};

export default nextConfig;
