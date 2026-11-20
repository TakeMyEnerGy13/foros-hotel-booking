import Link from 'next/link'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { validStay, overlapFilter, hotelToday } from '@/lib/stay'
import RoomsNav from '@/components/RoomsNav'
import HotelFooter from '@/components/HotelFooter'
import StaySearch from '@/components/StaySearch'
import RoomTile from '@/components/RoomTile'

interface Props {
  searchParams: Promise<{ checkIn?: string; checkOut?: string }>
}

export default async function RoomsPage({ searchParams }: Props) {
  const ru = (await cookies()).get('locale')?.value !== 'en'
  const locale = ru ? 'ru' : 'en'
  const { checkIn = '', checkOut = '' } = await searchParams
  const searching = validStay(checkIn, checkOut) && checkIn >= hotelToday()
  const [rooms, conflicts] = await Promise.all([
    prisma.room.findMany({ orderBy: { id: 'asc' } }),
    searching
      ? prisma.booking.findMany({ where: overlapFilter(checkIn, checkOut), select: { roomId: true } })
      : [],
  ])
  const busy = new Set(conflicts.map((b) => b.roomId))
  const available = rooms.filter((room) => !busy.has(room.id))
  const unavailable = rooms.filter((room) => busy.has(room.id))
  const query = searching ? '?' + new URLSearchParams({ checkIn, checkOut }) : ''
  return (
    <div id="top" className="hotel">
      <RoomsNav locale={locale} booking="#stay" />
      <main>
        <header className="catalog-heading">
          <span className="label">{ru ? 'Проживание · Форос' : 'Accommodation · Foros'}</span>
          <h1>{ru ? 'Наши номера' : 'Our rooms'}</h1>
        </header>
        <StaySearch locale={locale} checkIn={checkIn} checkOut={checkOut} />
        <section className="editorial catalog">
          {searching && (
            <p className="search-result">
              {ru ? 'Свободно номеров' : 'Available rooms'} — {available.length} / {rooms.length}.{' '}
              <Link href="/rooms">{ru ? 'Сбросить даты' : 'Clear dates'}</Link>
            </p>
          )}
          {(checkIn || checkOut) && !searching && (
            <p className="search-result" role="alert">
              {ru ? 'Проверьте даты. Показаны все номера.' : 'Check your dates. Showing all rooms.'}
            </p>
          )}
          <div className="room-grid">
            {available.map((room) => (
              <RoomTile key={room.id} room={room} locale={locale} query={query} />
            ))}
          </div>
          {unavailable.length > 0 && (
            <>
              <h2 className="subheading">{ru ? 'Заняты на эти даты' : 'Unavailable for these dates'}</h2>
              <div className="room-grid">
                {unavailable.map((room) => (
                  <RoomTile key={room.id} room={room} locale={locale} query={query} unavailable />
                ))}
              </div>
            </>
          )}
        </section>
      </main>
      <HotelFooter locale={locale} />
    </div>
  )
}
