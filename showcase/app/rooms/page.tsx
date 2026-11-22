import Preview from '../../Preview'
import { hotelToday } from '@/lib/stay'

export default function Page() {
  return <Preview page="catalog" buildDay={hotelToday()} />
}
