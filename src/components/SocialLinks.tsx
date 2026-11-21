import ContactIcon from './ContactIcon'
import styles from './HomeHero.module.css'

export default function SocialLinks({ locale }: { locale: string }) {
  const services = [
    { service: 'telegram', label: 'Telegram' },
    { service: 'max', label: 'MAX' },
    { service: 'maps', label: locale === 'ru' ? 'Яндекс Карты' : 'Yandex Maps' },
  ] as const
  return (
    <div className={styles.socials}>
      {services.map(({ service, label }) => (
        <a key={service} href="#contacts" aria-label={label} title={label}>
          <ContactIcon service={service} />
        </a>
      ))}
    </div>
  )
}
