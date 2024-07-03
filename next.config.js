/** @type {import('next').NextConfig} */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig = {
  output: 'standalone',
  basePath: process.env.BASE_PATH,
  eslint: {
    dirs: ['src', '__tests__'],
  },
}

module.exports = withBundleAnalyzer(nextConfig)
