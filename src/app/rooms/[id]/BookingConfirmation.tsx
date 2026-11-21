'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { bookingContact } from '@/lib/booking-contact'
import { guestHoldHours } from '@/lib/booking-hold'
import type { Stay } from '@/lib/stay'

export type GuestReceipt = Stay & { id: number; holdExpiresAt: string }

export default function BookingConfirmation({ receipt, ru }: { receipt: GuestReceipt; ru: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const details = useRef<HTMLButtonElement>(null)
  const title = useId()
  const [elapsed, setElapsed] = useState(false)
  const locale = ru ? 'ru-RU' : 'en-GB'
  const stay = new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: 'UTC' })
    .formatRange(new Date(receipt.checkIn), new Date(receipt.checkOut))
  const deadline = new Intl.DateTimeFormat(locale, {
    day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Moscow',
  }).format(new Date(receipt.holdExpiresAt))
  const call = ru ? 'Позвонить Ольге' : 'Call Olga'

  useEffect(() => {
    dialog.current?.showModal()
    const timer = window.setTimeout(() => setElapsed(true), Math.max(0, Date.parse(receipt.holdExpiresAt) - Date.now()))
    return () => window.clearTimeout(timer)
  }, [receipt.holdExpiresAt])

  return (
    <section id="booking" className="booking-panel booking-receipt" role="status">
      <h2>{ru ? 'Заявка принята' : 'Request received'}</h2>
      <p>{stay}</p>
      <button type="button" ref={details} className="solid" aria-haspopup="dialog" onClick={() => dialog.current?.showModal()}>
        {ru ? 'Детали заявки' : 'Request details'}
      </button>
      <dialog ref={dialog} className="hold-dialog" aria-labelledby={title} onClose={() => details.current?.focus()}>
        <header>
          <span>{ru ? 'Заявка №' : 'Request #'}{receipt.id}</span>
          <button type="button" className="hold-close" aria-label={ru ? 'Закрыть' : 'Close'} onClick={() => dialog.current?.close()}>×</button>
        </header>
        <h2 id={title}>{elapsed ? (ru ? 'Срок резерва прошёл' : 'The hold period has ended') : (ru ? 'Даты за вами' : 'Your dates are on hold')}</h2>
        <p className="hold-stay">{stay}</p>
        {elapsed ? (
          <p>{ru ? 'Если вы уже подтвердили бронь с Ольгой, всё в порядке. Если ещё не успели, позвоните ей и уточните, свободен ли номер.' : 'If Olga has already confirmed your booking, you’re all set. Otherwise, call her to check whether the room is still available.'}</p>
        ) : (
          <>
            <p>{ru ? `Мы держим номер для вас ${guestHoldHours} часа. Позвоните Ольге до ` : `We’ll hold the room for ${guestHoldHours} hours. Please call Olga by `}
              <strong><time dateTime={receipt.holdExpiresAt}>{deadline}</time>{ru ? ' (МСК)' : ' (Moscow time)'}</strong>.
            </p>
            <p>{ru ? 'Назовите своё имя и даты поездки. Ольга уточнит детали и подтвердит бронь. Без подтверждения резерв снимется автоматически.' : 'Give her your name and travel dates. Olga will go over the details and confirm your booking. Unconfirmed dates are released automatically.'}</p>
          </>
        )}
        <a className="hold-call solid" href={bookingContact.href}><span>{call}</span><span>{bookingContact.phone}</span></a>
      </dialog>
    </section>
  )
}
