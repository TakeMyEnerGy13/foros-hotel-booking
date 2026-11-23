const gallery = document.querySelector('#gallery-dialog')
const booking = document.querySelector('#booking-dialog')
const contacts = document.querySelector('#contacts-dialog')
const roomChoice = document.querySelector('#room-choice')
const arrival = document.querySelector('#arrival')
const departure = document.querySelector('#departure')
const staySummary = document.querySelector('#stay-summary')
const photos = [...document.querySelectorAll('[data-photo]')]
const displayedPhoto = document.querySelector('#large-photo')
const caption = gallery.querySelector('figcaption')
let currentPhoto = 0

function displayPhoto(index) {
  currentPhoto = (index + photos.length) % photos.length
  const photo = photos[currentPhoto].querySelector('img')
  displayedPhoto.src = photo.src
  displayedPhoto.alt = photo.alt
  caption.textContent = `${currentPhoto + 1} / ${photos.length} · ${photo.alt}`
}

function openPhoto(index) {
  displayPhoto(index)
  gallery.showModal()
}

photos.forEach((button, index) => {
  button.addEventListener('click', () => openPhoto(index))
})
document.querySelector('[data-gallery]').addEventListener('click', () => {
  openPhoto(photos.indexOf(document.querySelector('.collage-flower')))
})
gallery.querySelector('.previous').addEventListener('click', () => displayPhoto(currentPhoto - 1))
gallery.querySelector('.next').addEventListener('click', () => displayPhoto(currentPhoto + 1))
gallery.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault()
    displayPhoto(currentPhoto + (event.key === 'ArrowLeft' ? -1 : 1))
  }
})

const hotelDay = new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'Europe/Moscow', year: 'numeric', month: '2-digit', day: '2-digit'
})
const readableDay = new Intl.DateTimeFormat('ru-RU', {
  timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric'
})

function nextDay(iso) {
  const date = new Date(iso + 'T00:00:00Z')
  date.setUTCDate(date.getUTCDate() + 1)
  return date.toISOString().slice(0, 10)
}

function updateDateBounds() {
  arrival.min = hotelDay.format(new Date())
  departure.min = nextDay(arrival.value >= arrival.min ? arrival.value : arrival.min)
  if (departure.value && departure.value < departure.min) departure.value = ''
}

document.querySelectorAll('[data-book]').forEach(button => {
  button.addEventListener('click', () => {
    if (button.dataset.book) roomChoice.value = button.dataset.book
    updateDateBounds()
    booking.showModal()
  })
})
arrival.addEventListener('input', updateDateBounds)

document.querySelector('[data-contact]').addEventListener('click', () => {
  staySummary.hidden = true
  contacts.showModal()
})
document.querySelector('#stay').addEventListener('submit', event => {
  event.preventDefault()
  updateDateBounds()
  if (!event.currentTarget.reportValidity()) return
  const from = readableDay.format(new Date(arrival.value + 'T00:00:00Z'))
  const until = readableDay.format(new Date(departure.value + 'T00:00:00Z'))
  staySummary.textContent = `«${roomChoice.value}» · с ${from} по ${until}. Даты выбраны для просмотра.`
  staySummary.hidden = false
  booking.close()
  contacts.showModal()
})

document.querySelectorAll('dialog').forEach(dialog => {
  dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close())
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return
    const { left, right, top, bottom } = dialog.getBoundingClientRect()
    if (event.clientX < left || event.clientX > right || event.clientY < top || event.clientY > bottom) dialog.close()
  })
})
