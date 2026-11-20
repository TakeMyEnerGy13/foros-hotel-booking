import Link from 'next/link'
import { roomPhotos } from '@/lib/hotel-photos'

type Room = {
  id: number
  name: string
  nameEn: string
  imageUrl: string
  capacity: number
  price: number
}
export default function RoomTile({
  room,
  locale,
  query = '',
  unavailable = false,
}: {
  room: Room
  locale: string
  query?: string
  unavailable?: boolean
}) {
  const ru = locale !== 'en'
  const name = ru ? room.name : room.nameEn
  return (
    <Link className={'room-tile' + (unavailable ? ' occupied' : '')} href={'/rooms/' + room.id + query}>
      <div className="tile-photo">
        <img src={roomPhotos([room.imageUrl])[0]} alt={name} loading="lazy" />
      </div>
      <div className="tile-meta label">
        <span>
          {unavailable
            ? ru
              ? 'Даты заняты'
              : 'Dates unavailable'
            : ru
              ? 'До ' + room.capacity + ' гостей'
              : 'Up to ' + room.capacity + ' guests'}
        </span>
        <span>
          {room.price.toLocaleString(ru ? 'ru-RU' : 'en-GB')} ₽ / {ru ? 'ночь' : 'night'}
        </span>
      </div>
      <div className="tile-title">
        <h3>{name}</h3>
        <span aria-hidden="true">↗</span>
      </div>
    </Link>
  )
}
