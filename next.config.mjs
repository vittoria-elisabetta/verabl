/** @type {import('next').NextConfig} */
// Static export: the whole site is plain HTML/JS/JSON, hostable on GitHub Pages.
// No server, no API routes, no runtime AI.
//
// PAGES_BASE_PATH is set by the GitHub Pages workflow: '' when a custom domain (verable.io) is used,
// '/<repo>' while the site is served from <user>.github.io/<repo>/.
const basePath = process.env.PAGES_BASE_PATH || ''

const nextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
