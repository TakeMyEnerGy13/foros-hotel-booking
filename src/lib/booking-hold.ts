export const guestHoldHours = 3
const holdDuration = guestHoldHours * 60 * 60 * 1000

export function activeBookings(now = new Date()) {
  return {
    OR: [
      { status: { notIn: ['held', 'cancelled'] } },
      { status: 'held', createdAt: { gt: new Date(now.getTime() - holdDuration) } },
    ],
  }
}

export function bookingReceipt<T extends { status: string; createdAt: Date }>(booking: T) {
  const holdExpiresAt = booking.status === 'held' ? new Date(booking.createdAt.getTime() + holdDuration) : null
  const status = holdExpiresAt ? (holdExpiresAt.getTime() > Date.now() ? 'pending' : 'expired') : booking.status
  return { ...booking, holdExpiresAt, status }
}
