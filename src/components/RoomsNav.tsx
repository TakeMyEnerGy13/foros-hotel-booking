'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import LanguageSwitcher from './LanguageSwitcher'

export default function RoomsNav({ locale }: { locale: string }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        transition: 'background 0.3s ease, backdrop-filter 0.3s ease',
        background: scrolled ? 'rgba(15, 15, 15, 0.75)' : '#1a1a1a',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div style={{maxWidth: '1280px', margin: '0 auto', padding: '0 32px', height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <Link href="/" style={{display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none'}}>
          <img src="/logo.png" alt="Берег Радости" style={{width: '36px', height: '36px'}} />
          <span style={{fontFamily: "'DM Serif Display', serif", fontSize: '18px', color: 'white'}}>
            Берег Радости
          </span>
        </Link>
        <div style={{display: 'flex', alignItems: 'center', gap: '32px'}}>
          <Link href="/" style={{color: 'rgba(255,255,255,0.6)', fontSize: '12px', textTransform: 'uppercase', textDecoration: 'none', fontFamily: "'Inter', sans-serif"}}
            onMouseEnter={e => (e.currentTarget.style.color = 'white')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
          >
            {locale === 'ru' ? 'Главная' : 'Home'}
          </Link>
          <Link href="/rooms" style={{color: 'white', fontSize: '12px', textTransform: 'uppercase', textDecoration: 'none', fontFamily: "'Inter', sans-serif", borderBottom: '1px solid rgba(245,158,11,0.7)', paddingBottom: '2px'}}>
            {locale === 'ru' ? 'Номера' : 'Rooms'}
          </Link>
          <LanguageSwitcher currentLocale={locale} />
        </div>
      </div>
    </nav>
  )
}