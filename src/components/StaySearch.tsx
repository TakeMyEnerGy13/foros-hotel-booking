import StayDateFields from './StayDateFields'
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
      <StayDateFields key={checkIn + '/' + checkOut} locale={locale} today={hotelToday()} checkIn={checkIn} checkOut={checkOut} />
      <button type="submit" className="solid">
        {ru ? 'Найти номер' : 'Find a room'} <span aria-hidden="true">↗</span>
      </button>
    </form>
  )
}
