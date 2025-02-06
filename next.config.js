/* eslint-disable @typescript-eslint/no-require-imports */
/** @type {import('next').NextConfig} */

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const removeImports = require('next-remove-imports')()

const nextConfig = {
  output: 'standalone',
  basePath: process.env.BASE_PATH,
  images: {
    unoptimized: true,
  },
  experimental: {
    esmExternals: true,
    reactCompiler: true,
  },
}

module.exports =
  process.env.ANALYZE === 'true' ? withBundleAnalyzer(removeImports(nextConfig)) : removeImports(nextConfig)
