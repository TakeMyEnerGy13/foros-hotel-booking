const basePath = process.env.PAGES_BASE_PATH ?? ''

const config = {
  output: 'export',
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  env: {
    NEXT_PUBLIC_HOTEL_SHOWCASE: 'true',
    NEXT_PUBLIC_SITE_BASE_PATH: basePath,
  },
}

export default config
