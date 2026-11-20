export interface Stay {
  checkIn: string
  checkOut: string
}

export function calendarDay(day: Date) {
  return [String(day.getFullYear()).padStart(4, '0'), String(day.getMonth() + 1).padStart(2, '0'), String(day.getDate()).padStart(2, '0')].join('-')
}

export function hotelToday() {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Moscow', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date())
}

export function isCalendarDay(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(value + 'T00:00:00.000Z')
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
}

export function validStay(checkIn: unknown, checkOut: unknown) {
  return isCalendarDay(checkIn) && isCalendarDay(checkOut) && checkIn < checkOut
}

export function overlaps(existing: Stay, requested: Stay) {
  return existing.checkIn < requested.checkOut && existing.checkOut > requested.checkIn
}

export function overlapFilter(checkIn: string, checkOut: string) {
  return { status: { not: 'cancelled' }, checkIn: { lt: new Date(checkOut) }, checkOut: { gt: new Date(checkIn) } }
}
