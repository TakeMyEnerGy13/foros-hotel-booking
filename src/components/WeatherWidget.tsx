'use client'
import { useEffect, useState } from 'react'

export default function WeatherWidget({ locale }: { locale: string }) {
  const [air, setAir] = useState<number | null>(null)
  const [sea, setSea] = useState<number | null>(null)

  useEffect(() => {
    // Форос: 44.3899, 33.7866
    // Температура воздуха
    fetch('https://api.open-meteo.com/v1/forecast?latitude=44.3899&longitude=33.7866&current=temperature_2m&timezone=Europe/Moscow')
      .then(r => r.json())
      .then(data => setAir(Math.round(data.current.temperature_2m)))
      .catch(() => setAir(12))

    // Температура моря — отдельный запрос к marine API
    fetch('https://marine-api.open-meteo.com/v1/marine?latitude=44.3899&longitude=33.7866&current=sea_surface_temperature&timezone=Europe/Moscow')
      .then(r => r.json())
      .then(data => setSea(Math.round(data.current.sea_surface_temperature)))
      .catch(() => setSea(10))
  }, [])

  const glassStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '16px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.2)',
  }

  return (
    <div className="flex gap-3">
      <div style={glassStyle} className="px-4 py-3 text-white text-center min-w-[80px]">
        <div className="uppercase text-white/50 mb-1" style={{fontSize: '10px', fontFamily: "'Inter', sans-serif"}}>
          {locale === 'ru' ? 'Воздух' : 'Air'}
        </div>
        <div className="text-2xl font-light" style={{fontFamily: "'DM Serif Display', serif"}}>
          {air !== null ? `${air} °C` : '—'}
        </div>
      </div>
      <div style={glassStyle} className="px-4 py-3 text-white text-center min-w-[80px]">
        <div className="uppercase text-white/50 mb-1" style={{fontSize: '10px', fontFamily: "'Inter', sans-serif"}}>
          {locale === 'ru' ? 'Море' : 'Sea'}
        </div>
        <div className="text-2xl font-light" style={{fontFamily: "'DM Serif Display', serif"}}>
          {sea !== null ? `${sea} °C` : '—'}
        </div>
      </div>
    </div>
  )
}