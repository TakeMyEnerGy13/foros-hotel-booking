'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { calendarDay, overlaps, type Stay } from '@/lib/stay'

interface Props {
  roomId: number
  today: string
  initialStay?: Stay
  price: number
  bookings: Stay[]
}

const MONTHS_RU = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь']
const DAYS_RU = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс']

export default function BookingCalendar({ roomId, today, price, bookings, initialStay }: Props) {
  const router = useRouter()
  const [viewDate, setViewDate] = useState(() => {
    const [year, month] = (initialStay?.checkIn ?? today).split('-').map(Number)
    return new Date(year, month - 1, 1)
  })
  const [checkIn, setCheckIn] = useState(initialStay?.checkIn ?? '')
  const [checkOut, setCheckOut] = useState(initialStay?.checkOut ?? '')
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const isBooked = (day: string) => bookings.some(b => b.checkIn <= day && day < b.checkOut)
  const selectingEnd = Boolean(checkIn && !checkOut)
  const canEndOn = (day: string) => selectingEnd && day > checkIn &&
    !bookings.some(b => overlaps(b, { checkIn, checkOut: day }))

  const handleDayClick = (day: string) => {
    if (day < today) return
    setError('')
    if (selectingEnd && day > checkIn) {
      if (canEndOn(day)) setCheckOut(day)
      else setError('В выбранном диапазоне есть занятые ночи')
    } else if (!isBooked(day)) {
      setCheckIn(day)
      setCheckOut('')
    }
  }

  // Строим дни для отображения
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  let startDow = firstDay.getDay() - 1
  if (startDow < 0) startDow = 6

  const days: (Date | null)[] = []
  for (let i = 0; i < startDow; i++) days.push(null)
  for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d))

  const nights = checkIn && checkOut
    ? Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000)
    : 0

  const handleSubmit = async () => {
    setError('')
    if (!checkIn || !checkOut || !guestName || !guestEmail || !guestPhone) {
      setError('Заполните все поля и выберите даты')
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
      setError('Ошибка соединения')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h3 className="text-2xl font-bold text-green-800 mb-2">Заявка принята</h3>
        <p className="text-green-700 mb-1">Заезд: {checkIn}</p>
        <p className="text-green-700 mb-4">Выезд: {checkOut}</p>
        <p className="text-gray-600 text-sm">Бронирование ожидает подтверждения администратора.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Заголовок */}
      <div className="bg-stone-800 text-white p-5">
        <h3 className="text-lg font-semibold tracking-wide mb-1">Забронировать номер</h3>
        <p className="text-stone-400 text-sm">{price.toLocaleString('ru-RU')} ₽ / ночь</p>
      </div>

      {/* Легенда */}
      <div className="flex gap-4 px-5 py-3 bg-stone-50 border-b border-stone-100 text-xs font-sans">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-green-100 border border-green-300" />
          <span className="text-stone-500">Свободно</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-100 border border-red-300" />
          <span className="text-stone-500">Занято</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-amber-400" />
          <span className="text-stone-500">Выбрано</span>
        </div>
      </div>

      {/* Навигация по месяцам */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
        <button
          onClick={() => setViewDate(new Date(year, month - 1, 1))}
          className="text-stone-400 hover:text-stone-800 transition-colors px-2 py-1 font-sans text-lg"
        >
          ‹
        </button>
        <span className="font-semibold text-stone-800 tracking-wide font-sans">
          {MONTHS_RU[month]} {year}
        </span>
        <button
          onClick={() => setViewDate(new Date(year, month + 1, 1))}
          className="text-stone-400 hover:text-stone-800 transition-colors px-2 py-1 font-sans text-lg"
        >
          ›
        </button>
      </div>

      {/* Дни недели */}
      <div className="grid grid-cols-7 px-5 pt-3">
        {DAYS_RU.map(d => (
          <div key={d} className="text-center text-xs text-stone-400 font-sans font-medium pb-2">{d}</div>
        ))}
      </div>

      {/* Календарь */}
      <div className="grid grid-cols-7 gap-1 px-5 pb-5">
        {days.map((date, i) => {
          if (!date) return <div key={i} />
          const ds = calendarDay(date)
          const booked = isBooked(ds) && !canEndOn(ds)
          const past = ds < today
          const isStart = ds === checkIn
          const isEnd = ds === checkOut
          const inRange = Boolean(checkIn && checkOut && ds > checkIn && ds < checkOut)
          const isToday = ds === today

          let cls = 'relative flex items-center justify-center h-9 text-sm font-sans rounded-lg transition-all duration-150 '

          if ((past || booked) && !isEnd) {
            cls += booked
              ? 'bg-red-50 text-red-300 cursor-not-allowed line-through'
              : 'text-stone-300 cursor-not-allowed'
          } else if (isStart || isEnd) {
            cls += 'bg-amber-400 text-black font-bold cursor-pointer'
          } else if (inRange) {
            cls += 'bg-amber-100 text-amber-800 cursor-pointer'
          } else {
            cls += 'bg-green-50 text-green-700 hover:bg-green-200 cursor-pointer'
            if (isToday) cls += ' ring-2 ring-green-400'
          }

          return (
            <button type="button" key={i} aria-label={ds} disabled={past || (booked && !isEnd)} className={cls} onClick={() => handleDayClick(ds)}>
              {date.getDate()}
            </button>
          )
        })}
      </div>

      {/* Выбранные даты */}
      {(checkIn || checkOut) && (
        <div className="mx-5 mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg font-sans text-sm flex justify-between items-center">
          <div>
            <span className="text-stone-500">Заезд: </span>
            <span className="font-semibold text-stone-800">{checkIn || '—'}</span>
            <span className="mx-3 text-stone-300">→</span>
            <span className="text-stone-500">Выезд: </span>
            <span className="font-semibold text-stone-800">{checkOut || '—'}</span>
          </div>
          {nights > 0 && (
            <span className="text-amber-700 font-bold">
              {(nights * price).toLocaleString('ru-RU')} ₽
            </span>
          )}
        </div>
      )}

      {/* Форма */}
      <div className="px-5 pb-5 space-y-3">
        <input
          type="text"
          placeholder="Ваше имя"
          value={guestName}
          onChange={e => setGuestName(e.target.value)}
          className="w-full border border-stone-200 rounded-lg px-3 py-2.5 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
        />
        <input
          type="email"
          placeholder="Email"
          value={guestEmail}
          onChange={e => setGuestEmail(e.target.value)}
          className="w-full border border-stone-200 rounded-lg px-3 py-2.5 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
        />
        <input
          type="tel"
          placeholder="Телефон"
          value={guestPhone}
          onChange={e => setGuestPhone(e.target.value)}
          className="w-full border border-stone-200 rounded-lg px-3 py-2.5 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
        />

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm font-sans">
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading || !checkIn || !checkOut}
          className="w-full bg-stone-800 hover:bg-stone-700 disabled:bg-stone-300 text-white font-sans font-semibold py-3 rounded-lg transition-colors text-sm tracking-wide"
        >
          {loading ? 'Бронируем...' : nights > 0 ? `Забронировать · ${(nights * price).toLocaleString('ru-RU')} ₽` : 'Выберите даты'}
        </button>
      </div>
    </div>
  )
}