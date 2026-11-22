import '@/app/globals.css'
import './showcase.css'

export const metadata = {
  title: 'Берег Радости — Гостиница в Форосе',
  description: 'Номера гостиницы, виды Фороса и демонстрационный календарь свободных дат.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <html lang="ru"><body>{children}</body></html>
}
