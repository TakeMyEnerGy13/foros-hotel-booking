import { sitePath } from '@/lib/site-path'
import StayDateFields from './StayDateFields'

export default function StaySearch({
  locale,
  today,
  checkIn = '',
  checkOut = '',
}: {
  locale: string
  today: string
  checkIn?: string
  checkOut?: string
}) {
  const ru = locale !== 'en'
  return (
    <form id="stay" className="stay-search" action={sitePath('/rooms/')} method="get">
      <h2>{ru ? 'Даты поездки' : 'Your stay'}</h2>
      <StayDateFields key={checkIn + '/' + checkOut} locale={locale} today={today} checkIn={checkIn} checkOut={checkOut} />
      <button type="submit" className="solid">
        {ru ? 'Найти номер' : 'Find a room'} <span aria-hidden="true">↗</span>
      </button>
    </form>
  )
}
