import assert from 'node:assert/strict'
import { access, readFile } from 'node:fs/promises'
import test from 'node:test'

const out = new URL('../showcase/out/', import.meta.url)
const html = path => readFile(new URL(path, out), 'utf8')

test('Pages opens on the hotel homepage and each room has its own static URL', async () => {
  const home = await html('index.html')
  assert.match(home, /id="hotel-title"/)
  assert.match(home, /id="gallery"/)
  assert.match(home, /id="contacts"/)

  const catalog = await html('rooms/index.html')
  const links = [...catalog.matchAll(/href="([^"]*\/rooms\/(\d+)\/)"/g)]
  assert.deepEqual(links.map(link => link[2]), ['1', '2', '3', '4'])
  for (const [, href, id] of links) {
    assert.ok(home.includes('href="' + href + '"'))
    const room = await html('rooms/' + id + '/index.html')
    assert.match(room, /class="stage-photo"/)
    assert.match(room, /class="calendar-grid"/)
    assert.match(room, /class="demo-stay"/)
    assert.doesNotMatch(room, /class="guest-form"|autocomplete="tel"/i)
  }
  for (const path of ['admin', 'api']) {
    await assert.rejects(access(new URL(path, out)), { code: 'ENOENT' })
  }
})
