import sampleRooms from '../prisma/rooms.json'
import type { Stay } from '@/lib/stay'

export const rooms = sampleRooms.map((room, index) => ({ ...room, id: index + 1 }))

const occupiedNights = [
  [[4, 8], [14, 16]],
  [[5, 9], [20, 22], [28, 30]],
  [[10, 13], [24, 26]],
  [[2, 6], [19, 30]],
]

export function sampleBookings(roomId: number, today: string): Stay[] {
  const start = new Date(today + 'T00:00:00Z')
  const bookings: Stay[] = []
  for (let offset = 0; offset < 24; offset++) {
    const month = start.getUTCMonth() + offset
    const year = start.getUTCFullYear()
    const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
    const date = (day: number) => new Date(Date.UTC(year, month, Math.min(day, lastDay + 1))).toISOString().slice(0, 10)
    for (const [from, to] of occupiedNights[roomId - 1]) {
      bookings.push({ checkIn: date(from), checkOut: date(to) })
    }
  }
  return bookings
}
