'use client'
import { useState } from 'react'
import ContactIcon from './ContactIcon'
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
              <ContactIcon service="telegram" />
              <span style={{fontFamily: "'Inter', sans-serif", fontSize: '13px', color: 'rgba(255,255,255,0.6)'}}>Telegram</span>
            </a>
            <a href="#" style={{...cardStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '20px', textDecoration: 'none', minHeight: '100px'}}>
              <ContactIcon service="max" />
              <span style={{fontFamily: "'Inter', sans-serif", fontSize: '13px', color: 'rgba(255,255,255,0.6)'}}>MAX</span>
            </a>
            <a href="#" style={{...cardStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '20px', textDecoration: 'none', minHeight: '100px'}}>
              <ContactIcon service="maps" />
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
        className="text-white/80 hover:text-white text-sm transition-colors w-full text-left"
      >
        {locale === 'ru' ? 'Контакты' : 'Contacts'}
      </button>
      {modal}
    </>
  )
}