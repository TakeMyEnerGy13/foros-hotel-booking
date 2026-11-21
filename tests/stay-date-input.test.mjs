import assert from 'node:assert/strict'
import test from 'node:test'
import { createRequire } from 'node:module'
import { register } from 'ts-node'

register({ skipProject: true, transpileOnly: true, compilerOptions: { module: 'CommonJS' } })
const { maskStayDate, readStayDate } = createRequire(import.meta.url)('../src/lib/stay.ts')

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
