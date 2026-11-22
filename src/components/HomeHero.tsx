import { sitePath } from '@/lib/site-path'
import Image from 'next/image'
import Link from './SiteLink'
import LanguageSwitcher from './LanguageSwitcher'
import MenuButton from './MenuButton'
import SearchButton from './SearchButton'
import StayDateFields from './StayDateFields'
import SocialLinks from './SocialLinks'
import WeatherWidget from './WeatherWidget'
import styles from './HomeHero.module.css'

export default function HomeHero({ locale, today }: { locale: string; today: string }) {
  const ru = locale === 'ru'

  return (
    <section className={styles.hero} aria-labelledby="hotel-title">
      <nav className={styles.nav} aria-label={ru ? 'Навигация' : 'Navigation'}>
        <MenuButton locale={locale} />
        <div className={styles.navEnd}>
          <LanguageSwitcher currentLocale={locale} />
          <Link href="/rooms" className={styles.rooms}>
            {ru ? 'Номера' : 'Rooms'}
          </Link>
        </div>
      </nav>
      <div className={styles.title}>
        <Image src={sitePath('/logo.png')} width={208} height={208} alt="" loading="eager" />
        <h1 id="hotel-title">{ru ? 'Берег Радости' : 'Shore of Joy'}</h1>
        <p>{ru ? 'Форос · Крым · Южный берег Крыма' : 'Foros · Crimea · Southern Coast'}</p>
      </div>
      <div className={styles.tools}>
        <WeatherWidget locale={locale} />
        <form id="stay" className={styles.search} action={sitePath('/rooms/')} method="get">
          <StayDateFields locale={locale} today={today} />
          <SearchButton locale={locale} />
        </form>
        <SocialLinks locale={locale} />
      </div>
    </section>
  )
}
