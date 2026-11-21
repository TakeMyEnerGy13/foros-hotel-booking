'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { bookingContact } from '@/lib/booking-contact'
import type { Stay } from '@/lib/stay'

export type GuestReceipt = Stay & { holdExpiresAt: string }

function secondsUntil(deadline: number) {
  return Math.max(0, Math.ceil((deadline - Date.now()) / 1000))
}

export default function BookingConfirmation({ receipt, ru }: { receipt: GuestReceipt; ru: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const details = useRef<HTMLButtonElement>(null)
  const title = useId()
  const deadline = Date.parse(receipt.holdExpiresAt)
  const [seconds, setSeconds] = useState(() => secondsUntil(deadline))
  const elapsed = seconds === 0
  const locale = ru ? 'ru-RU' : 'en-GB'
  const stay = new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: 'UTC' })
    .formatRange(new Date(receipt.checkIn), new Date(receipt.checkOut))
  const countdown = [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60]
    .map(part => String(part).padStart(2, '0')).join(':')
  const call = ru ? 'Позвонить Ольге' : 'Call Olga'

  useEffect(() => {
    dialog.current?.showModal()
    const tick = () => {
      const remaining = secondsUntil(deadline)
      setSeconds(remaining)
      if (!remaining) window.clearInterval(timer)
    }
    const timer = window.setInterval(tick, 1000)
    document.addEventListener('visibilitychange', tick)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [deadline])

  return (
    <section id="booking" className="booking-panel booking-receipt">
      <h2>{ru ? 'Заявка принята' : 'Request received'}</h2>
      <p>{stay}</p>
      <button type="button" ref={details} className="solid" aria-haspopup="dialog" onClick={() => dialog.current?.showModal()}>
        {ru ? 'Детали заявки' : 'Request details'}
      </button>
      <dialog ref={dialog} className="hold-dialog" aria-labelledby={title} onClose={() => details.current?.focus()}>
        <header>
          <h2 id={title}>{elapsed ? (ru ? 'Время резерва истекло' : 'Hold period ended') : (ru ? 'Даты за вами' : 'Your dates are on hold')}</h2>
          <button type="button" className="hold-close" aria-label={ru ? 'Закрыть' : 'Close'} onClick={() => dialog.current?.close()}>×</button>
        </header>
        <p className="hold-stay">{stay}</p>
        <div className="hold-countdown">
          <span>{ru ? 'До конца резерва' : 'Time left to confirm'}</span>
          <strong role="timer" aria-live="off" aria-label={ru ? 'Оставшееся время' : 'Time remaining'}>{countdown}</strong>
        </div>
        <p>{elapsed
          ? (ru ? 'Не успели подтвердить? Уточните у Ольги, свободен ли номер.' : 'Still need to confirm? Ask Olga whether the room is available.')
          : (ru ? 'Чтобы подтвердить бронь, позвоните Ольге и назовите своё имя и даты поездки.' : 'To confirm, call Olga with your name and travel dates.')}</p>
        <a className="hold-call solid" href={bookingContact.href}><span>{call}</span><span>{bookingContact.phone}</span></a>
      </dialog>
    </section>
  )
}
