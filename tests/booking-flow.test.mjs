import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import test from 'node:test'
import { PrismaClient } from '@prisma/client'

test('local hotel booking flow', async t => {
  const site = new URL(process.env.TEST_SITE_URL || 'http://127.0.0.1:3000')
  const database = new URL(process.env.DATABASE_URL)
  const loopback = ['127.0.0.1', 'localhost', '[::1]']
  assert.ok(loopback.includes(site.hostname) && loopback.includes(database.hostname), 'Use local test services')
  assert.match(database.pathname, /(?:test|preview)$/)
  const db = new PrismaClient()
  const label = 'Test room ' + randomUUID()
  const year = new Date().getUTCFullYear() + 1
  const date = day => year + '-04-' + String(day).padStart(2, '0')
  function request(path, method = 'GET', body, cookie) {
    return fetch(new URL(path, site), {
      method, redirect: 'manual',
      headers: { 'Content-Type': 'application/json', ...(cookie && { Cookie: cookie }) },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  }

  t.after(() => db.$disconnect())
  const room = await db.room.create({ data: {
    name: label, nameEn: label, description: label, descriptionEn: label,
    price: 5000, capacity: 2, images: [], imageUrl: '/logo.png',
  } })
  try {
    const roomUrl = '/rooms/' + room.id
    assert.ok((await (await request(roomUrl)).text()).includes(label), 'Site must use this test database')
    const guest = { roomId: room.id, guestName: label, guestPhone: '+12025550123', guestEmail: 'guest@example.invalid' }
    const stay = (from, to) => ({ ...guest, checkIn: date(from), checkOut: date(to) })
    const admin = '/api/admin/bookings'
    const login = await request('/api/admin/login', 'POST', { password: process.env.ADMIN_PASSWORD })
    assert.equal(login.status, 200, 'Configure the local admin password')
    const cookie = login.headers.get('set-cookie').split(';')[0]
    let bookingId

    await t.test('catalog handles ambiguous date links and preserves an unambiguous date', async () => {
      for (const [duplicate, single] of [['checkIn', 'checkOut'], ['checkOut', 'checkIn']]) {
        const query = new URLSearchParams([[duplicate, date(1)], [duplicate, date(2)], [single, date(3)]])
        const response = await request('/rooms?' + query)
        assert.equal(response.status, 200)
        const html = await response.text()
        assert.ok(html.includes('Проверьте даты. Показаны все номера.'))
        assert.ok(html.includes(label))
        assert.ok(html.includes('value="' + date(3) + '"'))
      }
    })

    await t.test('guest data and changes require an admin session', async () => {
      assert.equal((await request('/api/bookings')).status, 405)
      assert.equal((await request(admin)).status, 401)
      assert.equal((await request(admin, 'POST', stay(1, 2))).status, 401)
      for (const method of ['PUT', 'DELETE']) {
        assert.equal((await request(admin + '/0', method)).status, 401)
      }
      assert.equal((await request(admin, 'GET', undefined, cookie)).status, 200)
    })
    await t.test('one concurrent request wins; a new guest can arrive on checkout day', async () => {
      const create = () => request('/api/bookings', 'POST', stay(10, 14))
      const results = await Promise.all([create(), create()])
      assert.deepEqual(results.map(r => r.status).sort(), [200, 409])
      const booked = await results.find(r => r.ok).json()
      assert.equal(booked.status, 'pending')
      bookingId = booked.id
      assert.equal((await request('/api/bookings', 'POST', stay(14, 16))).status, 200)
    })
    await t.test('admin edits check availability and cancelled nights become available', async () => {
      const path = admin + '/' + bookingId
      assert.equal((await request(admin, 'POST', stay(11, 13), cookie)).status, 409)
      assert.equal((await request(path, 'PUT', stay(13, 15), cookie)).status, 409)
      assert.equal((await request(path, 'PUT', { ...stay(10, 14), status: 'confirmed' }, cookie)).status, 200)
      const searchUrl = roomUrl + '?checkIn=' + date(10) + '&checkOut=' + date(14)
      assert.ok(!(await (await request(searchUrl)).text()).includes('Забронировать ·'))
      assert.equal((await request(path, 'PUT', { ...stay(10, 14), status: 'cancelled' }, cookie)).status, 200)
      assert.ok((await (await request(searchUrl)).text()).includes('Забронировать ·'))
      assert.equal((await request('/api/bookings', 'POST', stay(10, 14))).status, 200)
      assert.equal((await request(path, 'PUT', { ...stay(10, 14), status: 'confirmed' }, cookie)).status, 409)
    })
    await t.test('rejects reversed, nonexistent and past dates', async () => {
      for (const [checkIn, checkOut] of [[date(23), date(22)], [year + '-02-30', date(4)], ['2000-01-01', '2000-01-02']]) {
        assert.equal((await request('/api/bookings', 'POST', { ...guest, checkIn, checkOut })).status, 400)
      }
    })
    await t.test('a guest hold lasts three hours, expires across availability checks and cannot be confirmed late', async () => {
      const payload = stay(3, 5)
      const create = () => request('/api/bookings', 'POST', payload)
      const receipt = await (await create()).json()
      const row = await db.booking.findUniqueOrThrow({ where: { id: receipt.id } })
      assert.equal(receipt.status, 'pending')
      const duration = 3 * 60 * 60 * 1000
      assert.equal(Date.parse(receipt.holdExpiresAt) - row.createdAt.getTime(), duration)
      const path = admin + '/' + receipt.id
      const edited = await (await request(path, 'PUT', { ...payload, status: 'pending', notes: 'Called' }, cookie)).json()
      assert.equal(edited.holdExpiresAt, receipt.holdExpiresAt)
      assert.equal((await create()).status, 409)
      await db.booking.update({ where: { id: row.id }, data: { createdAt: new Date(Date.now() - duration - 1000) } })
      const rows = await (await request(admin, 'GET', undefined, cookie)).json()
      assert.equal(rows.find(b => b.id === row.id).status, 'expired')
      assert.equal((await request(path, 'PUT', { ...payload, status: 'confirmed' }, cookie)).status, 409)
      const query = '?checkIn=' + date(3) + '&checkOut=' + date(5)
      assert.ok((await (await request(roomUrl + query)).text()).includes('Забронировать ·'))
      const catalog = await (await request('/rooms' + query)).text()
      const fullResults = catalog.split('<div class="room-grid">')[1]?.split(/<section |<h2 class="subheading">|<\/section>/)[0]
      assert.ok(fullResults?.includes('href="' + roomUrl + query.replace('&', '&amp;') + '"'))
      const replacement = await (await create()).json()
      assert.equal(replacement.status, 'pending')
      assert.equal((await request(admin + '/' + replacement.id, 'PUT', { ...payload, status: 'confirmed' }, cookie)).status, 200)
      await db.booking.update({ where: { id: replacement.id }, data: { createdAt: new Date(Date.now() - duration - 1000) } })
      assert.equal((await create()).status, 409)
    })
    await t.test('search offers the bookable part of a stay and distinguishes it from a fully occupied room', async () => {
      const search = '/rooms?checkIn=' + date(21) + '&checkOut=' + date(29)
      const option = roomUrl + '?checkIn=' + date(22) + '&checkOut=' + date(28)
      for (const [from, to] of [[21, 22], [28, 29]]) {
        assert.equal((await request('/api/bookings', 'POST', stay(from, to))).status, 200)
      }
      assert.equal((await request(admin, 'POST', { ...stay(24, 25), status: 'cancelled' }, cookie)).status, 200)
      const html = await (await request(search)).text()
      const options = html.match(/<section aria-labelledby="partial-rooms">([\s\S]*?)<\/section>/)?.[1]
      assert.ok(options?.includes(label))
      assert.ok(options.includes(option.replace('&', '&amp;') + '#booking'))
      assert.ok((await (await request(option)).text()).includes('Забронировать ·'))
      assert.equal((await request('/api/bookings', 'POST', stay(22, 28))).status, 200)
      const occupied = await (await request(search)).text()
      assert.ok(!occupied.includes(option.replace('&', '&amp;') + '#booking'))
      assert.ok(occupied.match(/<h2 class="subheading">Заняты на эти даты<\/h2>([\s\S]*?)<\/section>/)?.[1].includes(label))
    })
  } finally {
    await db.$transaction([
      db.booking.deleteMany({ where: { roomId: room.id, guestName: label } }),
      db.room.delete({ where: { id: room.id } }),
    ])
  }
})
