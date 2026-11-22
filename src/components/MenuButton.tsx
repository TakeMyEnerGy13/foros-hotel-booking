'use client'

import { useRef, useState } from 'react'
import Link from './SiteLink'
import ContactsPopup from './ContactsPopup'
import styles from './HomeHero.module.css'

export default function MenuButton({ locale }: { locale: string }) {
  const [open, setOpen] = useState(false)
  const toggle = useRef<HTMLButtonElement>(null)
  const ru = locale === 'ru'

  return (
    <div className={styles.menu} onKeyDown={(event) => {
      if (open && event.key === 'Escape' && event.currentTarget.contains(event.target as Node)) {
        setOpen(false)
        toggle.current?.focus()
      }
    }}>
      <button ref={toggle} type="button" className={styles.menuToggle}
        aria-expanded={open} aria-controls="hotel-menu" onClick={() => setOpen(!open)}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
          <path d={open ? 'M5 5l14 14M19 5 5 19' : 'M3 8h18M3 16h13'} />
        </svg>
        {ru ? 'Меню' : 'Menu'}
      </button>
      <div id="hotel-menu" hidden={!open} className={styles.menuPanel}>
        <Link href="/" onClick={() => setOpen(false)}>{ru ? 'Главная' : 'Home'}</Link>
        <Link href="/rooms" onClick={() => setOpen(false)}>{ru ? 'Номера' : 'Rooms'}</Link>
        <ContactsPopup locale={locale} />
      </div>
    </div>
  )
}
