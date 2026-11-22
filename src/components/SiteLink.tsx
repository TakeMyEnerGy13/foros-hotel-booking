import Link from 'next/link'
import type { ComponentProps } from 'react'
import { showcase, sitePath } from '@/lib/site-path'

export default function SiteLink({ href, ...props }: ComponentProps<'a'> & { href: string }) {
  if (!showcase) return <Link href={href} {...props} />
  const path = href.replace(/^(\/[^?#]*?[^/?#])(?=[?#]|$)/, '$1/')
  return <a href={sitePath(path)} {...props} />
}
