'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import { maskStayDate, readStayDate } from '@/lib/stay'

function displayDate(iso: string, ru: boolean) {
  if (!iso) return ''
  const [year, month, day] = iso.split('-')
  return [day, month, year.startsWith('20') ? year.slice(2) : year].join(ru ? '.' : '/')
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
  const [focused, setFocused] = useState(false)
  const iso = readStayDate(text)
  const format = ru ? 'дд.мм.гг' : 'dd/mm/yy'
  let error = ''
  if (text && !iso) error = ru ? 'Проверьте дату. Например, 30.07.26.' : 'Check the date. For example, 30/07/26.'
  else if (iso && iso < min) error = rangeMessage

  useLayoutEffect(() => {
    field.current?.setCustomValidity(error)
  }, [error])

  function editDate(event: React.ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget
    const action = (event.nativeEvent as InputEvent).inputType
    const raw = input.value
    const caret = input.selectionStart ?? raw.length
    let digitPosition = raw.slice(0, caret).replace(/\D/g, '').length
    let digits = raw.replace(/\D/g, '')
    const previous = text.replace(/\D/g, '')

    if (action === 'deleteContentBackward' && digits === previous && digitPosition > 0) {
      digitPosition--
      digits = digits.slice(0, digitPosition) + digits.slice(digitPosition + 1)
    } else if (action === 'deleteContentForward' && digits === previous) {
      digits = digits.slice(0, digitPosition) + digits.slice(digitPosition + 1)
    } else if (caret === raw.length && /^(?:\d{2}[./])?\d[./-]$/.test(raw)) {
      digits = digits.slice(0, -1) + '0' + digits.slice(-1)
      digitPosition = digits.length
    } else if (action?.startsWith('insert') && digitPosition === 3 && /[2-9]/.test(digits.charAt(2))) {
      const suffix = raw.slice(caret).replace(/^\d(?=[./])/, '')
      digits = digits.slice(0, 2) + '0' + digits[2] + suffix.replace(/\D/g, '')
      digitPosition = 4
    }

    if (action === 'insertText' && raw.startsWith(text) && digits.length === previous.length + 1) {
      const pair = Number(digits.slice(-2))
      if ((digits.length === 2 && (pair < 1 || pair > 31)) ||
          (digits.length === 4 && (pair < 1 || pair > 12))) {
        digits = previous
      }
    }

    const formatted = maskStayDate(digits, ru ? '.' : '/')
    const index = Math.min(digitPosition, digits.length, 8)
    const position = index + Number(index >= 2) + Number(index >= 4)
    input.value = formatted
    input.setSelectionRange(position, position)
    change(formatted)
  }

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
          placeholder={focused ? format : (ru ? 'Выберите дату' : 'Select date')}
          onFocus={() => setFocused(true)}
          required={required}
          value={text}
          onChange={editDate}
          onPaste={(event) => {
            const input = event.currentTarget
            const pasted = event.clipboardData.getData('text').trim()
            const start = input.selectionStart ?? 0
            const end = input.selectionEnd ?? start
            const replaced = text.slice(0, start) + pasted + text.slice(end)
            if (replaced.replace(/\D/g, '').length > 8) {
              event.preventDefault()
              return
            }
            if (start !== 0 || end !== text.length) return
            const date = readStayDate(pasted)
            if (date) {
              event.preventDefault()
              change(displayDate(date, ru))
            }
          }}
          onBlur={() => {
            setFocused(false)
            if (iso) change(displayDate(iso, ru))
          }}
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
