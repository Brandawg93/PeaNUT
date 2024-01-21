/** @type {import('next').NextConfig} */

const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
  })
  
const nextConfig = {
    output: 'standalone',
    basePath: process.env.BASE_PATH,
    eslint: {
        dirs: ['src', '__tests__'],
    },
};

module.exports = withBundleAnalyzer(nextConfig);
