'use client'
import { sitePath } from '@/lib/site-path'
import { useRef } from 'react'
import ContactServices from './ContactServices'
import { bookingContact } from '@/lib/booking-contact'

export default function ContactsPopup({ locale }: { locale: string }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const ru = locale === 'ru'
  return (
    <>
      <button
        ref={trigger} type="button" aria-haspopup="dialog"
        onClick={() => dialog.current?.showModal()}
        style={{fontFamily: "'Inter', sans-serif", background: 'none', border: 'none', cursor: 'pointer'}}
        className="text-white/80 hover:text-white text-sm transition-colors w-full text-left"
      >
        {ru ? 'Контакты' : 'Contacts'}
      </button>
      <dialog ref={dialog} className="contacts-popup" aria-label={ru ? 'Контакты' : 'Contacts'}
        onClose={() => trigger.current?.focus({ preventScroll: true })}
        onKeyDown={(event) => { if (event.key === 'Escape') event.stopPropagation() }}
        onClick={(event) => {
          if (event.target !== event.currentTarget) return
          const bounds = event.currentTarget.getBoundingClientRect()
          if (event.clientX < bounds.left || event.clientX > bounds.right ||
              event.clientY < bounds.top || event.clientY > bounds.bottom) event.currentTarget.close()
        }}
      >
        <div className="contacts-popup-header">
          <div className="contacts-popup-identity">
            <img src={sitePath('/logo.png')} alt="logo" style={{width: '56px', height: '56px'}} />
            <div>
              <h2 style={{fontFamily: "'DM Serif Display', serif", fontSize: '24px', fontWeight: 'bold', margin: 0}}>Берег Радости</h2>
              <p style={{fontFamily: "'Inter', sans-serif", fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: '4px 0 0 0'}}>{locale === 'ru' ? 'Форос · Крым · Южный берег' : 'Foros · Crimea · Southern Coast'}</p>
            </div>
          </div>
          <button type="button" aria-label={ru ? 'Закрыть контакты' : 'Close contacts'} onClick={() => dialog.current?.close()} style={{width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.5)', fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>x</button>
        </div>
        <div className="contacts-popup-body">
          <a href={bookingContact.href} className="contacts-popup-phone">
            <div style={{width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0}}>📞</div>
            <div style={{display: 'flex', flexDirection: 'column', gap: '2px'}}>
              <div style={{fontFamily: "'DM Serif Display', serif", fontSize: '18px', color: 'white'}}>{bookingContact.name[ru ? 'ru' : 'en']}</div>
              <div style={{fontFamily: "'Inter', sans-serif", fontSize: '15px', fontWeight: '400', color: 'rgba(255,255,255,0.5)'}}>{bookingContact.phone}</div>
            </div>
          </a>
          <ContactServices locale={locale} />
        </div>
      </dialog>
    </>
  )
}
