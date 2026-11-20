'use client'
import { useState } from 'react'
import Link from 'next/link'
import ContactsPopup from './ContactsPopup'

export default function MenuButton({ locale, glassStyle }: { locale: string, glassStyle: React.CSSProperties }) {
  const [open, setOpen] = useState(false)

  const links = locale === 'ru'
    ? [
        { href: '/', label: 'Главная' },
        { href: '/rooms', label: 'Номера' },
      ]
    : [
        { href: '/', label: 'Home' },
        { href: '/rooms', label: 'Rooms' },
      ]

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        style={{...glassStyle, borderRadius: '16px'}}
        className="px-4 py-2 flex items-center gap-3 cursor-pointer hover:bg-white/15 transition-all"
      >
        <span className="text-white text-lg">{open ? '✕' : '☰'}</span>
        <span className="text-white text-xs uppercase" style={{fontFamily: "'Inter', sans-serif"}}>
          {locale === 'ru' ? 'Меню' : 'Menu'}
        </span>
      </button>

      {open && (
        <div
          style={{...glassStyle, borderRadius: '16px'}}
          className="absolute top-14 left-0 py-3 min-w-[200px]"
        >
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block px-6 py-3 text-white/80 hover:text-white hover:bg-white/10 transition-all text-sm uppercase"
              style={{fontFamily: "'Inter', sans-serif"}}
            >
              {link.label}
            </Link>
          ))}
          <div className="px-6 py-3 border-t border-white/10 mt-1">
            <ContactsPopup locale={locale} />
          </div>
        </div>
      )}
    </div>
  )
}