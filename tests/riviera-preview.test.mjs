import assert from 'node:assert/strict'
import { access, readFile } from 'node:fs/promises'
import test from 'node:test'

const edition = new URL('../editions/riviera/', import.meta.url)

test('editorial headings and room names are editable text with a bundled display font', async () => {
  const html = await readFile(new URL('index.html', edition), 'utf8')
  const labels = [...html.matchAll(/<(h[1-3]|summary)\b[^>]*>([\s\S]*?)<\/\1>/g)]
  assert.ok(labels.length >= 15)
  for (const [, , label] of labels) {
    assert.doesNotMatch(label, /<(?:img|svg|canvas)\b/)
    assert.match(label.replace(/<[^>]+>/g, ''), /[А-Яа-яЁё]/)
  }
  const font = await readFile(new URL('assets/fonts/dance-partner.woff2', edition))
  assert.equal(font.toString('ascii', 0, 4), 'wOF2')
})

test('the independent preview resolves every local link within its own directory', async () => {
  const html = await readFile(new URL('index.html', edition), 'utf8')
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]))
  for (const [, link] of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    if (link.startsWith('#')) {
      assert.ok(ids.has(link.slice(1)), link)
    } else if (!/^(https:|mailto:)/.test(link)) {
      const resolved = new URL(link, edition)
      assert.ok(resolved.href.startsWith(edition.href), link)
      await access(resolved)
    }
  }
})

test('every room in the accordion can be selected in the preview date form', async () => {
  const html = await readFile(new URL('index.html', edition), 'utf8')
  const buttons = [...html.matchAll(/data-book="([^"]+)"/g)].map(match => match[1])
  const options = [...html.matchAll(/<option>([^<]+)<\/option>/g)].map(match => match[1])
  assert.equal(new Set(buttons).size, 5)
  assert.deepEqual(options, buttons)
  assert.doesNotMatch(html, /<form[^>]*(?:action=|method="post")/i)
})
