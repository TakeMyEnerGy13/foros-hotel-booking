import { createHash, randomBytes } from 'node:crypto'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import type { Booking } from '@prisma/client'
import { bookingReceipt } from './booking-hold'
import { prisma } from './prisma'

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

export function createGuestReceiptKey() {
  const token = randomBytes(32).toString('base64url')
  return { token, hash: hashToken(token) }
}

function cookiePrefix(roomId: number) {
  return 'foros_receipt_' + roomId + '_'
}

function guestReceipt(booking: Pick<Booking, 'id' | 'checkIn' | 'checkOut' | 'status' | 'createdAt'>, locale: string) {
  const { status, holdExpiresAt } = bookingReceipt(booking)
  const dates = new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'ru-RU', { dateStyle: 'long', timeZone: 'UTC' })
  return {
    id: booking.id, status, holdExpiresAt: holdExpiresAt?.toISOString() ?? null,
    stayLabel: dates.formatRange(booking.checkIn, booking.checkOut),
    checkIn: booking.checkIn.toISOString().slice(0, 10), checkOut: booking.checkOut.toISOString().slice(0, 10),
  }
}

export type GuestReceipt = ReturnType<typeof guestReceipt>

export async function guestBookingResponse(booking: Booking, token: string) {
  const locale = (await cookies()).get('locale')?.value ?? 'ru'
  const response = NextResponse.json(guestReceipt(booking, locale), { headers: { 'Cache-Control': 'private, no-store' } })
  response.cookies.set(cookiePrefix(booking.roomId) + booking.id, token, {
    path: '/rooms', httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production',
    expires: new Date(booking.checkOut.getTime() + 86400000),
  })
  return response
}

export async function roomGuestReceipts(roomId: number, cookies: { name: string; value: string }[], today: string, locale: string) {
  const prefix = cookiePrefix(roomId)
  const hashes = cookies.filter(c => c.name.startsWith(prefix) && /^[\w-]{43}$/.test(c.value)).map(c => hashToken(c.value))
  if (!hashes.length) return []
  const rows = await prisma.booking.findMany({
    where: { roomId, guestReceiptHash: { in: hashes }, checkOut: { gte: new Date(today) } },
    select: { id: true, checkIn: true, checkOut: true, status: true, createdAt: true },
    orderBy: { id: 'desc' },
  })
  return rows.map(row => guestReceipt(row, locale))
}
