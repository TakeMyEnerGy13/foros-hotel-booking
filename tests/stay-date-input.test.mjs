import assert from 'node:assert/strict'
import test from 'node:test'
import { createRequire } from 'node:module'
import { register } from 'ts-node'

register({ skipProject: true, transpileOnly: true, compilerOptions: { module: 'CommonJS' } })
const { readStayDate } = createRequire(import.meta.url)('../src/lib/stay.ts')

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
