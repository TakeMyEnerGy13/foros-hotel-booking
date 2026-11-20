import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { validStay, overlapFilter, hotelToday } from '@/lib/stay'
import { cookies } from 'next/headers'
import RoomsNav from '@/components/RoomsNav'
import Gallery from '@/components/Gallery'

interface Props {
  searchParams: Promise<{ checkIn?: string; checkOut?: string }>
}

export default async function RoomsPage({ searchParams }: Props) {
  const cookieStore = await cookies()
  const locale = cookieStore.get('locale')?.value || 'ru'
  const { checkIn, checkOut } = await searchParams

  const isSearching = Boolean(checkIn && checkOut && validStay(checkIn, checkOut) && checkIn >= hotelToday())
  let unavailableRoomIds: number[] = []
  if (isSearching && checkIn && checkOut) {
    const conflictingBookings = await prisma.booking.findMany({
      where: overlapFilter(checkIn, checkOut),
      select: { roomId: true }
    })
    unavailableRoomIds = conflictingBookings.map(b => b.roomId)
  }

  const rooms = await prisma.room.findMany({ orderBy: { id: 'asc' } })
  const availableRooms = isSearching ? rooms.filter(r => !unavailableRoomIds.includes(r.id)) : rooms
  const unavailableRooms = isSearching ? rooms.filter(r => unavailableRoomIds.includes(r.id)) : []

  return (
    <main className="min-h-screen bg-stone-50">

      <RoomsNav locale={locale} />

      {/* Отступ под фиксированную шапку */}
      <div style={{height: '72px'}} />

      <div className="relative py-24 bg-stone-900 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{backgroundImage: "url('https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1600')"}}
        />
        <div className="relative text-center text-white">
          <p className="text-xs uppercase text-amber-400 mb-4 font-sans">
            {locale === 'ru' ? 'Форос · Крым' : 'Foros · Crimea'}
          </p>
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            {locale === 'ru' ? 'Наши номера' : 'Our Rooms'}
          </h1>
          {(checkIn || checkOut) && !isSearching && (
            <p role="alert" className="text-amber-300 mt-3">{locale === 'ru' ? 'Проверьте даты. Показаны все номера.' : 'Check your dates. Showing all rooms.'}</p>
          )}
          {isSearching && (
            <p className="text-amber-300 font-sans text-sm mt-3">
              {locale === 'ru' ? `Поиск: ${checkIn} — ${checkOut}` : `Search: ${checkIn} — ${checkOut}`}
              <Link href="/rooms" className="ml-4 text-white/50 hover:text-white underline">
                {locale === 'ru' ? 'Сбросить' : 'Reset'}
              </Link>
            </p>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-20">
        {isSearching && (
          <p className="text-xs uppercase text-amber-600 mb-8 font-sans">
            {locale === 'ru'
              ? `Свободно: ${availableRooms.length} из ${rooms.length} номеров`
              : `Available: ${availableRooms.length} of ${rooms.length} rooms`}
          </p>
        )}

        <div className="flex flex-col gap-8">
          {availableRooms.map((room, index) => (
            <div
              key={room.id}
              className={`grid grid-cols-1 md:grid-cols-2 ${index % 2 !== 0 ? 'md:grid-flow-dense' : ''} border border-stone-200 bg-white hover:shadow-lg transition-shadow duration-300`}
            >
              <div className={`relative overflow-hidden ${index % 2 !== 0 ? 'md:col-start-2' : ''}`}>
                <img
                  src={room.imageUrl}
                  alt={room.name}
                  className="w-full h-72 md:h-full object-cover hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 bg-amber-400 text-black text-xs font-sans font-bold uppercase px-3 py-1.5">
                  {room.price.toLocaleString('ru-RU')} ₽ / {locale === 'ru' ? 'ночь' : 'night'}
                </div>
                {isSearching && (
                  <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-sans font-bold uppercase px-3 py-1.5">
                    {locale === 'ru' ? 'Свободен' : 'Available'}
                  </div>
                )}
              </div>
              <div className={`flex flex-col justify-center p-10 ${index % 2 !== 0 ? 'md:col-start-1 md:row-start-1' : ''}`}>
                <p className="text-xs uppercase text-amber-600 mb-3 font-sans">
                  {locale === 'ru' ? `Номер 0${room.id}` : `Room 0${room.id}`}
                </p>
                <h2 className="text-3xl text-stone-800 mb-4">
                  {locale === 'en' ? room.nameEn : room.name}
                </h2>
                <p className="text-stone-500 font-sans text-sm leading-relaxed mb-6">
                  {locale === 'en' ? room.descriptionEn : room.description}
                </p>
                <div className="flex gap-6 mb-8 font-sans text-sm text-stone-500">
                  <div className="flex items-center gap-2">
                    <span>👥</span>
                    <span>{locale === 'ru' ? `До ${room.capacity} гостей` : `Up to ${room.capacity} guests`}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>📶</span>
                    <span>Wi-Fi</span>
                  </div>
                </div>
                <Link
                  href={isSearching ? `/rooms/${room.id}?checkIn=${checkIn}&checkOut=${checkOut}` : `/rooms/${room.id}`}
                  className="inline-block self-start border border-stone-800 text-stone-800 hover:bg-stone-800 hover:text-white font-sans text-xs uppercase px-8 py-3 transition-all duration-300"
                >
                  {locale === 'ru' ? 'Подробнее и бронь' : 'Details & Book'}
                </Link>
              </div>
            </div>
          ))}

          {unavailableRooms.length > 0 && (
            <>
              <div className="pt-8 pb-4 border-t border-stone-200">
                <p className="text-xs uppercase text-red-400 font-sans">
                  {locale === 'ru' ? 'Занято на выбранные даты' : 'Unavailable for selected dates'}
                </p>
              </div>
              {unavailableRooms.map((room) => (
                <Link
                  key={room.id}
                  href={`/rooms/${room.id}?checkIn=${checkIn}&checkOut=${checkOut}`}
                  className="grid grid-cols-1 md:grid-cols-2 border border-stone-200 bg-white opacity-60 hover:opacity-90 transition-opacity duration-300"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={room.imageUrl}
                      alt={room.name}
                      className="w-full h-72 md:h-full object-cover grayscale"
                    />
                    <div className="absolute top-4 right-4 bg-red-400 text-white text-xs font-sans font-bold uppercase px-3 py-1.5">
                      {locale === 'ru' ? 'Занят' : 'Unavailable'}
                    </div>
                  </div>
                  <div className="flex flex-col justify-center p-10">
                    <p className="text-xs uppercase text-stone-400 mb-3 font-sans">
                      {locale === 'ru' ? `Номер 0${room.id}` : `Room 0${room.id}`}
                    </p>
                    <h2 className="text-3xl text-stone-400 mb-3">
                      {locale === 'en' ? room.nameEn : room.name}
                    </h2>
                    <p className="text-stone-400 font-sans text-sm leading-relaxed mb-6">
                      {locale === 'ru'
                        ? 'Занят на выбранные даты — нажмите чтобы посмотреть свободные даты'
                        : 'Unavailable for selected dates — click to see available dates'}
                    </p>
                    <span className="inline-block self-start border border-stone-300 text-stone-400 font-sans text-xs uppercase px-8 py-3">
                      {locale === 'ru' ? 'Посмотреть календарь' : 'View calendar'}
                    </span>
                  </div>
                </Link>
              ))}
            </>
          )}
        </div>
      </div>

      <footer className="bg-stone-900 text-stone-500 py-16 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12 pb-12 border-b border-stone-800">
            <div>
              <h2 className="text-lg font-bold text-white uppercase mb-4">Берег Радости</h2>
              <p className="text-sm font-sans">
                {locale === 'ru' ? 'Форос, Южный берег Крыма' : 'Foros, Southern Coast of Crimea'}
              </p>
            </div>
            <div>
              <h4 className="text-xs uppercase text-white mb-4 font-sans">
                {locale === 'ru' ? 'Навигация' : 'Navigation'}
              </h4>
              <div className="flex flex-col gap-2">
                <Link href="/" className="text-sm font-sans hover:text-white transition-colors">
                  {locale === 'ru' ? 'Главная' : 'Home'}
                </Link>
                <Link href="/rooms" className="text-sm font-sans hover:text-white transition-colors">
                  {locale === 'ru' ? 'Номера' : 'Rooms'}
                </Link>
              </div>
            </div>
            <div>
              <h4 className="text-xs uppercase text-white mb-4 font-sans">
                {locale === 'ru' ? 'Контакты' : 'Contacts'}
              </h4>
              <p className="text-sm font-sans">+7 (978) 000-00-00</p>
              <p className="text-sm font-sans">info@beregradosti.ru</p>
            </div>
          </div>
          <p className="text-center text-sm font-sans">
            {locale === 'ru' ? '© 2025 Берег Радости. Все права защищены.' : '© 2025 Shore of Joy. All rights reserved.'}
          </p>
        </div>
      </footer>
    </main>
  )
}