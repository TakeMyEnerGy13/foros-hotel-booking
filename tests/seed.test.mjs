import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { createRequire } from 'node:module'
import test from 'node:test'
import { PrismaClient } from '@prisma/client'

test('seeding an empty schema creates rooms and a second run preserves the rooms and bookings', async () => {
  const url = new URL(process.env.DATABASE_URL)
  assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(url.hostname))
  assert.match(url.pathname, /(?:test|preview)$/)
  const schema = 'seed_test_' + randomUUID().replaceAll('-', '')
  url.searchParams.set('schema', schema)
  const env = { ...process.env, DATABASE_URL: url.toString() }
  const db = new PrismaClient({ datasourceUrl: url.toString() })
  const admin = new PrismaClient()
  const run = (...args) => spawnSync(process.execPath, args, { encoding: 'utf8', env })
  const seed = () => run('--experimental-strip-types', 'prisma/seed.ts')

  try {
    await admin.$executeRawUnsafe('CREATE SCHEMA "' + schema + '"')
    try {
      const migrate = run(createRequire(import.meta.url).resolve('prisma'), 'db', 'push', '--skip-generate')
      assert.equal(migrate.status, 0, migrate.stderr)
      const first = seed()
      assert.equal(first.status, 0, first.stderr)
      const rooms = await db.room.findMany({ orderBy: { id: 'asc' } })
      assert.equal(rooms.length, 4)
      const booking = await db.booking.create({ data: {
        roomId: rooms[0].id, guestName: 'Test guest', guestEmail: 'guest@example.invalid', guestPhone: '',
        checkIn: new Date('2030-04-01'), checkOut: new Date('2030-04-02'),
      } })

      const repeat = seed()
      assert.equal(repeat.status, 1)
      assert.match(repeat.stderr, /только в пустой базе/)
      assert.deepEqual(await db.room.findMany({ orderBy: { id: 'asc' } }), rooms)
      assert.deepEqual(await db.booking.findMany(), [booking])
    } finally {
      await admin.$executeRawUnsafe('DROP SCHEMA "' + schema + '" CASCADE')
    }
  } finally {
    await Promise.all([db.$disconnect(), admin.$disconnect()])
  }
})
