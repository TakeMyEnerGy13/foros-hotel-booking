import { NextResponse } from 'next/server'
import { issueSession, loginConfigured, matchesAdminPassword, sessionCookie, sessionSeconds } from '@/app/admin/auth'

export async function POST(request: Request) {
  if (!loginConfigured()) return NextResponse.json({ error: 'Вход администратора не настроен' }, { status: 503 })
  const body = await request.json().catch(() => null)
  if (!matchesAdminPassword(body?.password)) {
    return NextResponse.json({ error: 'Неверный пароль' }, { status: 401 })
  }
  const response = NextResponse.json({ ok: true })
  response.cookies.set(sessionCookie, issueSession(), {
    httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: sessionSeconds,
  })
  return response
}
