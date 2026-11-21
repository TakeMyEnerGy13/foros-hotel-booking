import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import './globals.css'

export const metadata: Metadata = {
  title: 'Берег Радости — Гостиница в Форосе',
  description: 'Гостиница Берег Радости на южном берегу Крыма, Форос. Бронирование номеров онлайн.',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = (await cookies()).get('locale')?.value === 'en' ? 'en' : 'ru'
  return (
    <html lang={lang}>
      <body>{children}</body>
    </html>
  )
}
