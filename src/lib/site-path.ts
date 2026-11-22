export const siteBase = process.env.NEXT_PUBLIC_SITE_BASE_PATH ?? ''
export const showcase = process.env.NEXT_PUBLIC_HOTEL_SHOWCASE === 'true'

export function sitePath(path: string) {
  return path.startsWith('/') ? siteBase + path : path
}
