'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { bookingContact } from '@/lib/booking-contact'
import type { GuestReceipt } from '@/lib/guest-receipts'

function secondsUntil(deadline: number) {
  return Math.max(0, Math.ceil((deadline - Date.now()) / 1000))
}

export default function BookingConfirmation({ receipt, ru, autoOpen, onClose, refresh }: {
  receipt: GuestReceipt; ru: boolean; autoOpen: boolean; onClose: () => void; refresh: () => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const details = useRef<HTMLButtonElement>(null)
  const title = useId()
  const pending = receipt.status === 'pending'
  const deadline = pending && receipt.holdExpiresAt ? Date.parse(receipt.holdExpiresAt) : null
  const [seconds, setSeconds] = useState<number | null>(null)
  const checking = deadline !== null && seconds === 0
  const countdown = seconds === null ? '—' : [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60]
    .map(part => String(part).padStart(2, '0')).join(':')
  const call = ru ? 'Позвонить Ольге' : 'Call Olga'
  const titles: Record<string, string> = ru
    ? { confirmed: 'Бронь подтверждена', cancelled: 'Бронь отменена', expired: 'Время резерва истекло', pending: 'Даты за вами' }
    : { confirmed: 'Booking confirmed', cancelled: 'Booking cancelled', expired: 'Hold period ended', pending: 'Your dates are on hold' }
  const label = checking ? (ru ? 'Уточняем статус заявки' : 'Checking booking status') : titles[receipt.status]

  useEffect(() => {
    if (autoOpen && !dialog.current?.open) dialog.current?.showModal()
  }, [autoOpen])

  useEffect(() => {
    if (deadline === null) return
    const tick = () => {
      const remaining = secondsUntil(deadline)
      setSeconds(remaining)
      if (!remaining) {
        window.clearInterval(timer)
        refresh()
      }
    }
    const timer = window.setInterval(tick, 1000)
    tick()
    document.addEventListener('visibilitychange', tick)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [deadline, refresh])

  return (
    <section className="booking-receipt">
      <h3>{label}</h3>
      <p>{receipt.stayLabel}</p>
      <button type="button" ref={details} className="solid" aria-haspopup="dialog" onClick={() => { dialog.current?.showModal(); refresh() }}>
        {ru ? 'Детали заявки' : 'Request details'}
      </button>
      <dialog ref={dialog} className="hold-dialog" aria-labelledby={title} onClose={() => { onClose(); details.current?.focus() }}>
        <header>
          <h2 id={title}>{label}</h2>
          <button type="button" className="hold-close" aria-label={ru ? 'Закрыть' : 'Close'} onClick={() => dialog.current?.close()}>×</button>
        </header>
        <p className="hold-stay">{receipt.stayLabel}</p>
        {deadline !== null && !checking && <div className="hold-countdown">
          <span>{ru ? 'До конца резерва' : 'Time left to confirm'}</span>
          <strong role="timer" aria-live="off" aria-label={ru ? 'Оставшееся время' : 'Time remaining'}>{countdown}</strong>
        </div>}
        {pending && !checking && <p>{ru ? 'Чтобы подтвердить бронь, позвоните Ольге и назовите своё имя и даты поездки.' : 'To confirm, call Olga with your name and travel dates.'}</p>}
        {receipt.status === 'expired' && <p>{ru ? 'Уточните у Ольги, свободен ли номер на эти даты.' : 'Ask Olga whether the room is still available.'}</p>}
        <a className="hold-call solid" href={bookingContact.href}><span>{call}</span><span>{bookingContact.phone}</span></a>
      </dialog>
    </section>
  )
}
