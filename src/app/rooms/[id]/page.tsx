import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { datesFromQuery, hotelToday, overlaps, validStay, type StayQuery } from '@/lib/stay'
import { cookies } from 'next/headers'
import BookingCalendar from './BookingCalendar'
import { PhotoStage } from '@/components/Gallery'
import HotelFooter from '@/components/HotelFooter'
import { roomPhotos } from '@/lib/hotel-photos'
import RoomsNav from '@/components/RoomsNav'

export default async function RoomPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<StayQuery>
}) {
  const { id } = await params
  if (!/^\d+$/.test(id) || Number(id) > 2147483647) notFound()
  const requested = datesFromQuery(await searchParams)
  const { checkIn, checkOut } = requested
  const cookieStore = await cookies()
  const locale = cookieStore.get('locale')?.value || 'ru'

  const room = await prisma.room.findUnique({
    where: { id: parseInt(id) },
    include: {
      bookings: { where: { status: { not: 'cancelled' } }, select: { checkIn: true, checkOut: true } },
    },
  })

  if (!room) notFound()

  const bookings = room.bookings.map((b) => ({
    checkIn: b.checkIn.toISOString().slice(0, 10),
    checkOut: b.checkOut.toISOString().slice(0, 10),
  }))
  const today = hotelToday()
  const initialStay =
    validStay(checkIn, checkOut) && checkIn >= today && !bookings.some((b) => overlaps(b, requested))
      ? requested
      : undefined

  const ru = locale !== 'en'
  const name = ru ? room.name : room.nameEn
  const catalogHref = validStay(checkIn, checkOut) ? '/rooms?' + new URLSearchParams({ checkIn, checkOut }) : '/rooms'
  const allRoomsLink = (
    <Link className="all-rooms-link" href={catalogHref}>
      <span aria-hidden="true">←</span> {ru ? 'Все номера' : 'All rooms'}
    </Link>
  )
  const photos = roomPhotos(room.images.length ? room.images : [room.imageUrl]).map((src, i) => ({
    src,
    caption: name + ' · ' + (i + 1),
  }))
  return (
    <div id="top" className="hotel">
      <RoomsNav locale={locale} booking="#booking" />
      <main>
        <div className="room-hero">
          {allRoomsLink}
          <PhotoStage photos={photos} title={name} locale={locale} />
        </div>
        <div className="room-spread editorial">
          <section className="room-story">
            <h2>{ru ? 'О номере' : 'About the room'}</h2>
            <p>{ru ? room.description : room.descriptionEn}</p>
            <dl className="room-facts">
              <div>
                <dt>{ru ? 'Цена за ночь' : 'Per night'}</dt>
                <dd>{room.price.toLocaleString(ru ? 'ru-RU' : 'en-GB')} ₽</dd>
              </div>
              <div>
                <dt>{ru ? 'Вместимость' : 'Capacity'}</dt>
                <dd>{ru ? 'До ' + room.capacity + ' гостей' : 'Up to ' + room.capacity + ' guests'}</dd>
              </div>
              <div>
                <dt>Wi-Fi</dt>
                <dd>{ru ? 'Бесплатно' : 'Included'}</dd>
              </div>
              <div>
                <dt>{ru ? 'Завтрак' : 'Breakfast'}</dt>
                <dd>{ru ? 'Включён' : 'Included'}</dd>
              </div>
            </dl>
          </section>
          <BookingCalendar
            key={[room.id, checkIn, checkOut].join('/')}
            roomId={room.id}
            today={today}
            locale={locale}
            initialStay={initialStay}
            price={room.price}
            bookings={bookings}
          />
          {allRoomsLink}
        </div>
      </main>
      <HotelFooter locale={locale} />
    </div>
  )
}
