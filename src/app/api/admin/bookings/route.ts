import { isAdmin } from '@/app/admin/auth'
import { saveBooking } from '@/lib/booking-service'
import { prisma } from '@/lib/prisma'
import { bookingReceipt } from '@/lib/booking-hold'

export async function GET() {
  if (!(await isAdmin())) return Response.json({ error: 'Требуется вход' }, { status: 401 })
  const bookings = await prisma.booking.findMany({ include: { room: true }, orderBy: { checkIn: 'asc' } })
  return Response.json(bookings.map(bookingReceipt), { headers: { 'Cache-Control': 'private, no-store' } })
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return Response.json({ error: 'Требуется вход' }, { status: 401 })
  return saveBooking(request, true)
}
