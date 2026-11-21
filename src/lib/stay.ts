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

export function maskStayDate(value: string, separator: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  if (digits.length < 2) return digits
  const day = digits.slice(0, 2)
  const month = digits.slice(2, 4)
  const year = digits.slice(4)
  return day + separator + month + (digits.length >= 4 ? separator + year : '')
}

export function readStayDate(value: string) {
  const text = value.trim()
  if (/^\d{4}-/.test(text)) return isCalendarDay(text) ? text : ''
  const parts = text.match(/^(\d{2})(\d{2})(\d{4}|\d{2})$/)
    ?? text.match(/^(\d{2})([2-9])(\d{4}|\d{2})$/)
    ?? text.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4}|\d{2})$/)
  if (!parts) return ''
  const [, day, month, year] = parts
  const iso = [year.length === 2 ? '20' + year : year, month.padStart(2, '0'), day.padStart(2, '0')].join('-')
  return isCalendarDay(iso) ? iso : ''
}

export function validStay(checkIn: unknown, checkOut: unknown) {
  return isCalendarDay(checkIn) && isCalendarDay(checkOut) && checkIn < checkOut
}

export function overlaps(existing: Stay, requested: Stay) {
  return existing.checkIn < requested.checkOut && existing.checkOut > requested.checkIn
}

export function stayForNights(anchor: string, night: string, bookings: Stay[]): Stay | undefined {
  const checkIn = anchor < night ? anchor : night
  const lastNight = anchor < night ? night : anchor
  const morning = new Date(lastNight + 'T00:00:00Z')
  morning.setUTCDate(morning.getUTCDate() + 1)
  const stay = { checkIn, checkOut: morning.toISOString().slice(0, 10) }
  return bookings.some(booking => overlaps(booking, stay)) ? undefined : stay
}

export function overlapFilter(checkIn: string, checkOut: string) {
  return { status: { not: 'cancelled' }, checkIn: { lt: new Date(checkOut) }, checkOut: { gt: new Date(checkIn) } }
}
