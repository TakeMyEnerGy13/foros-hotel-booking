import { Prisma } from '@prisma/client'
import { z } from 'zod'
import { prisma } from './prisma'
import { hotelToday, overlapFilter, validStay } from './stay'

const id = z.number().int().positive().max(2147483647)
const fields = z.object({
  checkIn: z.string(), checkOut: z.string(), guestName: z.string().trim().min(1),
})
const guestFields = fields.extend({
  roomId: id, guestEmail: z.email(), guestPhone: z.string().trim().min(1),
})
const adminFields = fields.extend({
  guestEmail: z.union([z.email(), z.literal('')]).default(''),
  guestPhone: z.string().trim().default(''), notes: z.string().default(''),
  status: z.enum(['pending', 'confirmed', 'cancelled']).default('confirmed'),
})
const adminCreateFields = adminFields.extend({ roomId: z.union([id, z.string().regex(/^\d+$/).transform(Number).pipe(id)]) })

class BookingError extends Error {
  constructor(readonly status: number, message: string) { super(message) }
}

function validId(value: string) {
  const parsed = id.safeParse(Number(value))
  if (!/^\d+$/.test(value) || !parsed.success) throw new BookingError(404, 'Бронь не найдена')
  return parsed.data
}

export async function saveBooking(request: Request, admin: boolean, bookingId?: string) {
  try {
    const body: unknown = await request.json().catch(() => null)
    const schema = admin ? (bookingId === undefined ? adminCreateFields : adminFields) : guestFields
    const result = schema.safeParse(body)
    if (!result.success) throw new BookingError(400, 'Проверьте данные гостя и номера')
    const data = result.data
    if (!validStay(data.checkIn, data.checkOut) || (!admin && data.checkIn < hotelToday())) {
      throw new BookingError(400, 'Укажите допустимые даты заезда и выезда')
    }
    const targetId = bookingId === undefined ? undefined : validId(bookingId)
    const saved = await prisma.$transaction(async tx => {
      const old = targetId === undefined ? null : await tx.booking.findUnique({
        where: { id: targetId }, select: { roomId: true },
      })
      if (targetId !== undefined && !old) throw new BookingError(404, 'Бронь не найдена')
      const roomId = old?.roomId ?? ('roomId' in data && typeof data.roomId === 'number' ? data.roomId : undefined)
      if (!roomId) throw new BookingError(400, 'Выберите номер')
      // Every writer checks availability under the same room lock, including reactivation.
      const rooms = await tx.$queryRaw<{ id: number }[]> `SELECT id FROM "Room" WHERE id = ${roomId} FOR UPDATE`
      if (!rooms.length) throw new BookingError(404, 'Номер не найден')
      const status = 'status' in data ? data.status : 'pending'
      if (status !== 'cancelled') {
        const conflict = await tx.booking.findFirst({
          where: { roomId, ...overlapFilter(data.checkIn, data.checkOut), id: targetId === undefined ? undefined : { not: targetId } },
          select: { id: true },
        })
        if (conflict) throw new BookingError(409, 'Номер уже забронирован на эти даты')
      }
      const values = {
        guestName: data.guestName, guestPhone: data.guestPhone, guestEmail: data.guestEmail,
        checkIn: new Date(data.checkIn), checkOut: new Date(data.checkOut), status,
        ...('notes' in data && { notes: data.notes }),
      }
      if (targetId !== undefined) return tx.booking.update({ where: { id: targetId }, data: values })
      return tx.booking.create({ data: { ...values, roomId } })
    }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted })
    return Response.json(admin ? saved : { id: saved.id, status: saved.status })
  } catch (error) {
    if (error instanceof BookingError) return Response.json({ error: error.message }, { status: error.status })
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return Response.json({ error: 'Бронь не найдена' }, { status: 404 })
    }
    console.error('Booking write failed', error instanceof Prisma.PrismaClientKnownRequestError ? error.code : 'internal error')
    return Response.json({ error: 'Не удалось сохранить бронь' }, { status: 500 })
  }
}
