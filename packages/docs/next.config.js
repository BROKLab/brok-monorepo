/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
}
const withMDX = require('@next/mdx')()
module.exports = withMDX()
module.exports = nextConfig
