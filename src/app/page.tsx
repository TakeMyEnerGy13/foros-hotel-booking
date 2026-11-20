import Link from 'next/link'
import { cookies } from 'next/headers'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import SearchButton from '@/components/SearchButton'
import WeatherWidget from '@/components/WeatherWidget'
import MenuButton from '@/components/MenuButton'
import SocialLinks from '@/components/SocialLinks'
import Gallery from '@/components/Gallery'

export default async function Home() {
  const cookieStore = await cookies()
  const locale = cookieStore.get('locale')?.value || 'ru'

  const glassStyle = {
    background: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    boxShadow: '0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.15)',
  }

  return (
    <main>

      {/* Hero — полный экран */}
      <div className="h-screen relative overflow-hidden">

        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{backgroundImage: "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920')"}}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/70" />

        {/* Навигация */}
        <nav className="absolute top-0 left-0 right-0 z-50 px-10 py-6 flex justify-between items-center">
          <MenuButton locale={locale} glassStyle={glassStyle} />
          <div className="flex items-center gap-4">
            <LanguageSwitcher currentLocale={locale} />
            <Link
              href="/rooms"
              style={{...glassStyle, borderRadius: '16px'}}
              className="px-6 py-2 text-white text-xs uppercase hover:bg-white/20 transition-all inline-block"
            >
              {locale === 'ru' ? 'Номера' : 'Rooms'}
            </Link>
          </div>
        </nav>

        {/* Центральный контент */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
          <img
            src="/logo.png"
            alt="Берег Радости"
            className="w-40 h-40 md:w-52 md:h-52 mb-8 drop-shadow-2xl"
          />
          <h1
            className="text-6xl md:text-8xl font-bold mb-5 leading-tight"
            style={{fontFamily: "'DM Serif Display', serif", textShadow: '0 2px 20px rgba(0,0,0,0.4)'}}
          >
            {locale === 'ru' ? 'Берег Радости' : 'Shore of Joy'}
          </h1>
          <p
            className="text-white/70 text-base md:text-lg uppercase"
            style={{fontFamily: "'Inter', sans-serif", fontWeight: 300}}
          >
            {locale === 'ru' ? 'Форос · Крым · Южный берег Крыма' : 'Foros · Crimea · Southern Coast'}
          </p>
        </div>

        {/* Температура */}
        <div className="absolute bottom-10 left-10 z-10">
          <WeatherWidget locale={locale} />
        </div>

        {/* Виджет бронирования */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 w-full max-w-2xl px-4">
          <form action="/rooms" method="get"
            style={{...glassStyle, borderRadius: '20px'}}
            className="flex flex-col md:flex-row items-stretch overflow-hidden"
          >
            <div className="flex-1 px-6 py-4 border-b md:border-b-0 md:border-r border-white/15">
              <label
                className="block text-white/50 mb-1 uppercase"
                style={{fontFamily: "'Inter', sans-serif", fontSize: '10px'}}
              >
                {locale === 'ru' ? 'Дата заезда' : 'Check-in'}
              </label>
              <input
                id="checkIn" name="checkIn"
                type="date"
                className="bg-transparent text-white text-sm focus:outline-none w-full [color-scheme:dark]"
                style={{fontFamily: "'Inter', sans-serif"}}
              />
            </div>
            <div className="flex-1 px-6 py-4 border-b md:border-b-0 md:border-r border-white/15">
              <label
                className="block text-white/50 mb-1 uppercase"
                style={{fontFamily: "'Inter', sans-serif", fontSize: '10px'}}
              >
                {locale === 'ru' ? 'Дата выезда' : 'Check-out'}
              </label>
              <input
                id="checkOut" name="checkOut"
                type="date"
                className="bg-transparent text-white text-sm focus:outline-none w-full [color-scheme:dark]"
                style={{fontFamily: "'Inter', sans-serif"}}
              />
            </div>
            <div className="flex items-center justify-center">
              <SearchButton locale={locale} />
            </div>
          </form>
        </div>

        {/* Соц. сети */}
        <div className="absolute bottom-10 right-10 z-10">
          <SocialLinks />
        </div>
      </div>

      {/* Галерея */}
      <Gallery />

    </main>
  )
}