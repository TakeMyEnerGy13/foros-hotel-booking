import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '../auth'
import { revalidatePath } from 'next/cache'

export default async function AdminBookingsPage() {
  await requireAdmin()
  const bookings = await prisma.booking.findMany({
    include: { room: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <main className="operations">
      <nav className="ops-nav">
        <Link href="/" className="wordmark">
          берег радости
        </Link>
        <Link className="pill" href="/admin">
          ← Календарь
        </Link>
      </nav>
      <header className="ops-heading">
        <span className="label">Панель администратора</span>
        <h1>Бронирования</h1>
      </header>
      {bookings.length === 0 ? (
        <p>Бронирований пока нет</p>
      ) : (
        <div className="ops-scroll">
          <table className="booking-list">
            <thead>
              <tr>
                {['Гость', 'Номер', 'Заезд', 'Выезд', 'Статус', 'Действия'].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>
                    {booking.guestName}
                    <br />
                    {booking.guestEmail}
                    <br />
                    {booking.guestPhone}
                  </td>
                  <td>{booking.room.name}</td>
                  <td>{booking.checkIn.toLocaleDateString('ru-RU', { timeZone: 'UTC' })}</td>
                  <td>{booking.checkOut.toLocaleDateString('ru-RU', { timeZone: 'UTC' })}</td>
                  <td>
                    {booking.status === 'confirmed'
                      ? 'Подтверждено'
                      : booking.status === 'cancelled'
                        ? 'Отменено'
                        : 'Ожидает'}
                  </td>
                  <td>
                    <BookingActions bookingId={booking.id} status={booking.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}

function BookingActions({ bookingId, status }: { bookingId: number; status: string }) {
  return (
    <div className="flex gap-2">
      {status === 'pending' && (
        <form
          action={async () => {
            'use server'
            await requireAdmin()
            await prisma.booking.updateMany({
              where: { id: bookingId, status: 'pending' },
              data: { status: 'confirmed' },
            })
            revalidatePath('/admin/bookings')
          }}
        >
          <button type="submit" className="pill">
            Подтвердить
          </button>
        </form>
      )}
      {status !== 'cancelled' && (
        <form
          action={async () => {
            'use server'
            await requireAdmin()
            await prisma.booking.updateMany({ where: { id: bookingId }, data: { status: 'cancelled' } })
            revalidatePath('/admin/bookings')
          }}
        >
          <button type="submit" className="pill">
            Отменить
          </button>
        </form>
      )}
    </div>
  )
}
