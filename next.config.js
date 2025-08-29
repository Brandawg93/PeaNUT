/* eslint-disable @typescript-eslint/no-require-imports */
/** @type {import('next').NextConfig} */

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig = {
  output: 'standalone',
  // Disable typedRoutes so custom next-ws exports like UPGRADE are allowed
  typedRoutes: false,
  images: {
    unoptimized: true,
  },
  turbopack: {
    rules: {
      // Configure any specific rules for your project here
    },
  },
}

module.exports = process.env.ANALYZE === 'true' ? withBundleAnalyzer(nextConfig) : nextConfig
