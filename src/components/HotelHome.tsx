import Link from '@/components/SiteLink'
import type { TileRoom } from './RoomTile'
import HomeHero from '@/components/HomeHero'
import HotelFooter from '@/components/HotelFooter'
import Gallery from '@/components/Gallery'
import RoomTile from '@/components/RoomTile'

export default function HotelHome({ locale, rooms, today }: { locale: string; rooms: TileRoom[]; today: string }) {
  const ru = locale === 'ru'
  return (
    <div id="top" className="hotel">
      <main>
        <HomeHero locale={locale} today={today} />
        <section className="home-rooms editorial">
          <div className="section-heading">
            <h2>{ru ? 'Наши номера' : 'Our rooms'}</h2>
            <Link className="all-rooms-link" href="/rooms">
              {ru ? 'Все номера' : 'All rooms'}
            </Link>
          </div>
          <div className="room-grid">
            {rooms.map((room) => (
              <RoomTile key={room.id} room={room} locale={locale} />
            ))}
          </div>
        </section>
        <section className="home-place" aria-labelledby="foros-title">
          <h2 id="foros-title">{ru ? 'Форос' : 'Foros'}</h2>
          <p>
            {ru
              ? 'У Фороса свой рисунок и свои краски. Светлый камень гор, густая зелень парков и глубокая синева моря вместе складываются в пейзаж, который легко узнать даже на старой чёрно-белой открытке — по одному лишь силуэту.'
              : 'Foros has a palette and an outline of its own. Pale mountain rock, deep green parkland and the blue of the sea make a landscape you could recognise even on an old black-and-white postcard, just by its silhouette.'}
          </p>
        </section>
        <Gallery locale={locale} />
      </main>
      <HotelFooter locale={locale} />
    </div>
  )
}
