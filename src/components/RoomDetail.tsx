import Link from '@/components/SiteLink'
import type { ReactNode } from 'react'
import { validStay, type Stay } from '@/lib/stay'
import type { TileRoom } from './RoomTile'
import { PhotoStage } from '@/components/Gallery'
import HotelFooter from '@/components/HotelFooter'
import { roomPhotos } from '@/lib/hotel-photos'
import RoomsNav from '@/components/RoomsNav'

type DetailRoom = TileRoom & { description: string; descriptionEn: string; images: string[]; capacity: number }

export default function RoomDetail({ room, requested, locale, calendar }: {
  room: DetailRoom; requested: Stay; locale: string; calendar: ReactNode
}) {
  const { checkIn, checkOut } = requested
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
          {calendar}
          {allRoomsLink}
        </div>
      </main>
      <HotelFooter locale={locale} />
    </div>
  )
}
