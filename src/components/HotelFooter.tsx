import Link from 'next/link'
import Image from 'next/image'
import ContactIcon from './ContactIcon'

export default function HotelFooter({ locale, home = false }: { locale: string; home?: boolean }) {
  const ru = locale !== 'en'
  const name = ru ? 'Берег Радости' : 'Shore of Joy'
  const email = <a href="mailto:info@beregradosti.ru">info@beregradosti.ru</a>
  const location = ru ? 'Форос, улица Терлецкого' : 'Terletskogo Street, Foros'

  if (home) {
    return (
      <footer id="contacts" className="home-footer">
        <div className="home-footer-row">
          <div className="footer-contact">
            <h2>{ru ? 'Контакты' : 'Contact'}</h2>
            <address>
              <span>{ru ? 'По вопросам бронирования' : 'Booking enquiries'}</span>
              {email}
            </address>
            <ul className="footer-services">
              <li><ContactIcon service="telegram" />Telegram</li>
              <li><ContactIcon service="max" />MAX</li>
              <li><ContactIcon service="maps" />{ru ? 'Яндекс Карты' : 'Yandex Maps'}</li>
            </ul>
          </div>
          <Image className="home-footer-mark" src="/logo.png" width={330} height={319} alt="" />
          <figure className="footer-map">
            <iframe
              title={ru ? 'Район улицы Терлецкого в Форосе на карте' : 'Map of the Terletskogo Street area in Foros'}
              src={'https://yandex.ru/map-widget/v1/?ll=33.7942%2C44.3923&z=16&l=map&lang=' + (ru ? 'ru_RU' : 'en_US')}
              loading="lazy"
            />
            <figcaption>{location}</figcaption>
          </figure>
        </div>
        <a className="home-footer-name" lang={ru ? 'ru' : 'en'} href="#top" aria-label={name + (ru ? ' — наверх' : ' — back to top')}>
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
        <span>{location}</span>
      </div>
      <a className="pill" href="#top">
        {ru ? 'Наверх' : 'Back to top'} ↑
      </a>
    </footer>
  )
}
