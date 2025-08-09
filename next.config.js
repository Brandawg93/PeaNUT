/* eslint-disable @typescript-eslint/no-require-imports */
/** @type {import('next').NextConfig} */

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig = {
  output: 'standalone',
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
