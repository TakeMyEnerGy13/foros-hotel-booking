import Link from 'next/link'
import Image from 'next/image'

export default function HotelFooter({ locale, home = false }: { locale: string; home?: boolean }) {
  const ru = locale !== 'en'
  const name = ru ? 'Берег Радости' : 'Shore of Joy'
  const phone = <a href="tel:+79780000000">+7 (978) 000-00-00</a>
  const email = <a href="mailto:info@beregradosti.ru">info@beregradosti.ru</a>

  if (home) {
    return (
      <footer id="contacts" className="home-footer">
        <div className="home-footer-row">
          <address className="footer-contact">
            <span>{ru ? 'Бронирование' : 'Reservations'}</span>
            {phone}
          </address>
          <Image className="home-footer-mark" src="/logo.png" width={330} height={319} alt="" />
          <address className="footer-contact footer-email">
            <span>{ru ? 'Электронная почта' : 'Email'}</span>
            {email}
          </address>
        </div>
        <a className="home-footer-name" href="#top" aria-label={name + (ru ? ' — наверх' : ' — back to top')}>
          {name}
        </a>
      </footer>
    )
  }

  return (
    <footer id="contacts" className="hotel-footer">
      <div>
        <Link className="footer-name" href="/">
          {name}
        </Link>
      </div>
      <div>
        <span className="label">{ru ? 'Связаться' : 'Contact'}</span>
        {email}
        {phone}
      </div>
      <a className="pill" href="#top">
        {ru ? 'Наверх' : 'Back to top'} ↑
      </a>
    </footer>
  )
}
