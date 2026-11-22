import Preview from '../../../Preview'
import { rooms } from '../../../rooms'
import { hotelToday } from '@/lib/stay'

export const dynamicParams = false

export function generateStaticParams() {
  return rooms.map(room => ({ id: String(room.id) }))
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <Preview page="room" roomId={Number(id)} buildDay={hotelToday()} />
}
