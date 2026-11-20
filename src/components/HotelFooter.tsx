import Link from 'next/link'

export default function HotelFooter({ locale }: { locale: string }) {
  const ru = locale !== 'en'
  return (
    <footer id="contacts" className="hotel-footer">
      <div>
        <span className="label">{ru ? 'Гостиница · Форос' : 'Hotel · Foros'}</span>
        <Link className="footer-name" href="/">
          {ru ? 'Берег Радости' : 'Shore of Joy'}
        </Link>
      </div>
      <div>
        <span className="label">{ru ? 'Связаться' : 'Contact'}</span>
        <a href="mailto:info@beregradosti.ru">info@beregradosti.ru</a>
        <a href="tel:+79780000000">+7 (978) 000-00-00</a>
      </div>
      <a className="pill" href="#top">
        {ru ? 'Наверх' : 'Back to top'} ↑
      </a>
    </footer>
  )
}
