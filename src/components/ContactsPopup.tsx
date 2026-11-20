'use client'
import { useState } from 'react'
import { createPortal } from 'react-dom'

export default function ContactsPopup({ locale }: { locale: string }) {
  const [open, setOpen] = useState(false)
  const cardStyle = {
    background: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.10)',
    borderRadius: '16px',
  }

  const modal = open ? createPortal(
    <div
      style={{position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'}}
      onClick={() => setOpen(false)}
    >
      <div style={{position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)'}} />
      <div
        onClick={(e) => e.stopPropagation()}
        style={{position: 'relative', width: '100%', maxWidth: '480px', color: 'white', zIndex: 10, background: 'rgba(15,15,15,0.95)', backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '28px', boxShadow: '0 24px 80px rgba(0,0,0,0.6)'}}
      >
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '28px 32px', borderBottom: '1px solid rgba(255,255,255,0.08)'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
            <img src="/logo.png" alt="logo" style={{width: '56px', height: '56px'}} />
            <div>
              <h2 style={{fontFamily: "'DM Serif Display', serif", fontSize: '24px', fontWeight: 'bold', margin: 0}}>Берег Радости</h2>
              <p style={{fontFamily: "'Inter', sans-serif", fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: '4px 0 0 0'}}>{locale === 'ru' ? 'Форос · Крым · Южный берег' : 'Foros · Crimea · Southern Coast'}</p>
            </div>
          </div>
          <button onClick={() => setOpen(false)} style={{width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.5)', fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>x</button>
        </div>
        <div style={{padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '12px'}}>
          <a href="tel:+79780000000" style={{...cardStyle, display: 'flex', alignItems: 'center', gap: '16px', padding: '18px 20px', textDecoration: 'none'}}>
            <div style={{width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0}}>📞</div>
            <div style={{display: 'flex', flexDirection: 'column', gap: '2px'}}>
              <div style={{fontFamily: "'DM Serif Display', serif", fontSize: '18px', color: 'white'}}>Ольга</div>
              <div style={{fontFamily: "'Inter', sans-serif", fontSize: '15px', fontWeight: '400', color: 'rgba(255,255,255,0.5)'}}>+7 (978) 000-00-00</div>
            </div>
          </a>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px'}}>
            <a href="#" style={{...cardStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '20px', textDecoration: 'none', minHeight: '100px'}}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L8.32 14.617l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.496.969z"/></svg>
              <span style={{fontFamily: "'Inter', sans-serif", fontSize: '13px', color: 'rgba(255,255,255,0.6)'}}>Telegram</span>
            </a>
            <a href="#" style={{...cardStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '20px', textDecoration: 'none', minHeight: '100px'}}>
              <img src="/max-icon.png" alt="MAX" style={{width: '28px', height: '28px', borderRadius: '6px', objectFit: 'cover'}} />
              <span style={{fontFamily: "'Inter', sans-serif", fontSize: '13px', color: 'rgba(255,255,255,0.6)'}}>MAX</span>
            </a>
            <a href="#" style={{...cardStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '20px', textDecoration: 'none', minHeight: '100px'}}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
              <span style={{fontFamily: "'Inter', sans-serif", fontSize: '13px', color: 'rgba(255,255,255,0.6)'}}>{locale === 'ru' ? 'Яндекс Карты' : 'Yandex Maps'}</span>
            </a>
          </div>
        </div>
      </div>
    </div>,
    document.body
  ) : null

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{fontFamily: "'Inter', sans-serif", background: 'none', border: 'none', cursor: 'pointer'}}
        className="text-white/80 hover:text-white text-sm uppercase transition-colors w-full text-left"
      >
        {locale === 'ru' ? 'Контакты' : 'Contacts'}
      </button>
      {modal}
    </>
  )
}