import Link from 'next/link'
import { roomPhotos } from '@/lib/hotel-photos'

type Room = {
  id: number
  name: string
  nameEn: string
  imageUrl: string
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
  const status = ru ? 'Даты заняты' : 'Dates unavailable'
  return (
    <Link
      className={'room-tile' + (unavailable ? ' occupied' : '')}
      href={'/rooms/' + room.id + query}
      aria-label={unavailable ? name + ' · ' + status : undefined}
    >
      <div className="tile-photo">
        <img src={roomPhotos([room.imageUrl])[0]} alt="" loading="lazy" />
        <div className="tile-plaque-top" aria-hidden="true">
          <span>{unavailable ? status : ru ? 'Номер' : 'Room'}</span>
          <span className="tile-action">{ru ? 'Подробнее' : 'View room'}</span>
        </div>
      </div>
      <div className="tile-caption">
        <h3 className="tile-title">{name}</h3>
        <div className="tile-plaque-name" aria-hidden="true">{name}</div>
      </div>
    </Link>
  )
}
