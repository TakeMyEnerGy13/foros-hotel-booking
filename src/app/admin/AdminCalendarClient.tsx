'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import styles from './AdminAppearance.module.css'
import { calendarDay } from '@/lib/stay'
import useVisibleRefresh from '@/components/useVisibleRefresh'

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
  holdExpiresAt: string | null
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
  const [loadError, setLoadError] = useState('')
  const request = useRef<AbortController | null>(null)
  const loadData = useCallback(async (afterEdit = false) => {
    if (request.current && !afterEdit) return
    request.current?.abort()
    const controller = new AbortController()
    request.current = controller
    const options = { signal: controller.signal, cache: 'no-store' as const }
    try {
      const [roomsResponse, bookingsResponse] = await Promise.all([
        fetch('/api/rooms', options),
        fetch('/api/admin/bookings', options),
      ])
      if (bookingsResponse.status === 401) {
        window.location.replace('/admin-login')
        return
      }
      if (!roomsResponse.ok || !bookingsResponse.ok) throw new Error()
      const [rooms, bookings] = await Promise.all([roomsResponse.json(), bookingsResponse.json()])
      if (controller.signal.aborted) return
      setRooms(rooms)
      setBookings(bookings)
      setLoadError('')
    } catch {
      if (!controller.signal.aborted) setLoadError('Не удалось обновить календарь')
    } finally {
      if (request.current === controller) request.current = null
    }
  }, [])

  useEffect(() => {
    void loadData()
    return () => { request.current?.abort(); request.current = null }
  }, [loadData])
  useVisibleRefresh(loadData)

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  const getBookingForDay = (roomId: number, day: number) => {
    const key = calendarDay(new Date(year, month, day))
    return bookings.find(
      (b) =>
        b.roomId === roomId &&
        b.status !== 'cancelled' &&
        b.status !== 'expired' &&
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
      await loadData(true)
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

  const inputStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    padding: '10px 14px',
    color: 'white',
    fontFamily: "'Inter', sans-serif",
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box' as const,
  }

  const labelStyle = {
    fontFamily: "'Inter', sans-serif",
    fontSize: '11px',
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase' as const,
    marginBottom: '6px',
    display: 'block',
  }

  return (
    <main className={styles.surface} style={{minHeight: '100vh', background: '#0f0f0f', color: 'white', fontFamily: "'Inter', sans-serif"}}>
      <div className={styles.bar} style={{borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
          <Image src="/logo.png" alt="" width={40} height={40} />
          <div>
            <h1 style={{fontFamily: "'DM Serif Display', serif", fontSize: '22px', margin: 0}}>Берег Радости</h1>
            <p style={{fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: 0}}>Панель администратора</p>
          </div>
        </div>
        <div style={{display: 'flex', gap: '12px'}}>
          <Link href="/admin/bookings" className={styles.navLink}>Все бронирования</Link>
          <Link href="/" className={styles.navLink}>На сайт</Link>
        </div>
      </div>

      <div className={styles.bar} style={{padding: '24px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
          <button aria-label="Предыдущий месяц" onClick={prevMonth} style={{width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer', fontSize: '16px'}}>←</button>
          <h2 style={{fontFamily: "'DM Serif Display', serif", fontSize: '28px', margin: 0}}>{MONTHS[month]} {year}</h2>
          <button aria-label="Следующий месяц" onClick={nextMonth} style={{width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer', fontSize: '16px'}}>→</button>
        </div>
        <div style={{display: 'flex', gap: '16px', fontSize: '12px', color: 'rgba(255,255,255,0.4)'}}>
          <span style={{display: 'flex', alignItems: 'center', gap: '6px'}}><span style={{width: '12px', height: '12px', borderRadius: '3px', background: 'rgba(245,158,11,0.7)', display: 'inline-block'}}></span>Занято</span>
          <span style={{display: 'flex', alignItems: 'center', gap: '6px'}}><span style={{width: '12px', height: '12px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)', display: 'inline-block'}}></span>Свободно</span>
        </div>
      </div>

      <div style={{padding: '0 32px 32px', overflowX: 'auto'}}>
        <table style={{width: '100%', borderCollapse: 'collapse', minWidth: '900px'}}>
          <thead>
            <tr>
              <th style={{width: '160px', padding: '8px 12px', textAlign: 'left', fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 500, borderBottom: '1px solid rgba(255,255,255,0.06)'}}>Номер</th>
              {days.map(d => {
                const dow = new Date(year, month, d).getDay()
                const isWeekend = dow === 0 || dow === 6
                return <th key={d} style={{padding: '8px 2px', textAlign: 'center', fontSize: '11px', color: isWeekend ? 'rgba(245,158,11,0.7)' : 'rgba(255,255,255,0.4)', fontWeight: 500, borderBottom: '1px solid rgba(255,255,255,0.06)', minWidth: '30px'}}>{d}</th>
              })}
            </tr>
          </thead>
          <tbody>
            {rooms.map(room => (
              <tr key={room.id} style={{borderBottom: '1px solid rgba(255,255,255,0.04)'}}>
                <td style={{padding: '8px 12px', fontSize: '13px', color: 'rgba(255,255,255,0.8)', fontWeight: 500, whiteSpace: 'nowrap'}}>
                  <div style={{fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginBottom: '2px'}}>№{room.id}</div>
                  {room.name}
                </td>
                {days.map(d => {
                  const booking = getBookingForDay(room.id, d)
                  const isToday = new Date(year, month, d).toDateString() === new Date().toDateString()
                  return (
                    <td key={d} style={{padding: '3px', textAlign: 'center'}}>
                      <button
                        type="button"
                        aria-label={room.name + ', ' + calendarDay(new Date(year, month, d)) + ', ' + (booking?.guestName ?? 'свободно')}
                        onClick={() => booking ? openEdit(booking) : openAdd(room.id, d)}
                        style={{width: '100%', height: '34px', borderRadius: '6px', background: booking ? 'rgba(245,158,11,0.25)' : 'rgba(255,255,255,0.03)', border: isToday ? '1px solid rgba(245,158,11,0.6)' : '1px solid transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s'}}
                        onMouseEnter={e => (e.currentTarget.style.background = booking ? 'rgba(245,158,11,0.45)' : 'rgba(255,255,255,0.08)')}
                        onMouseLeave={e => (e.currentTarget.style.background = booking ? 'rgba(245,158,11,0.25)' : 'rgba(255,255,255,0.03)')}
                      >
                        {booking && <span style={{fontSize: '9px', color: 'rgba(255,255,255,0.9)', overflow: 'hidden', maxWidth: '26px', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{booking.guestName.split(' ')[0]}</span>}
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {loadError && <p role="alert" className="px-8 text-red-300">{loadError}</p>}
      {showModal && (
        <BookingDialog onClose={() => setShowModal(false)}>
          <form onSubmit={event => { event.preventDefault(); void submitChange(editBooking ? 'PUT' : 'POST') }}>
            <div style={{padding: '24px 28px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <div>
                <h3 style={{fontFamily: "'DM Serif Display', serif", fontSize: '20px', margin: 0}}>{editBooking ? 'Редактировать бронь' : 'Новая бронь'}</h3>
                {(editBooking || addRoomId) && <p style={{fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: '4px 0 0 0'}}>{editBooking ? editBooking.room.name : rooms.find(r => r.id === addRoomId)?.name}</p>}
              </div>
              <button type="button" aria-label="Закрыть" onClick={() => setShowModal(false)} style={{background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '22px', cursor: 'pointer'}}>×</button>
            </div>
            <div style={{padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '16px'}}>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
                <div>
                  <label htmlFor="booking-check-in" style={labelStyle}>Дата заезда</label>
                  <input id="booking-check-in" required type="date" value={form.checkIn} onChange={e => setForm(f => ({...f, checkIn: e.target.value}))} style={{...inputStyle, colorScheme: 'dark'}} />
                </div>
                <div>
                  <label htmlFor="booking-check-out" style={labelStyle}>Дата выезда</label>
                  <input id="booking-check-out" required type="date" value={form.checkOut} onChange={e => setForm(f => ({...f, checkOut: e.target.value}))} style={{...inputStyle, colorScheme: 'dark'}} />
                </div>
              </div>
              <div>
                <label htmlFor="booking-guest" style={labelStyle}>Имя гостя</label>
                <input id="booking-guest" required type="text" placeholder="Иван Иванов" value={form.guestName} onChange={e => setForm(f => ({...f, guestName: e.target.value}))} style={inputStyle} />
              </div>
              <div>
                <label htmlFor="booking-phone" style={labelStyle}>Телефон</label>
                <input id="booking-phone" type="tel" placeholder="+7 (978) 000-00-00" value={form.guestPhone} onChange={e => setForm(f => ({...f, guestPhone: e.target.value}))} style={inputStyle} />
              </div>
              <div>
                <label htmlFor="booking-notes" style={labelStyle}>Заметка</label>
                <textarea id="booking-notes" placeholder="Пожелания, комментарии..." value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} style={{...inputStyle, height: '80px', resize: 'none'}} />
              </div>
              <div>
                <label htmlFor="booking-status" style={labelStyle}>Статус</label>
                <select id="booking-status" value={form.status} onChange={e => setForm(f => ({...f, status: e.target.value}))} style={{...inputStyle, cursor: 'pointer'}}>
                  <option value="confirmed">Подтверждена</option>
                  <option value="pending">Ожидает</option>
                  <option value="cancelled">Отменена</option>
                </select>
              </div>
            </div>
            {error && <p role="alert" className="px-7 text-red-300">{error}</p>}
            <div style={{padding: '16px 28px 24px', display: 'flex', gap: '10px'}}>
              {editBooking && <button type="button" onClick={() => submitChange('DELETE')} disabled={loading} style={{padding: '12px 20px', borderRadius: '12px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: 'rgb(239,68,68)', cursor: 'pointer', fontSize: '13px', fontFamily: "'Inter', sans-serif"}}>Удалить</button>}
              <button type="button" onClick={() => setShowModal(false)} style={{flex: 1, padding: '12px 20px', borderRadius: '12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: '13px', fontFamily: "'Inter', sans-serif"}}>Отмена</button>
              <button type="submit" disabled={loading} style={{flex: 2, padding: '12px 20px', borderRadius: '12px', background: 'rgba(245,158,11,0.9)', border: 'none', color: 'black', cursor: 'pointer', fontSize: '13px', fontWeight: 600, fontFamily: "'Inter', sans-serif"}}>{loading ? 'Сохранение...' : editBooking ? 'Сохранить' : 'Добавить бронь'}</button>
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
      className={styles.dialog}
      aria-label="Бронирование"
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose()
      }}
    >
      {children}
    </dialog>
  )
}
