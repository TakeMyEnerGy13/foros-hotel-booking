'use client'
import { useState } from 'react'

export default function ImageSlider({ images, name }: { images: string[], name: string }) {
  const [current, setCurrent] = useState(0)
  const [lightbox, setLightbox] = useState(false)

  const prev = () => setCurrent(i => i === 0 ? images.length - 1 : i - 1)
  const next = () => setCurrent(i => i === images.length - 1 ? 0 : i + 1)

  return (
    <>
      {/* Слайдер */}
      <div className="relative bg-stone-900 rounded-none overflow-hidden" style={{height: '480px'}}>
        {/* Основное фото */}
        <img
          src={images[current]}
          alt={`${name} — фото ${current + 1}`}
          className="w-full h-full object-cover cursor-zoom-in transition-opacity duration-300"
          onClick={() => setLightbox(true)}
        />

        {/* Затемнение по краям */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />

        {/* Кнопки навигации */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-all duration-200 backdrop-blur-sm"
            >
              ‹
            </button>
            <button
              onClick={next}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-all duration-200 backdrop-blur-sm"
            >
              ›
            </button>
          </>
        )}

        {/* Счётчик */}
        <div className="absolute bottom-4 right-4 bg-black/50 text-white font-sans text-xs tracking-widest px-3 py-1.5 backdrop-blur-sm">
          {current + 1} / {images.length}
        </div>

        {/* Иконка увеличения */}
        <div className="absolute bottom-4 left-4 bg-black/50 text-white font-sans text-xs tracking-widest px-3 py-1.5 backdrop-blur-sm cursor-pointer hover:bg-black/70 transition-colors" onClick={() => setLightbox(true)}>
          🔍 {' '}увеличить
        </div>
      </div>

      {/* Миниатюры */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-2">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`flex-1 h-16 overflow-hidden transition-all duration-200 ${
                i === current
                  ? 'ring-2 ring-amber-400 opacity-100'
                  : 'opacity-50 hover:opacity-80'
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Лайтбокс */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
          onClick={() => setLightbox(false)}
        >
          <button
            className="absolute top-6 right-6 text-white/60 hover:text-white text-4xl font-sans transition-colors"
            onClick={() => setLightbox(false)}
          >
            ×
          </button>
          <button
            className="absolute left-6 top-1/2 -translate-y-1/2 text-white/60 hover:text-white text-5xl font-sans transition-colors"
            onClick={e => { e.stopPropagation(); prev() }}
          >
            ‹
          </button>
          <img
            src={images[current]}
            alt={name}
            className="max-h-[85vh] max-w-[90vw] object-contain"
            onClick={e => e.stopPropagation()}
          />
          <button
            className="absolute right-6 top-1/2 -translate-y-1/2 text-white/60 hover:text-white text-5xl font-sans transition-colors"
            onClick={e => { e.stopPropagation(); next() }}
          >
            ›
          </button>
          <div className="absolute bottom-6 text-white/50 font-sans text-sm tracking-widest">
            {current + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  )
}