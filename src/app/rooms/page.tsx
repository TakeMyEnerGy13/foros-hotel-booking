import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { datesFromQuery, validStay, overlapFilter, hotelToday, type StayQuery } from '@/lib/stay'
import RoomCatalog from '@/components/RoomCatalog'

interface Props {
  searchParams: Promise<StayQuery>
}

export default async function RoomsPage({ searchParams }: Props) {
  const ru = (await cookies()).get('locale')?.value !== 'en'
  const locale = ru ? 'ru' : 'en'
  const queryDates = await searchParams
  const requested = datesFromQuery(queryDates)
  const { checkIn, checkOut } = requested
  const today = hotelToday()
  const searching = validStay(checkIn, checkOut) && checkIn >= today
  const rooms = await prisma.room.findMany({
    orderBy: { id: 'asc' },
    select: {
      id: true, name: true, nameEn: true, imageUrl: true, price: true,
      bookings: {
        where: searching ? overlapFilter(checkIn, checkOut) : { id: { in: [] } },
        select: { checkIn: true, checkOut: true },
      },
    },
  })
  const results = rooms.map(room => ({
    ...room,
    bookings: room.bookings.map(booking => ({
      checkIn: booking.checkIn.toISOString().slice(0, 10),
      checkOut: booking.checkOut.toISOString().slice(0, 10),
    })),
  }))
  return <RoomCatalog locale={locale} queryDates={queryDates} today={today} rooms={results} />
}
