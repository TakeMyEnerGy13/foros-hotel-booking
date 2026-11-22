import Preview from '../Preview'
import { hotelToday } from '@/lib/stay'

export default function Page() {
  return <Preview page="home" buildDay={hotelToday()} />
}
