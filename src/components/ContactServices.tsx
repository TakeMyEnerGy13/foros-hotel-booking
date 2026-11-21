import ContactIcon from './ContactIcon'

export default function ContactServices({ locale }: { locale: string }) {
  const services = [
    { icon: 'telegram', name: 'Telegram', href: 'https://example.com' },
    { icon: 'max', name: 'MAX', href: 'https://example.com' },
    { icon: 'maps', name: locale === 'ru' ? 'Яндекс Карты' : 'Yandex Maps', href: 'https://yandex.ru/maps/org/bereg_radosti/228164956522/' },
  ] as const

  return (
    <ul className="contact-services">
      {services.map(({ icon, name, href }) => (
        <li key={icon}>
          <a href={href} target="_blank" rel="noopener noreferrer">
            <span className="contact-service-icon"><ContactIcon service={icon} /></span>
            {name}
          </a>
        </li>
      ))}
    </ul>
  )
}
