import Link from 'next/link'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { datesFromQuery, freeStaysWithin, validStay, overlapFilter, hotelToday, type Stay, type StayQuery } from '@/lib/stay'
import RoomsNav from '@/components/RoomsNav'
import HotelFooter from '@/components/HotelFooter'
import StaySearch from '@/components/StaySearch'
import RoomTile from '@/components/RoomTile'

interface Props {
  searchParams: Promise<StayQuery>
}

export default async function RoomsPage({ searchParams }: Props) {
  const ru = (await cookies()).get('locale')?.value !== 'en'
  const locale = ru ? 'ru' : 'en'
  const queryDates = await searchParams
  const requested = datesFromQuery(queryDates)
  const { checkIn, checkOut } = requested
  const hasDates = Boolean(queryDates.checkIn || queryDates.checkOut)
  const searching = validStay(checkIn, checkOut) && checkIn >= hotelToday()
  const rooms = await prisma.room.findMany({
    orderBy: { id: 'asc' },
    select: {
      id: true, name: true, nameEn: true, imageUrl: true, price: true,
      bookings: searching && {
        where: overlapFilter(checkIn, checkOut),
        select: { checkIn: true, checkOut: true },
      },
    },
  })
  const available: typeof rooms = []
  const partial: { room: (typeof rooms)[number]; stays: Stay[] }[] = []
  const unavailable: typeof rooms = []
  for (const room of rooms) {
    if (!searching || !room.bookings.length) {
      available.push(room)
      continue
    }
    const stays = freeStaysWithin(requested, room.bookings.map(booking => ({
      checkIn: booking.checkIn.toISOString().slice(0, 10),
      checkOut: booking.checkOut.toISOString().slice(0, 10),
    })))
    if (stays.length) partial.push({ room, stays })
    else unavailable.push(room)
  }
  const dates = new Intl.DateTimeFormat(ru ? 'ru-RU' : 'en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
  })
  const query = searching ? '?' + new URLSearchParams({ checkIn, checkOut }) : ''
  return (
    <div id="top" className="hotel">
      <RoomsNav locale={locale} booking="#stay" />
      <main>
        <header className="catalog-heading">
          <h1>{ru ? 'Наши номера' : 'Our rooms'}</h1>
        </header>
        <StaySearch locale={locale} checkIn={checkIn} checkOut={checkOut} />
        <section className="editorial catalog">
          {searching && (
            <p className="search-result">
              {ru ? 'Свободны на весь период' : 'Available for the entire stay'} — {available.length} / {rooms.length}.{' '}
              <Link href="/rooms">{ru ? 'Сбросить даты' : 'Clear dates'}</Link>
            </p>
          )}
          {hasDates && !searching && (
            <p className="search-result" role="alert">
              {ru ? 'Проверьте даты. Показаны все номера.' : 'Check your dates. Showing all rooms.'}
            </p>
          )}
          {available.length > 0 && <div className="room-grid">
            {available.map((room) => (
              <RoomTile key={room.id} room={room} locale={locale} query={query} />
            ))}
          </div>}
          {partial.length > 0 && (
            <section aria-labelledby="partial-rooms">
              <h2 id="partial-rooms" className="subheading">{ru ? 'Частично свободны на эти даты' : 'Partially available for these dates'}</h2>
              <div className="room-grid">
                {partial.map(({ room, stays }) => (
                  <div key={room.id}>
                    <RoomTile room={room} locale={locale} query={query} />
                    <p className="stay-options-label">{ru ? 'Доступные даты заезда и выезда' : 'Available check-in and check-out dates'}</p>
                    <ul className="stay-options">
                      {stays.map(({ checkIn, checkOut }) => (
                        <li key={checkIn}>
                          <Link href={'/rooms/' + room.id + '?' + new URLSearchParams({ checkIn, checkOut }) + '#booking'}>
                            {dates.formatRange(new Date(checkIn), new Date(checkOut))}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}
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
