import { isAdmin } from '@/app/admin/auth'
import { saveBooking } from '@/lib/booking-service'
import { prisma } from '@/lib/prisma'

type Context = { params: Promise<{ id: string }> }

export async function PUT(request: Request, { params }: Context) {
  if (!(await isAdmin())) return Response.json({ error: 'Требуется вход' }, { status: 401 })
  return saveBooking(request, true, (await params).id)
}

export async function DELETE(_request: Request, { params }: Context) {
  if (!(await isAdmin())) return Response.json({ error: 'Требуется вход' }, { status: 401 })
  const { id } = await params
  if (!/^\d+$/.test(id) || Number(id) > 2147483647) return Response.json({ error: 'Бронь не найдена' }, { status: 404 })
  const deleted = await prisma.booking.deleteMany({ where: { id: Number(id) } })
  if (!deleted.count) return Response.json({ error: 'Бронь не найдена' }, { status: 404 })
  return Response.json({ ok: true })
}
