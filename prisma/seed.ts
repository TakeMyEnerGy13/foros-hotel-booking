import { PrismaClient, type Prisma } from '@prisma/client'

import rooms from './rooms.json' with { type: 'json' }

const prisma = new PrismaClient()

async function seedRooms(tx: Prisma.TransactionClient) {
  if (await tx.room.findFirst({ select: { id: true } })) {
    throw new Error('Демонстрационные номера можно создать только в пустой базе номеров.')
  }

  await tx.room.createMany({
    data: rooms,
  })
}

prisma.$transaction(seedRooms, { isolationLevel: 'Serializable' })
  .then(() => console.log('Созданы четыре демонстрационных номера.'))
  .catch((error: Error) => {
    console.error(error.message)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
