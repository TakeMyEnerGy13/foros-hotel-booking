'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import { readStayDate } from '@/lib/stay'

function displayDate(iso: string, ru: boolean) {
  return iso.split('-').reverse().join(ru ? '.' : '/')
}

function DateField({ name, label, ru, text, change, min, required, rangeMessage }: {
  name: string
  label: string
  ru: boolean
  text: string
  change: (value: string) => void
  min: string
  required: boolean
  rangeMessage: string
}) {
  const field = useRef<HTMLInputElement>(null)
  const iso = readStayDate(text)
  const format = ru ? 'ДД.ММ.ГГГГ' : 'DD/MM/YYYY'
  let error = ''
  if (text && !iso) error = ru ? 'Введите дату в формате ДД.ММ.ГГГГ.' : 'Enter a date in DD/MM/YYYY format.'
  else if (iso && iso < min) error = rangeMessage

  useLayoutEffect(() => {
    field.current?.setCustomValidity(error)
  }, [error])

  return (
    <div className="stay-date">
      <label htmlFor={name}>{label}</label>
      <div className="stay-date-entry">
        <input
          ref={field}
          id={name}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder={format}
          required={required}
          value={text}
          onChange={(event) => {
            const value = event.target.value
            const complete = /^\d{8}$/.test(value) && readStayDate(value)
            change(complete ? displayDate(complete, ru) : value)
          }}
          onBlur={() => { if (iso) change(displayDate(iso, ru)) }}
        />
        <div className="stay-date-picker">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
            <rect x="3.5" y="5" width="17" height="16" rx="2" />
            <path d="M7.5 3v4m9-4v4m-13 3.5h17" />
          </svg>
          <input
            type="date"
            name={name}
            min={min}
            value={iso}
            aria-label={ru ? label + ' — открыть календарь' : label + ' — open calendar'}
            onChange={(event) => change(displayDate(event.target.value, ru))}
          />
        </div>
      </div>
    </div>
  )
}

export default function StayDateFields({ locale, today, checkIn = '', checkOut = '' }: {
  locale: string
  today: string
  checkIn?: string
  checkOut?: string
}) {
  const ru = locale !== 'en'
  const [arrival, setArrival] = useState(displayDate(readStayDate(checkIn), ru))
  const [departure, setDeparture] = useState(displayDate(readStayDate(checkOut), ru))
  const first = readStayDate(arrival)
  let earliestEnd = today
  if (first >= today) {
    const next = new Date(first + 'T00:00:00Z')
    next.setUTCDate(next.getUTCDate() + 1)
    earliestEnd = next.toISOString().split('T')[0]
  }
  return (
    <>
      <DateField name="checkIn" label={ru ? 'Дата заезда' : 'Check-in'} ru={ru} text={arrival}
        change={setArrival} min={today} required={Boolean(departure)}
        rangeMessage={ru ? 'Выберите сегодняшнюю или будущую дату.' : 'Choose today or a future date.'} />
      <DateField name="checkOut" label={ru ? 'Дата выезда' : 'Check-out'} ru={ru} text={departure}
        change={setDeparture} min={earliestEnd} required={Boolean(arrival)}
        rangeMessage={ru ? 'Выберите дату выезда после заезда.' : 'Choose a check-out date after check-in.'} />
    </>
  )
}
