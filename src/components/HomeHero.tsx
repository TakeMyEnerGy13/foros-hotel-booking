import Image from 'next/image'
import Link from 'next/link'
import { hotelToday } from '@/lib/stay'
import LanguageSwitcher from './LanguageSwitcher'
import MenuButton from './MenuButton'
import SearchButton from './SearchButton'
import SocialLinks from './SocialLinks'
import WeatherWidget from './WeatherWidget'
import styles from './HomeHero.module.css'

const glassStyle = {
  background: 'rgba(255, 255, 255, 0.08)',
  backdropFilter: 'blur(20px) saturate(180%)',
  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  boxShadow: '0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.15)',
}

export default function HomeHero({ locale }: { locale: string }) {
  const ru = locale === 'ru'
  const today = hotelToday()

  return (
    <section className={styles.hero} aria-labelledby="hotel-title">
      <nav className={styles.nav} aria-label={ru ? 'Навигация' : 'Navigation'}>
        <MenuButton locale={locale} glassStyle={glassStyle} />
        <div className={styles.navEnd}>
          <LanguageSwitcher currentLocale={locale} />
          <Link href="/rooms" className={styles.rooms} style={glassStyle}>
            {ru ? 'Номера' : 'Rooms'}
          </Link>
        </div>
      </nav>
      <div className={styles.title}>
        <Image src="/logo.png" width={208} height={208} alt="" loading="eager" />
        <h1 id="hotel-title">{ru ? 'Берег Радости' : 'Shore of Joy'}</h1>
        <p>{ru ? 'Форос · Крым · Южный берег Крыма' : 'Foros · Crimea · Southern Coast'}</p>
      </div>
      <div className={styles.tools}>
        <WeatherWidget locale={locale} variant="hero" />
        <form id="stay" className={styles.search} action="/rooms" method="get" style={glassStyle}>
          <label>
            <span>{ru ? 'Дата заезда' : 'Check-in'}</span>
            <input id="checkIn" name="checkIn" type="date" min={today} />
          </label>
          <label>
            <span>{ru ? 'Дата выезда' : 'Check-out'}</span>
            <input id="checkOut" name="checkOut" type="date" min={today} />
          </label>
          <SearchButton locale={locale} />
        </form>
        <SocialLinks />
      </div>
    </section>
  )
}
