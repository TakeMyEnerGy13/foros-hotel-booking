'use client'

import { useId, useRef, useState } from 'react'
import { readStayDate } from '@/lib/stay'
import StayDateDialog, { displayDate } from './StayDateDialog'

function DateField({ name, label, ru, value, change, min, today, required, rangeMessage }: {
  name: 'checkIn' | 'checkOut'
  label: string
  ru: boolean
  value: string
  change: (value: string) => void
  min: string
  today: string
  required: boolean
  rangeMessage: string
}) {
  const id = useId()
  const trigger = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)

  return (
    <div className="stay-date" data-field={name}>
      <label id={id + '-label'} htmlFor={id + '-native'}>{label}</label>
      <button type="button" ref={trigger} className="stay-date-trigger" aria-haspopup="dialog"
        aria-expanded={open} aria-controls={open ? id : undefined} aria-labelledby={id + '-label ' + id + '-value'}
        onClick={() => setOpen(true)}>
        <span id={id + '-value'} className="stay-date-value" data-empty={!value}>
          {value ? displayDate(value, ru) : (ru ? 'Выберите дату' : 'Select date')}
        </span>
        <span className="stay-date-picker" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <rect x="3.5" y="5" width="17" height="16" rx="2" />
            <path d="M7.5 3v4m9-4v4m-13 3.5h17" />
          </svg>
        </span>
      </button>
      <input id={id + '-native'} className="stay-date-native" type="date" name={name} value={value}
        min={min} required={required} onChange={(event) => change(event.target.value)}
        onInvalid={(event) => {
          event.preventDefault()
          if (event.currentTarget.form?.querySelector(':invalid') === event.currentTarget) setOpen(true)
        }} />
      {open && <StayDateDialog id={id} label={label} ru={ru} value={value} min={min} today={today}
        rangeMessage={rangeMessage} onSelect={change} onClose={() => {
          setOpen(false)
          trigger.current?.focus({ preventScroll: true })
        }} />}
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
  const [arrival, setArrival] = useState(readStayDate(checkIn))
  const [departure, setDeparture] = useState(readStayDate(checkOut))
  const next = new Date((arrival >= today ? arrival : today) + 'T00:00:00Z')
  next.setUTCDate(next.getUTCDate() + 1)
  const earliestEnd = next.toISOString().slice(0, 10)

  function changeArrival(value: string) {
    setArrival(value)
    if (value && departure && departure <= value) setDeparture('')
  }

  return (
    <>
      <DateField name="checkIn" label={ru ? 'Дата заезда' : 'Check-in'} ru={ru} value={arrival}
        change={changeArrival} min={today} today={today} required={Boolean(departure)}
        rangeMessage={ru ? 'Выберите сегодняшнюю или будущую дату.' : 'Choose today or a future date.'} />
      <DateField name="checkOut" label={ru ? 'Дата выезда' : 'Check-out'} ru={ru} value={departure}
        change={setDeparture} min={earliestEnd} today={today} required={Boolean(arrival)}
        rangeMessage={ru ? 'Выберите дату выезда после заезда.' : 'Choose a check-out date after check-in.'} />
    </>
  )
}
