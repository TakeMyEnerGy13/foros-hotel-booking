import { freeStaysWithin, validStay } from './availability.js'

const seasonStart = '2027-04-01'
const seasonEnd = '2027-07-01'
const example = { checkIn: '2027-04-21', checkOut: '2027-04-29' }
const dates = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', timeZone: 'UTC' })
const monthName = new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric', timeZone: 'UTC' })
const nightsLabel = new Intl.PluralRules('ru')
const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
const rooms = [
  { name: 'Стандартный номер', photo: 'photo-1631049307264-da0ec9d70304', rate: 5000, blocks: [[4, 8], [14, 16]] },
  { name: 'Делюкс номер', photo: 'photo-1590490360182-c33d57733427', rate: 9000, blocks: [[5, 9], [20, 22], [28, 30]] },
  { name: 'Семейный номер', photo: 'photo-1566665797739-1674de7a421a', rate: 12000, blocks: [[10, 13], [24, 26]] },
  { name: 'Люкс', photo: 'photo-1582719478250-c89cae4dc85b', rate: 20000, blocks: [[2, 6], [19, 30]] },
].map(room => ({
  ...room,
  bookings: ['2027-04-', '2027-05-', '2027-06-'].flatMap(prefix =>
    room.blocks.map(([from, to]) => ({
      checkIn: prefix + String(from).padStart(2, '0'),
      checkOut: prefix + String(to).padStart(2, '0'),
    }))),
}))
const form = document.querySelector('form')
const arrival = form.elements.checkIn
const departure = form.elements.checkOut
const dialog = document.querySelector('#room-dialog')

function node(tag, className, text) {
  const el = document.createElement(tag)
  if (className) el.className = className
  if (text) el.textContent = text
  return el
}

function periodText(stay) {
  return dates.formatRange(new Date(stay.checkIn), new Date(stay.checkOut))
}

function nightCount(stay) {
  const count = (Date.parse(stay.checkOut) - Date.parse(stay.checkIn)) / 86400000
  const labels = { one: 'ночь', few: 'ночи', many: 'ночей', other: 'ночи' }
  return count + ' ' + labels[nightsLabel.select(count)]
}

function calendarMonth(first, room, selected) {
  const section = node('section', 'month')
  section.append(node('h3', '', monthName.format(first)))
  const grid = node('div', 'month-grid')
  weekdays.forEach(day => grid.append(node('span', 'weekday', day)))
  const cursor = new Date(first)
  const month = cursor.getUTCMonth()
  const offset = (cursor.getUTCDay() + 6) % 7
  while (cursor.getUTCMonth() === month) {
    const iso = cursor.toISOString().slice(0, 10)
    const busy = room.bookings.some(b => b.checkIn <= iso && iso < b.checkOut)
    const chosen = selected && selected.checkIn <= iso && iso < selected.checkOut
    const cell = node('span', 'day' + (busy ? ' busy' : chosen ? ' selected' : ''), String(cursor.getUTCDate()))
    cell.setAttribute('aria-label', dates.format(cursor) + ', ' + (busy ? 'занято' : chosen ? 'выбрано' : 'свободно'))
    if (cursor.getUTCDate() === 1) cell.style.gridColumnStart = String(offset + 1)
    grid.append(cell)
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }
  section.append(grid)
  return section
}

function showCalendar(room, requested, selected) {
  document.querySelector('#room-title').textContent = room.name
  document.querySelector('#room-stay').textContent = selected
    ? 'Заезд и выезд · ' + periodText(selected) + ' · ' + nightCount(selected)
    : 'Запрошенный период · ' + periodText(requested)
  const view = selected || requested
  const first = new Date(view.checkIn)
  first.setUTCDate(1)
  const months = document.querySelector('#months')
  months.replaceChildren()
  while (first < new Date(view.checkOut)) {
    months.append(calendarMonth(first, room, selected))
    first.setUTCMonth(first.getUTCMonth() + 1)
  }
  dialog.showModal()
}

function periodButton(room, requested, selected, caption) {
  const button = node('button', 'period', caption)
  button.type = 'button'
  button.setAttribute('aria-haspopup', 'dialog')
  button.setAttribute('aria-label', room.name + ' · ' + caption)
  button.addEventListener('click', () => showCalendar(room, requested, selected))
  return button
}

function card(room, requested, windows) {
  const article = node('article', 'card')
  const img = node('img', 'room-photo')
  img.src = './assets/' + room.photo + '.webp'
  img.alt = ''
  const body = node('div')
  body.append(node('h3', '', room.name), node('p', 'rate', room.rate.toLocaleString('ru-RU') + ' ₽ / ночь'))
  const options = node('div', 'options')
  if (windows.length) {
    body.append(node('p', 'period-label', 'Заезд — выезд'))
    windows.forEach(stay => options.append(periodButton(room, requested, stay, periodText(stay))))
  } else {
    options.append(periodButton(room, requested, null, 'Посмотреть календарь'))
  }
  body.append(options)
  article.append(img, body)
  return article
}

function render(stay) {
  const groups = [
    { title: 'Свободны на весь период', cards: [] },
    { title: 'Частично свободны на эти даты', cards: [] },
    { title: 'Заняты на эти даты', cards: [] },
  ]
  for (const room of rooms) {
    const windows = freeStaysWithin(stay, room.bookings)
    const full = windows.length === 1 && windows[0].checkIn === stay.checkIn && windows[0].checkOut === stay.checkOut
    const group = full ? groups[0] : windows.length ? groups[1] : groups[2]
    group.cards.push(card(room, stay, windows))
  }
  document.querySelector('#summary').textContent = periodText(stay) + ' · ' + nightCount(stay)
  const results = document.querySelector('#results')
  results.replaceChildren()
  for (const group of groups.filter(group => group.cards.length)) {
    const section = node('section', 'group')
    const grid = node('div', 'cards')
    grid.append(...group.cards)
    section.append(node('h2', '', group.title), grid)
    results.append(section)
  }
}

function updateDepartureLimit() {
  if (!arrival.value) return
  const next = new Date(arrival.value)
  next.setUTCDate(next.getUTCDate() + 1)
  departure.min = next.toISOString().slice(0, 10)
}

function loadSearch() {
  const params = new URLSearchParams(location.search)
  const checkIn = params.get('checkIn')
  const checkOut = params.get('checkOut')
  const valid = validStay(checkIn, checkOut) && checkIn >= seasonStart && checkOut <= seasonEnd
  const stay = valid ? { checkIn, checkOut } : example
  arrival.value = stay.checkIn
  departure.value = stay.checkOut
  updateDepartureLimit()
  render(stay)
}

arrival.addEventListener('change', updateDepartureLimit)
form.addEventListener('submit', event => {
  event.preventDefault()
  const stay = { checkIn: arrival.value, checkOut: departure.value }
  if (!validStay(stay.checkIn, stay.checkOut) || stay.checkIn < seasonStart || stay.checkOut > seasonEnd) return
  const url = new URL(location.href)
  url.search = new URLSearchParams(stay).toString()
  if (url.href !== location.href) history.pushState(null, '', url)
  render(stay)
})
document.querySelector('#close-dialog').addEventListener('click', () => dialog.close())
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return
  const bounds = dialog.getBoundingClientRect()
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close()
})
window.addEventListener('popstate', loadSearch)
loadSearch()
