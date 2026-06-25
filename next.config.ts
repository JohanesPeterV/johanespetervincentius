import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // REASON: dev server gets its own distDir so `next build` (-> .next) never clobbers
  // the running `next dev` manifests, which caused ENOENT app-build-manifest crashes.
  distDir: process.env.NEXT_DIST_DIR ?? '.next',
  experimental: {
    turbo: {
      resolveAlias: {
        canvas: './empty-module.ts',
      },
    },
  },
};

export default nextConfig;
