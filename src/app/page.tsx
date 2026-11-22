import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import HotelHome from '@/components/HotelHome'
import { hotelToday } from '@/lib/stay'

export default async function Home() {
  const locale = (await cookies()).get('locale')?.value === 'en' ? 'en' : 'ru'
  const rooms = await prisma.room.findMany({ orderBy: { id: 'asc' }, take: 4 })
  return <HotelHome locale={locale} rooms={rooms} today={hotelToday()} />
}
