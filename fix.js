// eslint-disable-next-line @typescript-eslint/no-require-imports -- This standalone utility runs as CommonJS.
const fs = require('fs');
const code = `'use client'
import { useState, useEffect } from 'react'

const photos = [
  { src: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200', alt: 'Пляж Форос' },
  { src: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1200', alt: 'Море' },
  { src: 'https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?w=1200', alt: 'Закат' },
  { src: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=1200', alt: 'Берег' },
  { src: 'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=1200', alt: 'Горы' },
  { src: 'https://images.unsplash.com/photo-1499678329028-101435549a4e?w=1200', alt: 'Прогулка' },
  { src: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1200', alt: 'Природа' },
]

const visibleCount = 3

export default function Gallery() {
  const [current, setCurrent] = useState(0)
  const [lightbox, setLightbox] = useState<number | null>(null)

  useEffect(() => {
    if (lightbox === null) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setLightbox(i => i !== null ? Math.min(photos.length - 1, i + 1) : null)
      if (e.key === 'ArrowLeft') setLightbox(i => i !== null ? Math.max(0, i - 1) : null)
      if (e.key === 'Escape') setLightbox(null)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [lightbox])

  const prev = () => setCurrent(c => Math.max(0, c - 1))
  const next = () => setCurrent(c => Math.min(photos.length - visibleCount, c + 1))

  const btnStyle = {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    color: 'white',
    fontSize: '20px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(10px)',
    transition: 'background 0.2s',
    flexShrink: 0,
  }

  return (
    <>
      <section style={{background: '#0f0f0f', padding: '80px 0'}}>
        <div style={{maxWidth: '1200px', margin: '0 auto', padding: '0 32px'}}>

          <div style={{textAlign: 'center', marginBottom: '48px'}}>
            <p style={{fontFamily: "'Inter', sans-serif", fontSize: '11px', color: 'rgba(245,158,11,0.8)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '12px'}}>
              Форос · Крым
            </p>
            <h2 style={{fontFamily: "'DM Serif Display', serif", fontSize: '42px', color: 'white', margin: 0}}>
              Галерея
            </h2>
          </div>

          <div style={{position: 'relative'}}>
            <div style={{overflow: 'hidden', borderRadius: '16px'}}>
              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: \`translateX(calc(-\${current} * (100% / \${visibleCount} + 4px)))\`,
                }}
              >
                {photos.map((photo, i) => (
                  <div
                    key={i}
                    onClick={() => setLightbox(i)}
                    style={{
                      flex: \`0 0 calc(\${100 / visibleCount}% - 8px)\`,
                      borderRadius: '12px',
                      overflow: 'hidden',
                      cursor: 'zoom-in',
                      transition: 'transform 0.3s ease',
                      position: 'relative',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'scale(1.02)'
                      const overlay = e.currentTarget.querySelector('.overlay') as HTMLElement
                      if (overlay) overlay.style.opacity = '1'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'scale(1)'
                      const overlay = e.currentTarget.querySelector('.overlay') as HTMLElement
                      if (overlay) overlay.style.opacity = '0'
                    }}
                  >
                    <img
                      src={photo.src}
                      alt={photo.alt}
                      style={{width: '100%', height: '280px', objectFit: 'cover', display: 'block'}}
                    />
                    <div
                      className="overlay"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(0,0,0,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0,
                        transition: 'opacity 0.3s',
                      }}
                    >
                      <div style={{width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                          <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {current > 0 && (
              <button
                onClick={prev}
                style={{...btnStyle, position: 'absolute', left: '-20px', top: '50%', transform: 'translateY(-50%)'}}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
              >‹</button>
            )}
            {current < photos.length - visibleCount && (
              <button
                onClick={next}
                style={{...btnStyle, position: 'absolute', right: '-20px', top: '50%', transform: 'translateY(-50%)'}}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
              >›</button>
            )}
          </div>

          <div style={{display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px'}}>
            {Array.from({length: photos.length - visibleCount + 1}).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                style={{
                  width: i === current ? '24px' : '8px',
                  height: '8px',
                  borderRadius: '4px',
                  background: i === current ? 'rgba(245,158,11,0.9)' : 'rgba(255,255,255,0.3)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  padding: 0,
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Лайтбокс */}
      {lightbox !== null && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0,0,0,0.95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => setLightbox(null)}
        >
          {/* Закрыть */}
          <button
            onClick={() => setLightbox(null)}
            style={{
              position: 'absolute',
              top: '24px',
              right: '24px',
              ...btnStyle,
              fontSize: '24px',
            }}
          >×</button>

          {/* Счётчик */}
          <div style={{position: 'absolute', top: '28px', left: '50%', transform: 'translateX(-50%)', fontFamily: "'Inter', sans-serif", fontSize: '13px', color: 'rgba(255,255,255,0.5)'}}>
            {lightbox + 1} / {photos.length}
          </div>

          {/* Стрелка влево */}
          {lightbox > 0 && (
            <button
              onClick={e => { e.stopPropagation(); setLightbox(i => i !== null ? i - 1 : null) }}
              style={{...btnStyle, position: 'absolute', left: '24px', top: '50%', transform: 'translateY(-50%)', width: '52px', height: '52px', fontSize: '24px'}}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
            >‹</button>
          )}

          {/* Фото */}
          <img
            src={photos[lightbox].src}
            alt={photos[lightbox].alt}
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '90vw',
              maxHeight: '85vh',
              objectFit: 'contain',
              borderRadius: '8px',
            }}
          />

          {/* Стрелка вправо */}
          {lightbox < photos.length - 1 && (
            <button
              onClick={e => { e.stopPropagation(); setLightbox(i => i !== null ? i + 1 : null) }}
              style={{...btnStyle, position: 'absolute', right: '24px', top: '50%', transform: 'translateY(-50%)', width: '52px', height: '52px', fontSize: '24px'}}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
            >›</button>
          )}

          {/* Миниатюры снизу */}
          <div style={{position: 'absolute', bottom: '24px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px'}}>
            {photos.map((photo, i) => (
              <img
                key={i}
                src={photo.src}
                alt={photo.alt}
                onClick={e => { e.stopPropagation(); setLightbox(i) }}
                style={{
                  width: '60px',
                  height: '40px',
                  objectFit: 'cover',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  opacity: i === lightbox ? 1 : 0.4,
                  border: i === lightbox ? '2px solid rgba(245,158,11,0.9)' : '2px solid transparent',
                  transition: 'all 0.2s',
                }}
              />
            ))}
          </div>
        </div>
      )}
    </>
  )
}`;
fs.writeFileSync('src/components/Gallery.tsx', code);
console.log('Done!');