import Image from 'next/image'
import ContactServices from './ContactServices'

export default function HotelFooter({ locale }: { locale: string }) {
  const ru = locale !== 'en'
  const name = ru ? 'Берег Радости' : 'Shore of Joy'
  const email = <a href="mailto:info@beregradosti.ru">info@beregradosti.ru</a>
  const location = ru ? 'Форос, улица Терлецкого, 4Н' : '4N Terletskogo Street, Foros'
  const coordinates = '33.794227,44.391969'

  return (
    <footer id="contacts" className="home-footer">
      <div className="home-footer-row">
        <div className="footer-contact">
          <h2>{ru ? 'Контакты' : 'Contact'}</h2>
          <address>
            <span>{ru ? 'По вопросам бронирования' : 'Booking enquiries'}</span>
            {email}
            <span className="footer-phone">+7 (978) XXX-XX-XX</span>
          </address>
          <ContactServices locale={locale} />
        </div>
        <Image className="home-footer-mark" src="/logo.png" width={330} height={319} alt="" />
        <figure className="footer-map">
          <iframe
            title={ru ? 'Берег Радости в Форосе на карте' : 'Shore of Joy in Foros on the map'}
            src={`https://yandex.ru/map-widget/v1/?ll=${coordinates}&pt=${coordinates},pm2rdm&z=17&l=map&lang=${ru ? 'ru_RU' : 'en_US'}`}
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
