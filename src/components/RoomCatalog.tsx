import Link from '@/components/SiteLink'
import { datesFromQuery, freeStaysWithin, overlaps, validStay, type Stay, type StayQuery } from '@/lib/stay'
import type { TileRoom } from './RoomTile'
import RoomsNav from '@/components/RoomsNav'
import HotelFooter from '@/components/HotelFooter'
import StaySearch from '@/components/StaySearch'
import RoomTile from '@/components/RoomTile'

interface Props {
  locale: string
  queryDates: StayQuery
  today: string
  rooms: (TileRoom & { bookings: Stay[] })[]
}

export default function RoomCatalog({ locale, queryDates, today, rooms }: Props) {
  const ru = locale !== 'en'
  const requested = datesFromQuery(queryDates)
  const { checkIn, checkOut } = requested
  const hasDates = Boolean(queryDates.checkIn || queryDates.checkOut)
  const searching = validStay(checkIn, checkOut) && checkIn >= today
  const available: typeof rooms = []
  const partial: { room: (typeof rooms)[number]; stays: Stay[] }[] = []
  const unavailable: typeof rooms = []
  for (const room of rooms) {
    if (!searching || !room.bookings.some(booking => overlaps(booking, requested))) {
      available.push(room)
      continue
    }
    const stays = freeStaysWithin(requested, room.bookings)
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
        <StaySearch locale={locale} checkIn={checkIn} checkOut={checkOut} today={today} />
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
