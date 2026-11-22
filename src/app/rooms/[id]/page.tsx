import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { datesFromQuery, hotelToday, overlaps, validStay, type StayQuery } from '@/lib/stay'
import { cookies } from 'next/headers'
import BookingCalendar from './BookingCalendar'
import RoomDetail from '@/components/RoomDetail'
import { activeBookings } from '@/lib/booking-hold'
import { roomGuestReceipts } from '@/lib/guest-receipts'

export default async function RoomPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<StayQuery>
}) {
  const { id } = await params
  if (!/^\d+$/.test(id) || Number(id) > 2147483647) notFound()
  const requested = datesFromQuery(await searchParams)
  const { checkIn, checkOut } = requested
  const cookieStore = await cookies()
  const locale = cookieStore.get('locale')?.value || 'ru'

  const room = await prisma.room.findUnique({
    where: { id: parseInt(id) },
    include: {
      bookings: { where: activeBookings(), select: { checkIn: true, checkOut: true } },
    },
  })

  if (!room) notFound()

  const bookings = room.bookings.map((b) => ({
    checkIn: b.checkIn.toISOString().slice(0, 10),
    checkOut: b.checkOut.toISOString().slice(0, 10),
  }))
  const today = hotelToday()
  const receipts = await roomGuestReceipts(room.id, cookieStore.getAll(), today, locale)
  const hasUpcomingStay = validStay(checkIn, checkOut) && checkIn >= today
  const initialStay =
    hasUpcomingStay && !bookings.some((b) => overlaps(b, requested))
      ? requested
      : undefined

  return (
    <RoomDetail room={room} requested={requested} locale={locale} calendar={
      <BookingCalendar
        key={[room.id, checkIn, checkOut].join('/')}
        roomId={room.id}
        today={today}
        locale={locale}
        initialDay={hasUpcomingStay ? checkIn : today}
        initialStay={initialStay}
        price={room.price}
        bookings={bookings}
        receipts={receipts}
      />
    } />
  )
}
