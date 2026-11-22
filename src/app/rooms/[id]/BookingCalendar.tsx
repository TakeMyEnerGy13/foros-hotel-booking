'use client'
import { useCallback, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

import { showcase } from '@/lib/site-path'
import { calendarDay, stayForNights, type Stay } from '@/lib/stay'
import BookingConfirmation from './BookingConfirmation'
import type { GuestReceipt } from '@/lib/guest-receipts'
import useVisibleRefresh from '@/components/useVisibleRefresh'
import GuestPhoneInput from './GuestPhoneInput'

interface Props {
  roomId: number
  locale: string
  today: string
  initialDay: string
  initialStay?: Stay
  price: number
  bookings: Stay[]
  receipts: GuestReceipt[]
}

const MONTHS_RU = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
]
const DAYS_RU = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

export default function BookingCalendar({ roomId, today, locale, price, bookings, receipts, initialDay, initialStay }: Props) {
  const ru = locale !== 'en'
  const router = useRouter()
  const [refreshing, startRefresh] = useTransition()
  const [viewDate, setViewDate] = useState(() => {
    const [year, month] = initialDay.split('-').map(Number)
    return new Date(year, month - 1, 1)
  })
  const [selection, setSelection] = useState(initialStay ? { ...initialStay, anchor: initialStay.checkIn } : undefined)
  const [crossesBooking, setCrossesBooking] = useState(false)
  const checkIn = selection?.checkIn ?? ''
  const checkOut = selection?.checkOut ?? ''
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [openReceiptId, setOpenReceiptId] = useState<number>()
  const [justCreated, setJustCreated] = useState<GuestReceipt>()
  const restored = justCreated && receipts.some(receipt => receipt.id === justCreated.id)
  if (restored) setJustCreated(undefined)
  const visibleReceipts = justCreated && !restored ? [justCreated, ...receipts] : receipts
  const refreshStatus = useCallback(() => router.refresh(), [router])
  useVisibleRefresh(refreshStatus, visibleReceipts.length > 0)

  const isBooked = (day: string) => bookings.some((b) => b.checkIn <= day && day < b.checkOut)
  const isSelected = (day: string) => checkIn <= day && day < checkOut

  const handleDayClick = (day: string) => {
    if (day < today || isBooked(day)) return
    setError('')
    if (isSelected(day)) {
      setSelection(undefined)
      setCrossesBooking(false)
      return
    }
    const anchor = selection?.anchor ?? day
    const stay = stayForNights(anchor, day, bookings)
    setCrossesBooking(!stay)
    if (stay) {
      setSelection({ ...stay, anchor })
    }
  }

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  let startDow = firstDay.getDay() - 1
  if (startDow < 0) startDow = 6

  const days: (Date | null)[] = []
  for (let i = 0; i < startDow; i++) days.push(null)
  for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d))

  const nights =
    checkIn && checkOut
      ? Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000)
      : 0

  const handleSubmit = async () => {
    if (showcase) return
    setError('')
    if (crossesBooking || !checkIn || !checkOut || !guestName || !guestEmail || !guestPhone) {
      setError(ru ? 'Заполните все поля и выберите даты' : 'Enter your details and select your dates')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, guestName, guestEmail, guestPhone, checkIn, checkOut }),
      })
      const data = await res.json()
      if (res.status === 409) {
        setSelection(undefined)
        setCrossesBooking(false)
        setError(ru ? 'Эти даты уже заняты. Выберите другие ночи.' : 'These dates have just been booked. Please choose other nights.')
        startRefresh(() => router.refresh())
      } else if (!res.ok) {
        setError(data.error || 'Ошибка при бронировании')
      } else {
        setJustCreated(data)
        setOpenReceiptId(data.id)
        setSelection(undefined)
        setGuestName('')
        setGuestEmail('')
        setGuestPhone('')
        refreshStatus()
      }
    } catch {
      setError(ru ? 'Ошибка соединения' : 'Could not connect')
    } finally {
      setLoading(false)
    }
  }

  const monthName = ru ? MONTHS_RU[month] : viewDate.toLocaleString('en-GB', { month: 'long' })
  const weekdays = ru ? DAYS_RU : ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
  return (
    <section
      className="booking-panel"
      id="booking"
      aria-label={ru ? 'Календарь бронирования' : 'Booking calendar'}
    >
      {visibleReceipts.map(receipt => (
        <BookingConfirmation key={receipt.id} receipt={receipt} ru={ru} autoOpen={openReceiptId === receipt.id}
          onClose={() => setOpenReceiptId(undefined)} refresh={refreshStatus} />
      ))}
      <h2>{showcase ? (ru ? 'Календарь номера' : 'Room calendar') : (ru ? 'Забронировать номер' : 'Book your stay')}</h2>
      <div className="cal-month">
        <button
          type="button"
          aria-label={ru ? 'Предыдущий месяц' : 'Previous month'}
          onClick={() => setViewDate(new Date(year, month - 1, 1))}
        >
          ←
        </button>
        <strong aria-live="polite">
          {monthName} {year}
        </strong>
        <button
          type="button"
          aria-label={ru ? 'Следующий месяц' : 'Next month'}
          onClick={() => setViewDate(new Date(year, month + 1, 1))}
        >
          →
        </button>
      </div>
      <div className="calendar-grid">
        {weekdays.map((d) => (
          <span className="label weekday" key={d}>
            {d}
          </span>
        ))}
        {days.map((date, i) => {
          if (!date) return <span key={'blank-' + i} />
          const ds = calendarDay(date)
          const booked = isBooked(ds)
          const selected = !booked && isSelected(ds)
          const past = ds < today
          return (
            <button
              key={ds}
              type="button"
              aria-label={ds}
              aria-pressed={selected}
              aria-current={ds === today ? 'date' : undefined}
              disabled={past || booked || loading || refreshing}
              className={[
                'cal-day',
                past && 'past',
                selected && 'selected',
                booked && 'booked',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => handleDayClick(ds)}
            >
              {date.getDate()}
            </button>
          )
        })}
      </div>
      {crossesBooking && (
        <p className="cal-conflict" role="alert">
          {ru ? 'В этом периоде есть занятые ночи. Выберите другой период.' : 'This stay includes booked nights. Choose a different period.'}
        </p>
      )}
      {showcase ? (
        <div className="demo-stay" aria-live="polite">
          {nights > 0 && !crossesBooking && (
            <strong>{ru ? 'Стоимость проживания' : 'Stay total'} · {(nights * price).toLocaleString(ru ? 'ru-RU' : 'en-GB')} ₽</strong>
          )}
          <p>{ru ? 'Демонстрационный календарь. Выбор дат не создаёт бронь.' : 'Demo calendar. Selecting dates does not make a reservation.'}</p>
        </div>
      ) : <form
        className="guest-form"
        onSubmit={(e) => {
          e.preventDefault()
          void handleSubmit()
        }}
      >
        <label>
          <span className="sr-only">{ru ? 'Ваше имя' : 'Your name'}</span>
          <input
            type="text"
            autoComplete="name"
            placeholder={ru ? 'Ваше имя' : 'Your name'}
            value={guestName}
            required
            onChange={(e) => setGuestName(e.target.value)}
          />
        </label>
        <label>
          <span className="sr-only">Email</span>
          <input
            type="email"
            autoComplete="email"
            placeholder="Email"
            required
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
          />
        </label>
        <GuestPhoneInput value={guestPhone} onChange={setGuestPhone} ru={ru} />
        {error && <p role="alert">{error}</p>}
        <button type="submit" className="solid" disabled={loading || refreshing || crossesBooking || !selection}>
          {loading
            ? ru
              ? 'Отправляем…'
              : 'Sending…'
            : nights > 0 && !crossesBooking
              ? (ru ? 'Забронировать · ' : 'Book · ') +
                (nights * price).toLocaleString(ru ? 'ru-RU' : 'en-GB') +
                ' ₽'
              : ru
                ? 'Выберите даты'
                : 'Select dates'}
        </button>
      </form>}
    </section>
  )
}
