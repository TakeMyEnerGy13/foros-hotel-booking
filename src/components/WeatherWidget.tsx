'use client'
import { useEffect, useState } from 'react'

export default function WeatherWidget({ locale }: { locale: string }) {
  const [air, setAir] = useState<number | null>(null)
  const [sea, setSea] = useState<number | null>(null)
  useEffect(() => {
    const controller = new AbortController()
    async function read(endpoint: string, field: string, set: (v: number) => void) {
      try {
        const res = await fetch(
          endpoint + '?latitude=44.3899&longitude=33.7866&current=' + field + '&timezone=Europe/Moscow',
          { signal: controller.signal }
        )
        if (!res.ok) return
        const value = (await res.json()).current?.[field]
        if (typeof value === 'number') set(Math.round(value))
      } catch {}
    }
    void read('https://api.open-meteo.com/v1/forecast', 'temperature_2m', setAir)
    void read('https://marine-api.open-meteo.com/v1/marine', 'sea_surface_temperature', setSea)
    return () => controller.abort()
  }, [])
  return (
    <div className="hero-weather">
      <div>
        <span>{locale === 'ru' ? 'Воздух' : 'Air'}</span>
        <strong>{air === null ? '—' : `${air} °C`}</strong>
      </div>
      <div>
        <span>{locale === 'ru' ? 'Море' : 'Sea'}</span>
        <strong>{sea === null ? '—' : `${sea} °C`}</strong>
      </div>
    </div>
  )
}
