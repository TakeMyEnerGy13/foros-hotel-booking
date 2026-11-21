'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { calendarDay, overlaps, toggleStayNight, type Stay } from '@/lib/stay'

interface Props {
  roomId: number
  locale: string
  today: string
  initialStay?: Stay
  price: number
  bookings: Stay[]
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

export default function BookingCalendar({ roomId, today, locale, price, bookings, initialStay }: Props) {
  const ru = locale !== 'en'
  const router = useRouter()
  const [viewDate, setViewDate] = useState(() => {
    const [year, month] = (initialStay?.checkIn ?? today).split('-').map(Number)
    return new Date(year, month - 1, 1)
  })
  const [mode, setMode] = useState<'range' | 'nights'>('range')
  const [pendingArrival, setPendingArrival] = useState('')
  const [selectedStays, setSelectedStays] = useState<Stay[]>(initialStay ? [initialStay] : [])
  const stay = selectedStays.length === 1 ? selectedStays[0] : undefined
  const checkIn = stay?.checkIn ?? pendingArrival
  const checkOut = stay?.checkOut ?? ''
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const isBooked = (day: string) => bookings.some((b) => b.checkIn <= day && day < b.checkOut)
  const canEndOn = (day: string) => !bookings.some(b => overlaps(b, { checkIn: pendingArrival, checkOut: day }))

  function switchMode(next: 'range' | 'nights') {
    if (next === mode) return
    if (next === 'nights' && pendingArrival) {
      setSelectedStays(toggleStayNight([], pendingArrival))
      setPendingArrival('')
    }
    setMode(next)
    setError('')
  }

  const handleDayClick = (day: string) => {
    if (day < today) return
    setError('')
    if (mode === 'nights') {
      if (!isBooked(day)) setSelectedStays(stays => toggleStayNight(stays, day))
    } else if (pendingArrival && day > pendingArrival) {
      if (canEndOn(day)) {
        setSelectedStays([{ checkIn: pendingArrival, checkOut: day }])
        setPendingArrival('')
      } else setError(ru ? 'В выбранном диапазоне есть занятые ночи' : 'Some nights are already booked')
    } else if (!isBooked(day)) {
      setSelectedStays([])
      setPendingArrival(day)
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
    setError('')
    if (!checkIn || !checkOut || !guestName || !guestEmail || !guestPhone) {
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
      if (!res.ok) {
        setError(data.error || 'Ошибка при бронировании')
      } else {
        setSuccess(true)
        router.refresh()
      }
    } catch {
      setError(ru ? 'Ошибка соединения' : 'Could not connect')
    } finally {
      setLoading(false)
    }
  }

  if (success)
    return (
      <section id="booking" className="booking-panel" role="status">
        <span className="label">{ru ? 'Бронирование' : 'Reservation'}</span>
        <h2>{ru ? 'Заявка принята' : 'Request received'}</h2>
        <p>
          {checkIn} → {checkOut}
        </p>
        <p>
          {ru
            ? 'Бронирование ожидает подтверждения администратора.'
            : 'Your reservation is awaiting confirmation.'}
        </p>
      </section>
    )

  const monthName = ru ? MONTHS_RU[month] : viewDate.toLocaleString('en-GB', { month: 'long' })
  const weekdays = ru ? DAYS_RU : ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
  let instruction = ru ? 'Выберите дату заезда, затем дату выезда.' : 'Choose your check-in day, then your check-out day.'
  if (mode === 'nights') {
    instruction = selectedStays.length > 1
      ? (ru ? 'Для одной брони выберите ночи подряд.' : 'Choose consecutive nights for one stay.')
      : (ru ? 'Нажмите на ночь, чтобы выбрать её или снять выбор.' : 'Tap each night to select or deselect it.')
  } else if (pendingArrival) {
    instruction = ru ? 'Выберите день выезда. Эта ночь не входит в бронь.' : 'Choose your check-out day. That night is excluded.'
  }
  return (
    <section
      className="booking-panel"
      id="booking"
      aria-label={ru ? 'Календарь бронирования' : 'Booking calendar'}
    >
      <h2>{ru ? 'Забронировать номер' : 'Book your stay'}</h2>
      <div className="cal-modes" role="group" aria-label={ru ? 'Способ выбора дат' : 'Date selection mode'}>
        <button type="button" aria-pressed={mode === 'range'} onClick={() => switchMode('range')}>
          {ru ? 'Заезд и выезд' : 'Check-in and out'}
        </button>
        <button type="button" aria-pressed={mode === 'nights'} onClick={() => switchMode('nights')}>
          {ru ? 'По ночам' : 'Pick nights'}
        </button>
      </div>
      <p className="cal-instruction" aria-live="polite">{instruction}</p>
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
          const choosingCheckout = Boolean(pendingArrival && ds > pendingArrival)
          const crossesBooking = choosingCheckout && !canEndOn(ds)
          const selected = ds === pendingArrival || (mode === 'range' && ds === checkOut)
            || selectedStays.some(period => period.checkIn <= ds && ds < period.checkOut)
          const booked = isBooked(ds) && (!choosingCheckout || crossesBooking) && !selected
          const past = ds < today
          return (
            <button
              key={ds}
              type="button"
              aria-label={ds}
              aria-pressed={selected}
              aria-current={ds === today ? 'date' : undefined}
              aria-disabled={crossesBooking || undefined}
              disabled={past || booked}
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
      <form
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
        <label>
          <span className="sr-only">{ru ? 'Телефон' : 'Phone'}</span>
          <input
            type="tel"
            autoComplete="tel"
            placeholder={ru ? 'Телефон' : 'Phone'}
            required
            value={guestPhone}
            onChange={(e) => setGuestPhone(e.target.value)}
          />
        </label>
        {error && <p role="alert">{error}</p>}
        <button type="submit" className="solid" disabled={loading || !checkIn || !checkOut}>
          {loading
            ? ru
              ? 'Отправляем…'
              : 'Sending…'
            : nights > 0
              ? (ru ? 'Забронировать · ' : 'Book · ') +
                (nights * price).toLocaleString(ru ? 'ru-RU' : 'en-GB') +
                ' ₽'
              : ru
                ? 'Выберите даты'
                : 'Select dates'}
        </button>
      </form>
    </section>
  )
}
