'use client'

import { Fragment, useEffect, useRef } from 'react'

export default function FooterWordmark({ locale }: { locale: string }) {
  const linkRef = useRef<HTMLAnchorElement>(null)
  const ru = locale !== 'en'
  const name = ru ? 'Берег Радости' : 'Shore of Joy'

  useEffect(() => {
    const link = linkRef.current
    if (!link || !('IntersectionObserver' in window)) return

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      link.classList.add('is-revealed')
      observer.disconnect()
    }, { threshold: 0.15 })

    observer.observe(link)
    return () => observer.disconnect()
  }, [])

  return (
    <a ref={linkRef} className="home-footer-name" href="#top" lang={ru ? 'ru' : 'en'}
      aria-label={name + (ru ? ' — наверх' : ' — back to top')}>
      {name.split(' ').map((word, index) => (
        <Fragment key={word}>
          {index > 0 && ' '}<span>{word}</span>
        </Fragment>
      ))}
    </a>
  )
}
