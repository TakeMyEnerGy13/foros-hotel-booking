'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { calendarDay } from '@/lib/stay'

interface Booking {
  id: number
  roomId: number
  checkIn: string
  checkOut: string
  guestName: string
  guestPhone: string
  guestEmail: string
  notes: string
  status: string
  room: { name: string }
}

interface Room {
  id: number
  name: string
}

const MONTHS = [
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

export default function AdminCalendarClient() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [bookings, setBookings] = useState<Booking[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [editBooking, setEditBooking] = useState<Booking | null>(null)
  const [addRoomId, setAddRoomId] = useState<number | null>(null)
  const [form, setForm] = useState({
    checkIn: '',
    checkOut: '',
    guestName: '',
    guestPhone: '',
    notes: '',
    status: 'confirmed',
  })
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)

  const [error, setError] = useState('')
  const loadData = useCallback(async () => {
    try {
      const [roomsResponse, bookingsResponse] = await Promise.all([
        fetch('/api/rooms'),
        fetch('/api/admin/bookings'),
      ])
      if (bookingsResponse.status === 401) {
        window.location.replace('/admin-login')
        return
      }
      if (!roomsResponse.ok || !bookingsResponse.ok) throw new Error()
      setRooms(await roomsResponse.json())
      setBookings(await bookingsResponse.json())
    } catch {
      setError('Не удалось загрузить календарь')
    }
  }, [])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  const getBookingForDay = (roomId: number, day: number) => {
    const key = calendarDay(new Date(year, month, day))
    return bookings.find(
      (b) =>
        b.roomId === roomId &&
        b.status !== 'cancelled' &&
        key >= b.checkIn.slice(0, 10) &&
        key < b.checkOut.slice(0, 10)
    )
  }

  const openAdd = (roomId: number, day: number) => {
    setError('')
    setEditBooking(null)
    setAddRoomId(roomId)
    setForm({
      checkIn: calendarDay(new Date(year, month, day)),
      checkOut: calendarDay(new Date(year, month, day + 1)),
      guestName: '',
      guestPhone: '',
      notes: '',
      status: 'confirmed',
    })
    setShowModal(true)
  }

  const openEdit = (booking: Booking) => {
    setError('')
    setEditBooking(booking)
    setAddRoomId(null)
    setForm({
      checkIn: booking.checkIn.slice(0, 10),
      checkOut: booking.checkOut.slice(0, 10),
      guestName: booking.guestName,
      guestPhone: booking.guestPhone || '',
      notes: booking.notes || '',
      status: booking.status,
    })
    setShowModal(true)
  }

  const submitChange = async (method: 'PUT' | 'POST' | 'DELETE') => {
    if (method === 'DELETE' && !confirm('Удалить бронь?')) return
    setLoading(true)
    setError('')
    try {
      const url = editBooking ? '/api/admin/bookings/' + editBooking.id : '/api/admin/bookings'
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body:
          method === 'DELETE'
            ? undefined
            : JSON.stringify({
                ...form,
                roomId: editBooking?.roomId ?? addRoomId,
                guestEmail: editBooking?.guestEmail ?? '',
              }),
      })
      if (!response.ok) {
        const detail = await response.json().catch(() => null)
        setError(detail?.error || 'Не удалось изменить бронь')
        return
      }
      setShowModal(false)
      await loadData()
    } catch {
      setError('Не удалось связаться с сервером')
    } finally {
      setLoading(false)
    }
  }

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11)
      setYear((y) => y - 1)
    } else setMonth((m) => m - 1)
  }
  const nextMonth = () => {
    if (month === 11) {
      setMonth(0)
      setYear((y) => y + 1)
    } else setMonth((m) => m + 1)
  }

  return (
    <main className="operations">
      <nav className="ops-nav">
        <Link className="wordmark" href="/">
          берег радости
        </Link>
        <Link className="pill" href="/admin/bookings">
          Все бронирования ↗
        </Link>
      </nav>
      <header className="ops-heading">
        <span className="label">Панель администратора</span>
        <h1>Календарь</h1>
      </header>
      <div className="ops-toolbar">
        <h2>
          {MONTHS[month]} {year}
        </h2>
        <div>
          <button className="pill" onClick={prevMonth} aria-label="Предыдущий месяц">
            ←
          </button>{' '}
          <button className="pill" onClick={nextMonth} aria-label="Следующий месяц">
            →
          </button>
        </div>
      </div>
      <div className="ops-scroll">
        <table className="occupancy">
          <thead>
            <tr>
              <th>Номер</th>
              {days.map((day) => (
                <th key={day}>{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr key={room.id}>
                <th scope="row">{room.name}</th>
                {days.map((day) => {
                  const booked = getBookingForDay(room.id, day)
                  const date = calendarDay(new Date(year, month, day))
                  return (
                    <td key={day}>
                      <button
                        className={booked ? 'busy' : ''}
                        aria-label={
                          room.name + ', ' + date + ', ' + (booked ? booked.guestName : 'свободно')
                        }
                        onClick={() => (booked ? openEdit(booked) : openAdd(room.id, day))}
                      >
                        {booked?.guestName.split(' ')[0] ?? '·'}
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="label cal-key">○ Свободно　● Занято</p>
      {error && !showModal && <p role="alert">{error}</p>}
      {showModal && (
        <BookingDialog onClose={() => setShowModal(false)}>
          <span className="label">
            {editBooking?.room.name ?? rooms.find((r) => r.id === addRoomId)?.name}
          </span>
          <h2>{editBooking ? 'Редактировать бронь' : 'Новая бронь'}</h2>
          <form
            className="ops-form"
            onSubmit={(e) => {
              e.preventDefault()
              void submitChange(editBooking ? 'PUT' : 'POST')
            }}
          >
            <div className="ops-dates">
              <label>
                Заезд
                <input
                  type="date"
                  required
                  value={form.checkIn}
                  onChange={(e) => setForm({ ...form, checkIn: e.target.value })}
                />
              </label>
              <label>
                Выезд
                <input
                  type="date"
                  required
                  value={form.checkOut}
                  onChange={(e) => setForm({ ...form, checkOut: e.target.value })}
                />
              </label>
            </div>
            <label>
              Имя гостя
              <input
                required
                placeholder="Иван Иванов"
                value={form.guestName}
                onChange={(e) => setForm({ ...form, guestName: e.target.value })}
              />
            </label>
            <label>
              Телефон
              <input
                type="tel"
                value={form.guestPhone}
                onChange={(e) => setForm({ ...form, guestPhone: e.target.value })}
              />
            </label>
            <label>
              Заметка
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </label>
            <label>
              Статус
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="confirmed">Подтверждена</option>
                <option value="pending">Ожидает</option>
                <option value="cancelled">Отменена</option>
              </select>
            </label>
            {error && <p role="alert">{error}</p>}
            <div className="ops-actions">
              {editBooking && (
                <button
                  type="button"
                  className="pill"
                  disabled={loading}
                  onClick={() => submitChange('DELETE')}
                >
                  Удалить
                </button>
              )}
              <button type="button" className="pill" onClick={() => setShowModal(false)}>
                Отмена
              </button>
              <button type="submit" className="solid" disabled={loading}>
                {loading ? 'Сохранение…' : editBooking ? 'Сохранить' : 'Добавить бронь'}
              </button>
            </div>
          </form>
        </BookingDialog>
      )}
    </main>
  )
}

function BookingDialog({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = ref.current
    dialog?.showModal()
    return () => dialog?.close()
  }, [])
  return (
    <dialog
      ref={ref}
      className="ops-dialog"
      aria-label="Бронирование"
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose()
      }}
    >
      <div>{children}</div>
    </dialog>
  )
}
