'use client'
import { useRef, useState } from 'react'
import { coastPhotos } from '@/lib/hotel-photos'

type Photo = { src: string; caption: string }

export function PhotoStage({
  photos,
  title,
  label,
  locale,
  detail = false,
}: {
  photos: Photo[]
  title: string
  label: string
  locale: string
  detail?: boolean
}) {
  const ru = locale !== 'en'
  const [current, setCurrent] = useState(0)
  const dialog = useRef<HTMLDialogElement>(null)
  const active = photos[current] ?? photos[0]
  const move = (n: number) => setCurrent((i) => (i + n + photos.length) % photos.length)
  return (
    <>
      <section className={'photo-stage' + (detail ? ' detail-stage' : '')} aria-label={title}>
        <img
          className="stage-photo"
          src={active.src}
          alt={active.caption}
          fetchPriority="high"
          key={active.src}
        />
        <button
          type="button"
          className="expand-photo"
          aria-label={ru ? 'Увеличить фотографию' : 'Enlarge photograph'}
          onClick={() => dialog.current?.showModal()}
        >
          ⤢
        </button>
        <div className="stage-title">
          <p className="label">
            <span className="label-line" />
            {label}
          </p>
          <h1>
            {detail
              ? title
              : title.split(' ').length === 2
                ? title.split(' ').map((word) => <span key={word}>{word}</span>)
                : title}
          </h1>
        </div>
        <div className="stage-thumbs" aria-label={ru ? 'Фотографии' : 'Photographs'}>
          {photos.map((p, i) => (
            <button
              key={p.src}
              type="button"
              aria-label={p.caption}
              aria-pressed={i === current}
              onClick={() => setCurrent(i)}
            >
              <img src={p.src} alt="" />
            </button>
          ))}
        </div>
      </section>
      <div className="photo-credit label">
        <span aria-live="polite">
          {String(current + 1).padStart(2, '0')} / {String(photos.length).padStart(2, '0')}{' '}
          <span className="caption-dot">·</span> {active.caption}
        </span>
        <span>{ru ? 'Южный берег Крыма' : 'Southern coast of Crimea'}</span>
      </div>
      <dialog
        className="lightbox"
        ref={dialog}
        onClick={(e) => {
          if (e.target === dialog.current) dialog.current.close()
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') move(1)
          if (e.key === 'ArrowLeft') move(-1)
        }}
      >
        <button autoFocus className="pill" onClick={() => dialog.current?.close()}>
          {ru ? 'Закрыть' : 'Close'} ×
        </button>
        <img src={active.src} alt={active.caption} />
        <div className="lightbox-nav">
          <button aria-label={ru ? 'Назад' : 'Previous'} onClick={() => move(-1)}>
            ←
          </button>
          <span>{active.caption}</span>
          <button aria-label={ru ? 'Вперёд' : 'Next'} onClick={() => move(1)}>
            →
          </button>
        </div>
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
  return (
    <section id="gallery" className="editorial gallery-section">
      <div className="section-heading">
        <h2>{ru ? 'Фотогалерея' : 'Photographs'}</h2>
      </div>
      <div className="gallery-strip">
        {coastPhotos.map((p, i) => (
          <button
            key={p.src}
            onClick={() => {
              setCurrent(i)
              dialog.current?.showModal()
            }}
          >
            <img loading="lazy" src={p.src} alt={caption(i)} />
            <span className="label">{caption(i)} ↗</span>
          </button>
        ))}
      </div>
      <dialog
        className="lightbox"
        ref={dialog}
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
          <span>{caption(current)}</span>
          <button aria-label={ru ? 'Вперёд' : 'Next'} onClick={() => change(1)}>
            →
          </button>
        </div>
      </dialog>
    </section>
  )
}
