import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export const sessionCookie = 'admin_token'
export const sessionSeconds = 7 * 24 * 60 * 60

function sameValue(left: string, right: string) {
  const hash = (value: string) => createHash('sha256').update(value).digest()
  return timingSafeEqual(hash(left), hash(right))
}

export function loginConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD && (process.env.ADMIN_SESSION_SECRET?.length ?? 0) >= 32)
}

export function matchesAdminPassword(value: unknown) {
  return loginConfigured() && typeof value === 'string' && sameValue(value, process.env.ADMIN_PASSWORD!)
}

function signature(payload: string) {
  return createHmac('sha256', process.env.ADMIN_SESSION_SECRET!).update(payload).digest('base64url')
}

export function issueSession() {
  const expires = Math.floor(Date.now() / 1000) + sessionSeconds
  const payload = expires + '.' + randomBytes(24).toString('base64url')
  return payload + '.' + signature(payload)
}

export async function isAdmin() {
  if (!loginConfigured()) return false
  const token = (await cookies()).get(sessionCookie)?.value
  if (!token) return false
  const parts = token.split('.')
  if (parts.length !== 3) return false
  const [expires, nonce, mac] = parts
  return Number.isSafeInteger(Number(expires)) && Number(expires) > Date.now() / 1000 &&
    sameValue(mac, signature(expires + '.' + nonce))
}

export async function requireAdmin() {
  if (!(await isAdmin())) redirect('/admin-login')
}
