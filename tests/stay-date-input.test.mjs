import assert from 'node:assert/strict'
import test from 'node:test'
import { createRequire } from 'node:module'
import { register } from 'ts-node'

register({ skipProject: true, transpileOnly: true, compilerOptions: { module: 'CommonJS' } })
const { maskStayDate, readStayDate, stayForNights } = createRequire(import.meta.url)('../src/lib/stay.ts')

test('a click selects one night and two clicks fill the inclusive range in either direction', () => {
  assert.deepEqual(stayForNights('2026-11-21', '2026-11-21', []), { checkIn: '2026-11-21', checkOut: '2026-11-22' })
  const fiveNights = { checkIn: '2026-11-21', checkOut: '2026-11-26' }
  assert.deepEqual(stayForNights('2026-11-21', '2026-11-25', []), fiveNights)
  assert.deepEqual(stayForNights('2026-11-25', '2026-11-21', []), fiveNights)
})

test('booked nights cannot be selected as an endpoint or crossed; consecutive stays may touch', () => {
  const bookings = [{ checkIn: '2026-11-23', checkOut: '2026-11-26' }]
  assert.deepEqual(stayForNights('2026-11-21', '2026-11-22', bookings), { checkIn: '2026-11-21', checkOut: '2026-11-23' })
  for (const [a, b] of [['22','23'], ['23','23'], ['23','26'], ['21','27'], ['27','21']]) {
    assert.equal(stayForNights('2026-11-' + a, '2026-11-' + b, bookings), undefined)
  }
  assert.deepEqual(stayForNights('2026-11-26', '2026-11-26', bookings), { checkIn: '2026-11-26', checkOut: '2026-11-27' })
})

test('the morning after the last night rolls over at leap days and year boundaries', () => {
  assert.deepEqual(stayForNights('2028-02-28', '2028-02-29', []), { checkIn: '2028-02-28', checkOut: '2028-03-01' })
  assert.deepEqual(stayForNights('2026-12-30', '2026-12-31', []), { checkIn: '2026-12-30', checkOut: '2027-01-01' })
})

test('guest date entry accepts digits, localized dates and pasted ISO dates', () => {
  for (const value of ['09052027', '090527', '9.5.2027', '09/05/2027', '09.05.27', ' 2027-05-09 ']) {
    assert.equal(readStayDate(value), '2027-05-09')
  }
  assert.equal(readStayDate('29022028'), '2028-02-29')
})

test('incomplete or impossible dates cannot become room search parameters', () => {
  for (const value of ['', '0905', '9/05', '31042027', '29022027', '2027-13-01', '9/5/x27']) {
    assert.equal(readStayDate(value), '')
  }
})

test('typing adds each boundary immediately and caps the year at four digits', () => {
  for (const [digits, formatted] of [
    ['3', '3'], ['30', '30.'], ['300', '30.0'], ['3007', '30.07.'],
    ['300720', '30.07.20'], ['3007202812345', '30.07.2028'],
  ]) {
    assert.equal(maskStayDate(digits, '.'), formatted)
  }
  assert.equal(maskStayDate('30/07/2028', '/'), '30/07/2028')
  assert.equal(maskStayDate('abc', '.'), '')
})

test('short months and two-digit years resolve to full calendar dates', () => {
  for (let month = 2; month <= 9; month++) {
    const expected = '2026-0' + month + '-15'
    assert.equal(readStayDate('15' + month + '26'), expected)
    assert.equal(readStayDate('15' + month + '2026'), expected)
    assert.equal(readStayDate('15.' + month + '.26'), expected)
  }
  assert.equal(readStayDate('31.12.26'), '2026-12-31')
  assert.equal(readStayDate('29.02.26'), '')
  assert.equal(readStayDate('30.07.2'), '')
  assert.equal(readStayDate('30.07.202'), '')
})
