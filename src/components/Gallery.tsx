'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { coastPhotos } from '@/lib/hotel-photos'

type Photo = { src: string; caption: string }

export function PhotoStage({ photos, title, locale }: { photos: Photo[]; title: string; locale: string }) {
  const ru = locale !== 'en'
  const [current, setCurrent] = useState(0)
  const stage = useRef<HTMLElement>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const active = photos[current] ?? photos[0]
  const move = useCallback((step: number) => {
    setCurrent((index) => (index + step + photos.length) % photos.length)
  }, [photos.length])

  useEffect(() => {
    if (photos.length < 2) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
      const target = event.target
      const frame = stage.current
      if (!frame || !(target instanceof Node)) return
      if (!dialog.current?.contains(target) && !frame.contains(target)) {
        if (target !== document.body && target !== document.documentElement) return
        const bounds = frame.getBoundingClientRect()
        if (bounds.bottom <= 0 || bounds.top >= window.innerHeight) return
      }
      event.preventDefault()
      move(event.key === 'ArrowRight' ? 1 : -1)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [move, photos.length])

  return (
    <>
      <section className="photo-stage" ref={stage} aria-label={title}>
        <img className="stage-photo" src={active.src} alt={active.caption} fetchPriority="high" />
        <button
          type="button"
          className="expand-photo"
          aria-label={ru ? 'Увеличить фотографию' : 'Enlarge photograph'}
          onClick={() => dialog.current?.showModal()}
        >
          ⤢
        </button>
        <div className="stage-title">
          <h1>{title}</h1>
        </div>
        {photos.length > 1 && (
          <>
            <button
              type="button"
              className="stage-arrow previous"
              aria-label={ru ? 'Предыдущая фотография' : 'Previous photo'}
              onClick={() => move(-1)}
            >
              ←
            </button>
            <button
              type="button"
              className="stage-arrow next"
              aria-label={ru ? 'Следующая фотография' : 'Next photo'}
              onClick={() => move(1)}
            >
              →
            </button>
            <div className="stage-thumbs" role="group" aria-label={ru ? 'Фотографии' : 'Photographs'}>
              {photos.map((photo, index) => (
                <button
                  key={photo.src}
                  type="button"
                  aria-label={photo.caption}
                  aria-pressed={index === current}
                  onClick={() => setCurrent(index)}
                >
                  <img src={photo.src} alt="" />
                </button>
              ))}
            </div>
            <span className="sr-only" aria-live="polite">{active.caption}</span>
          </>
        )}
      </section>
      <dialog
        className="lightbox"
        aria-label={title}
        ref={dialog}
        onClick={(event) => {
          if (event.target === dialog.current) dialog.current.close()
        }}
      >
        <button autoFocus className="pill" onClick={() => dialog.current?.close()}>
          {ru ? 'Закрыть' : 'Close'} ×
        </button>
        <img src={active.src} alt={active.caption} />
        {photos.length > 1 && (
          <div className="lightbox-nav">
            <button aria-label={ru ? 'Назад' : 'Previous'} onClick={() => move(-1)}>
              ←
            </button>
            <span aria-live="polite">{active.caption}</span>
            <button aria-label={ru ? 'Вперёд' : 'Next'} onClick={() => move(1)}>
              →
            </button>
          </div>
        )}
      </dialog>
    </>
  )
}

export default function Gallery({ locale = 'ru' }: { locale?: string }) {
  const ru = locale !== 'en'
  const dialog = useRef<HTMLDialogElement>(null)
  const [current, setCurrent] = useState(0)
  const change = (n: number) => setCurrent((i) => (i + n + coastPhotos.length) % coastPhotos.length)
  const caption = (i: number) => (ru ? coastPhotos[i].ru : coastPhotos[i].en)
  const captions = [
    null,
    <>{ru ? 'От скал' : 'From the cliffs'} <span>{ru ? 'к морю' : 'to the sea'}</span></>,
    ru ? 'На самом юге Крыма' : 'At the southern tip of Crimea',
    ru ? 'У подножия гор' : 'At the foot of the mountains',
  ]
  return (
    <section id="gallery" className="coast-gallery" aria-label={ru ? 'Фотогалерея Фороса' : 'Photographs of Foros'}>
      <div className="coast-gallery-grid">
        {coastPhotos.slice(0, captions.length).map((photo, i) => (
          <figure key={photo.src}>
            {i === 1 && <figcaption className="coast-heading">{captions[i]}</figcaption>}
            <button
              type="button"
              onClick={() => {
                setCurrent(i)
                dialog.current?.showModal()
              }}
            >
              <img loading="lazy" src={photo.src} alt={caption(i)} />
            </button>
            {i > 1 && <figcaption>{captions[i]}</figcaption>}
          </figure>
        ))}
      </div>
      <dialog
        className="lightbox"
        ref={dialog}
        aria-label={ru ? 'Фотогалерея Фороса' : 'Photographs of Foros'}
        onClick={(e) => {
          if (e.target === dialog.current) dialog.current.close()
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') change(1)
          if (e.key === 'ArrowLeft') change(-1)
        }}
      >
        <button autoFocus className="pill" onClick={() => dialog.current?.close()}>
          {ru ? 'Закрыть' : 'Close'} ×
        </button>
        <img src={coastPhotos[current].src} alt={caption(current)} />
        <div className="lightbox-nav">
          <button aria-label={ru ? 'Назад' : 'Previous'} onClick={() => change(-1)}>
            ←
          </button>
          <span className="sr-only" aria-live="polite">{caption(current)}</span>
          <button aria-label={ru ? 'Вперёд' : 'Next'} onClick={() => change(1)}>
            →
          </button>
        </div>
      </dialog>
    </section>
  )
}
