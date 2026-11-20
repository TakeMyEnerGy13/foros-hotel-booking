'use client'
export default function SearchButton({ locale }: { locale: string }) {
  return (
    <button
      type="submit"
      className="group relative overflow-hidden transition-all duration-300"
      style={{
        fontFamily: "'Inter', sans-serif",
        fontWeight: 600,
        fontSize: '12px',
        letterSpacing: '0.05em',
        background: 'rgba(196, 140, 50, 0.9)',
        color: 'white',
        padding: '0 40px',
        minHeight: 'var(--search-button-height, 64px)',
        minWidth: '130px',
        border: 'none',
        cursor: 'pointer',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(220, 165, 60, 1)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'rgba(196, 140, 50, 0.9)')}
    >
      <span className="relative z-10 uppercase">
        {locale === 'ru' ? 'Найти' : 'Search'}
      </span>
    </button>
  )
}
