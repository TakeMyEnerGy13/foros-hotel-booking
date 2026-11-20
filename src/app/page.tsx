import Link from 'next/link'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { coastPhotos } from '@/lib/hotel-photos'
import RoomsNav from '@/components/RoomsNav'
import HotelFooter from '@/components/HotelFooter'
import WeatherWidget from '@/components/WeatherWidget'
import Gallery, { PhotoStage } from '@/components/Gallery'
import StaySearch from '@/components/StaySearch'
import RoomTile from '@/components/RoomTile'

export default async function Home() {
  const locale = (await cookies()).get('locale')?.value === 'en' ? 'en' : 'ru'
  const ru = locale === 'ru'
  const rooms = await prisma.room.findMany({ orderBy: { id: 'asc' }, take: 4 })
  return (
    <div id="top" className="hotel">
      <RoomsNav locale={locale} />
      <main>
        <PhotoStage
          photos={coastPhotos.slice(0, 4).map((p) => ({ src: p.src, caption: p[locale] }))}
          title={ru ? 'Берег Радости' : 'Shore of Joy'}
          label={ru ? 'Гостиница в Форосе' : 'A hotel in Foros'}
          locale={locale}
        />
        <StaySearch locale={locale} />
        <section className="editorial">
          <div className="section-heading">
            <div>
              <span className="label">{ru ? 'Проживание' : 'Accommodation'}</span>
              <h2>{ru ? 'Наши номера' : 'Our rooms'}</h2>
            </div>
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
          <div>
            <span className="label">{ru ? 'Расположение' : 'Location'}</span>
            <h2>{ru ? 'Форос' : 'Foros'}</h2>
          </div>
          <div>
            <p>
              {ru
                ? 'На южном берегу Крыма, между Чёрным морем и Крымскими горами.'
                : 'On the southern coast of Crimea, between the Black Sea and the Crimean Mountains.'}
            </p>
            <WeatherWidget locale={locale} />
          </div>
        </section>
        <Gallery locale={locale} />
      </main>
      <HotelFooter locale={locale} />
    </div>
  )
}
