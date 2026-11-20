import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Берег Радости — Гостиница в Форосе',
  description: 'Гостиница Берег Радости на южном берегу Крыма, Форос. Бронирование номеров онлайн.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{
        fontFamily: "'Inter', sans-serif",
        margin: 0,
        padding: 0,
        backgroundColor: '#fafaf9'
      }}>
        {children}
      </body>
    </html>
  )
}