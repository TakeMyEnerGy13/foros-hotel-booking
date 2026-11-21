import Link from 'next/link'
import LanguageSwitcher from './LanguageSwitcher'

export default function RoomsNav({ locale, booking = '/#stay' }: { locale: string; booking?: string }) {
  const ru = locale !== 'en'
  return (
    <header className="masthead">
      <Link href="/" className="wordmark">
        {ru ? 'Берег Радости' : 'Shore of Joy'}
      </Link>
      <nav aria-label={ru ? 'Навигация' : 'Navigation'} className="main-links">
        <Link href="/rooms">{ru ? 'Номера' : 'Rooms'}</Link>
        <Link href="/#gallery">{ru ? 'Галерея' : 'Gallery'}</Link>
        <Link href="#contacts">{ru ? 'Контакты' : 'Contact'}</Link>
      </nav>
      <div className="nav-end">
        <LanguageSwitcher currentLocale={locale} />
        <Link className="pill header-book" href={booking}>
          {ru ? 'Забронировать' : 'Book a stay'} <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </header>
  )
}
