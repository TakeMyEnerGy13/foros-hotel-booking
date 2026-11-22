'use client'

import { useEffect, useSyncExternalStore } from 'react'
import HotelHome from '@/components/HotelHome'
import RoomCatalog from '@/components/RoomCatalog'
import RoomDetail from '@/components/RoomDetail'
import BookingCalendar from '@/app/rooms/[id]/BookingCalendar'
import { datesFromQuery, hotelToday, overlaps, validStay } from '@/lib/stay'
import { rooms, sampleBookings } from './rooms'

const subscribe = () => () => {}
const browserLocale = () => document.cookie.split('; ').includes('locale=en') ? 'en' : 'ru'
const browserQuery = () => window.location.search

export default function Preview({ page, roomId, buildDay }: {
  page: 'home' | 'catalog' | 'room'
  roomId?: number
  buildDay: string
}) {
  const locale = useSyncExternalStore(subscribe, browserLocale, () => 'ru')
  const today = useSyncExternalStore(subscribe, hotelToday, () => buildDay)
  const query = useSyncExternalStore(subscribe, browserQuery, () => '')
  useEffect(() => { document.documentElement.lang = locale }, [locale])

  if (page === 'home') return <HotelHome rooms={rooms} locale={locale} today={today} />

  const params = new URLSearchParams(query)
  function parameter(name: string) {
    const values = params.getAll(name)
    return values.length > 1 ? values : values[0]
  }
  const queryDates = { checkIn: parameter('checkIn'), checkOut: parameter('checkOut') }
  const requested = datesFromQuery(queryDates)
  if (page === 'catalog') {
    const results = rooms.map(room => ({ ...room, bookings: sampleBookings(room.id, today) }))
    return <RoomCatalog rooms={results} queryDates={queryDates} today={today} locale={locale} />
  }

  const room = rooms.find(room => room.id === roomId)!
  const bookings = sampleBookings(room.id, today)
  const upcoming = validStay(requested.checkIn, requested.checkOut) && requested.checkIn >= today
  const initialStay = upcoming && !bookings.some(stay => overlaps(stay, requested)) ? requested : undefined
  return <RoomDetail room={room} requested={requested} locale={locale} calendar={
    <BookingCalendar key={[room.id, today, query].join('/')} roomId={room.id} today={today}
      locale={locale} price={room.price} bookings={bookings} receipts={[]}
      initialDay={upcoming ? requested.checkIn : today} initialStay={initialStay} />
  } />
}
