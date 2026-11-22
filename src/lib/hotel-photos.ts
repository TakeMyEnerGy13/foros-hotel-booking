import { sitePath } from './site-path'

const localPhotos = new Set([
  'photo-1473116763249-2faaef81ccda',
  'photo-1500534314209-a25ddb2bd429',
  'photo-1505118380757-91f5f5632de0',
  'photo-1507525428034-b723cf961d3e',
  'photo-1540518614846-7eded433c457',
  'photo-1560185007-cde436f6a4d0',
  'photo-1560185893-a55cbc8c57e8',
  'photo-1566665797739-1674de7a421a',
  'photo-1578683010236-d716f9a3f461',
  'photo-1582719478250-c89cae4dc85b',
  'photo-1584622781564-1d987f7333c1',
  'photo-1590490360182-c33d57733427',
  'photo-1592229505726-ca121723b8ef',
  'photo-1595526114035-0d45ed16cfbf',
  'photo-1618773928121-c32242e63f39',
  'photo-1631049307264-da0ec9d70304',
  'photo-1631049552057-403cdb8f0658',
])

export function roomPhotos(urls: string[]) {
  const photos: string[] = []
  for (const url of urls) {
    const id = url.match(/^https:\/\/images\.unsplash\.com\/(photo-[\w-]+)/)?.[1]
    if (
      id &&
      [
        'photo-1552902865-b72c031ac5ea',
        'photo-1609766857585-ec9cbf4b11de',
        'photo-1601565415267-724db0ecf46a',
      ].includes(id)
    )
      continue
    photos.push(sitePath(id && localPhotos.has(id) ? '/photos/' + id + '.webp' : url))
  }
  return photos.length ? photos : [sitePath('/Main.png')]
}

export const coastPhotos = [
  { src: '/Main.png', ru: 'Панорама Фороса', en: 'Foros panorama' },
  { src: '/photos/photo-1473116763249-2faaef81ccda.webp', ru: 'Вечер у моря', en: 'Evening by the sea' },
  { src: '/photos/photo-1582719478250-c89cae4dc85b.webp', ru: 'Утро в номере', en: 'Morning indoors' },
  { src: '/photos/photo-1505118380757-91f5f5632de0.webp', ru: 'Линия прибоя', en: 'The waterline' },
  {
    src: '/photos/photo-1500534314209-a25ddb2bd429.webp',
    ru: 'Горные силуэты',
    en: 'Mountain silhouettes',
  },
  {
    src: '/photos/photo-1507525428034-b723cf961d3e.webp',
    ru: 'Море на закате',
    en: 'Sunset on the water',
  },
].map(photo => ({ ...photo, src: sitePath(photo.src) }))
