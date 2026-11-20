import { hotelToday } from '@/lib/stay'

export default function StaySearch({
  locale,
  checkIn = '',
  checkOut = '',
}: {
  locale: string
  checkIn?: string
  checkOut?: string
}) {
  const ru = locale !== 'en'
  return (
    <form id="stay" className="stay-search" action="/rooms" method="get">
      <h2>{ru ? 'Даты поездки' : 'Your stay'}</h2>
      <label>
        <span className="label">{ru ? 'Заезд' : 'Check-in'}</span>
        <input type="date" id="checkIn" name="checkIn" min={hotelToday()} defaultValue={checkIn} />
      </label>
      <label>
        <span className="label">{ru ? 'Выезд' : 'Check-out'}</span>
        <input type="date" id="checkOut" name="checkOut" min={hotelToday()} defaultValue={checkOut} />
      </label>
      <button type="submit" className="solid">
        {ru ? 'Найти номер' : 'Find a room'} <span aria-hidden="true">↗</span>
      </button>
    </form>
  )
}
