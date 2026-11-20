import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Сначала удаляем старые данные
  await prisma.booking.deleteMany()
  await prisma.room.deleteMany()

  await prisma.room.createMany({
    data: [
      {
        name: 'Стандартный номер',
        nameEn: 'Standard Room',
        description: 'Уютный номер с видом на город. Включает двуспальную кровать, рабочий стол и бесплатный Wi-Fi.',
        descriptionEn: 'Cozy room with city view. Includes a double bed, work desk and free Wi-Fi.',
        price: 5000,
        capacity: 2,
        imageUrl: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
        images: [
          'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200',
          'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1200',
          'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=1200',
          'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?w=1200',
        ],
      },
      {
        name: 'Делюкс номер',
        nameEn: 'Deluxe Room',
        description: 'Просторный номер с панорамным видом. Ванная с джакузи, мини-бар, зона отдыха.',
        descriptionEn: 'Spacious room with panoramic view. Jacuzzi bathroom, mini-bar, lounge area.',
        price: 9000,
        capacity: 2,
        imageUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
        images: [
          'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200',
          'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1200',
          'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=1200',
          'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1200',
        ],
      },
      {
        name: 'Семейный номер',
        nameEn: 'Family Room',
        description: 'Большой номер для всей семьи. Две спальни, детская кроватка по запросу.',
        descriptionEn: 'Large room for the whole family. Two bedrooms, crib available on request.',
        price: 12000,
        capacity: 4,
        imageUrl: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800',
        images: [
          'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1200',
          'https://images.unsplash.com/photo-1609766857585-ec9cbf4b11de?w=1200',
          'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1200',
          'https://images.unsplash.com/photo-1601565415267-724db0ecf46a?w=1200',
        ],
      },
      {
        name: 'Люкс',
        nameEn: 'Suite',
        description: 'Роскошный люкс с отдельной гостиной, премиум удобствами и персональным консьержем.',
        descriptionEn: 'Luxury suite with separate living room, premium amenities and personal concierge.',
        price: 20000,
        capacity: 2,
        imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
        images: [
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200',
          'https://images.unsplash.com/photo-1631049552057-403cdb8f0658?w=1200',
          'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=1200',
          'https://images.unsplash.com/photo-1592229505726-ca121723b8ef?w=1200',
        ],
      },
    ],
  })
  console.log('✅ Данные обновлены!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())