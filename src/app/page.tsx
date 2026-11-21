import Link from 'next/link'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import HomeHero from '@/components/HomeHero'
import HotelFooter from '@/components/HotelFooter'
import Gallery from '@/components/Gallery'
import RoomTile from '@/components/RoomTile'

export default async function Home() {
  const locale = (await cookies()).get('locale')?.value === 'en' ? 'en' : 'ru'
  const ru = locale === 'ru'
  const rooms = await prisma.room.findMany({ orderBy: { id: 'asc' }, take: 4 })
  return (
    <div id="top" className="hotel">
      <main>
        <HomeHero locale={locale} />
        <section className="home-rooms editorial">
          <div className="section-heading">
            <h2>{ru ? 'Наши номера' : 'Our rooms'}</h2>
            <Link className="pill" href="/rooms">
              {ru ? 'Все номера' : 'All rooms'} ↗
            </Link>
          </div>
          <div className="room-grid">
            {rooms.map((room) => (
              <RoomTile key={room.id} room={room} locale={locale} />
            ))}
          </div>
        </section>
        <section className="place editorial">
          <h2>{ru ? 'Форос' : 'Foros'}</h2>
          <div>
            <p>
              {ru
                ? 'На южном берегу Крыма, между Чёрным морем и Крымскими горами.'
                : 'On the southern coast of Crimea, between the Black Sea and the Crimean Mountains.'}
            </p>
          </div>
        </section>
        <Gallery locale={locale} />
      </main>
      <HotelFooter locale={locale} />
    </div>
  )
}
