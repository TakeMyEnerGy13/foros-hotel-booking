import Link from 'next/link'
import styles from '../AdminAppearance.module.css'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '../auth'
import { revalidatePath } from 'next/cache'

export default async function AdminBookingsPage() {
  await requireAdmin()
  const bookings = await prisma.booking.findMany({
    include: { room: true },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <main className={styles.bookingList + ' min-h-screen bg-gray-100'}>
      <nav className="bg-gray-900 text-white px-8 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">⚙️ Панель администратора</h1>
        <Link href="/" className="text-gray-400 hover:text-white text-sm">← На сайт</Link>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Все бронирования</h2>
          <Link href="/admin" className="text-gray-500 hover:text-gray-700">← Назад</Link>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center text-gray-500">
            Бронирований пока нет
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Гость</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Номер</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Заезд</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Выезд</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Статус</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-800">{booking.guestName}</div>
                      <div className="text-sm text-gray-500">{booking.guestEmail}</div>
                      <div className="text-sm text-gray-500">{booking.guestPhone}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{booking.room.name}</td>
                    <td className="px-6 py-4 text-gray-700">
                      {booking.checkIn.toLocaleDateString('ru-RU', { timeZone: 'UTC' })}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {booking.checkOut.toLocaleDateString('ru-RU', { timeZone: 'UTC' })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        booking.status === 'confirmed'
                          ? 'bg-green-100 text-green-700'
                          : booking.status === 'cancelled'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {booking.status === 'confirmed' ? 'Подтверждено'
                          : booking.status === 'cancelled' ? 'Отменено'
                          : 'Ожидает'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <BookingActions bookingId={booking.id} status={booking.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}

function BookingActions({ bookingId, status }: { bookingId: number, status: string }) {
  return (
    <div className="flex gap-2">
      {status === 'pending' && (
        <form action={async () => {
          'use server'
          await requireAdmin()
          await prisma.booking.updateMany({
            where: { id: bookingId, status: 'pending' }, data: { status: 'confirmed' },
          })
          revalidatePath('/admin/bookings')
        }}>
          <button type="submit" className="bg-green-500 hover:bg-green-400 text-white px-3 py-1 rounded text-sm">
            Подтвердить
          </button>
        </form>
      )}
      {status !== 'cancelled' && (
        <form action={async () => {
          'use server'
          await requireAdmin()
          await prisma.booking.updateMany({ where: { id: bookingId }, data: { status: 'cancelled' } })
          revalidatePath('/admin/bookings')
        }}>
          <button type="submit" className="bg-red-500 hover:bg-red-400 text-white px-3 py-1 rounded text-sm">
            Отменить
          </button>
        </form>
      )}
    </div>
  )
}
