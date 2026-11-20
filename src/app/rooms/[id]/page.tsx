import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { hotelToday, overlaps, validStay } from '@/lib/stay'
import { cookies } from 'next/headers'
import BookingCalendar from './BookingCalendar'
import ImageSlider from './ImageSlider'
import RoomsNav from '@/components/RoomsNav'
import Gallery from '@/components/Gallery'

export default async function RoomPage({ params, searchParams }: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ checkIn?: string; checkOut?: string }>
}) {
  const { id } = await params
  if (!/^\d+$/.test(id) || Number(id) > 2147483647) notFound()
  const { checkIn = '', checkOut = '' } = await searchParams
  const cookieStore = await cookies()
  const locale = cookieStore.get('locale')?.value || 'ru'

  const room = await prisma.room.findUnique({
    where: { id: parseInt(id) },
    include: { bookings: { where: { status: { not: 'cancelled' } }, select: { checkIn: true, checkOut: true } } }
  })

  if (!room) notFound()

  const bookings = room.bookings.map(b => ({ checkIn: b.checkIn.toISOString().slice(0, 10), checkOut: b.checkOut.toISOString().slice(0, 10) }))
  const today = hotelToday()
  const requested = { checkIn, checkOut }
  const initialStay = validStay(checkIn, checkOut) && checkIn >= today && !bookings.some(b => overlaps(b, requested)) ? requested : undefined

  const sectionLabel = {
    fontFamily: "'Inter', sans-serif",
    fontWeight: 500,
    letterSpacing: '0.08em',
    fontSize: '11px'
  }

  const bodyText = {
    fontFamily: "'Inter', sans-serif",
    fontWeight: 300
  }

  return (
    <main className="min-h-screen bg-stone-50">

      <RoomsNav locale={locale} />

      {/* Отступ под фиксированную шапку */}
      <div style={{height: '72px'}} />

      {/* Слайдер */}
      <div className="bg-stone-100">
        <div className="max-w-6xl mx-auto px-8 pt-10">
          <ImageSlider
            images={room!.images.length > 0 ? room!.images : [room!.imageUrl]}
            name={locale === 'en' ? room!.nameEn : room!.name}
          />
        </div>
      </div>

      {/* Основной контент */}
      <div className="max-w-6xl mx-auto px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">

          {/* Левая колонка */}
          <div className="lg:col-span-3">

            <div className="mb-10 pb-10 border-b border-stone-200">
              <p className="uppercase text-amber-600 mb-3" style={sectionLabel}>
                {locale === 'ru' ? `Номер 0${room!.id}` : `Room 0${room!.id}`}
              </p>
              <h1 className="text-5xl text-stone-800 mb-4 leading-tight" style={{fontStyle: 'italic'}}>
                {locale === 'en' ? room!.nameEn : room!.name}
              </h1>
              <p className="text-3xl text-amber-600" style={{fontFamily: "'Inter', sans-serif", fontWeight: 300}}>
                {room!.price.toLocaleString('ru-RU')} ₽
                <span className="text-lg text-stone-400 ml-2">
                  / {locale === 'ru' ? 'ночь' : 'night'}
                </span>
              </p>
            </div>

            <div className="mb-10 pb-10 border-b border-stone-200">
              <p className="uppercase text-amber-600 mb-5" style={sectionLabel}>
                {locale === 'ru' ? 'О номере' : 'About the room'}
              </p>
              <p className="text-stone-600 text-lg leading-relaxed" style={bodyText}>
                {locale === 'en' ? room!.descriptionEn : room!.description}
              </p>
            </div>

            <div className="mb-10">
              <p className="uppercase text-amber-600 mb-6" style={sectionLabel}>
                {locale === 'ru' ? 'Характеристики' : 'Features'}
              </p>
              <div className="grid grid-cols-2 gap-px bg-stone-200">
                {[
                  { icon: '👥', label: locale === 'ru' ? 'Вместимость' : 'Capacity', value: locale === 'ru' ? `До ${room!.capacity} гостей` : `Up to ${room!.capacity} guests` },
                  { icon: '🌊', label: locale === 'ru' ? 'Вид' : 'View', value: locale === 'ru' ? 'На море' : 'Sea view' },
                  { icon: '📶', label: 'Wi-Fi', value: locale === 'ru' ? 'Бесплатно' : 'Free' },
                  { icon: '🍳', label: locale === 'ru' ? 'Завтрак' : 'Breakfast', value: locale === 'ru' ? 'Включён' : 'Included' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-6 bg-white">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <div className="uppercase mb-1 text-stone-400" style={{fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: '10px', letterSpacing: '0.08em'}}>
                        {item.label}
                      </div>
                      <div className="text-stone-800 text-base" style={bodyText}>
                        {item.value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Правая колонка — календарь */}
          <div className="lg:col-span-2">
            <div className="sticky top-24">
              <BookingCalendar
                roomId={room!.id}
                key={[room.id, checkIn, checkOut].join('/')}
                today={today}
                initialStay={initialStay}
                price={room!.price}
                bookings={bookings}
              />
            </div>
          </div>
        </div>

        {/* Кнопка возврата */}
<Link
  href="/rooms"
  className="inline-flex items-center gap-6 border border-stone-300 text-stone-600 hover:border-stone-800 hover:text-stone-800 hover:bg-stone-800 hover:text-white font-sans text-xs uppercase px-8 py-4 transition-all duration-300 group"
>
  <span className="transition-transform duration-300 group-hover:-translate-x-1">←            </span>
  <span>{locale === 'ru' ? '  Все номера' : 'All rooms'}</span>
</Link>
      </div>

      <footer className="bg-stone-900 text-stone-500 py-16 px-8 mt-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12 pb-12 border-b border-stone-800">
            <div>
              <h2 className="text-lg text-white uppercase mb-4" style={{fontFamily: "'Inter', sans-serif", fontWeight: 600}}>
                Берег Радости
              </h2>
              <p className="text-sm" style={bodyText}>
                {locale === 'ru' ? 'Форос, Южный берег Крыма' : 'Foros, Southern Coast of Crimea'}
              </p>
            </div>
            <div>
              <h4 className="text-xs uppercase text-white mb-4" style={{fontFamily: "'Inter', sans-serif", fontWeight: 500}}>
                {locale === 'ru' ? 'Навигация' : 'Navigation'}
              </h4>
              <div className="flex flex-col gap-2">
                <Link href="/" className="text-sm hover:text-white transition-colors" style={bodyText}>
                  {locale === 'ru' ? 'Главная' : 'Home'}
                </Link>
                <Link href="/rooms" className="text-sm hover:text-white transition-colors" style={bodyText}>
                  {locale === 'ru' ? 'Номера' : 'Rooms'}
                </Link>
              </div>
            </div>
            <div>
              <h4 className="text-xs uppercase text-white mb-4" style={{fontFamily: "'Inter', sans-serif", fontWeight: 500}}>
                {locale === 'ru' ? 'Контакты' : 'Contacts'}
              </h4>
              <p className="text-sm" style={bodyText}>+7 (978) 000-00-00</p>
              <p className="text-sm" style={bodyText}>info@beregradosti.ru</p>
            </div>
          </div>
          <p className="text-center text-sm" style={bodyText}>
            {locale === 'ru' ? '© 2025 Берег Радости. Все права защищены.' : '© 2025 Shore of Joy. All rights reserved.'}
          </p>
        </div>
      </footer>
      <Gallery />
    </main>
  )
}