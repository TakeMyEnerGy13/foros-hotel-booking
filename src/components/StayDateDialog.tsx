import { useLayoutEffect, useRef, useState } from 'react'
import { parseISO } from 'date-fns'
import { DayPicker } from 'react-day-picker'
import { enGB, ru as russian } from 'react-day-picker/locale'
import { calendarDay, maskStayDate, readStayDate } from '@/lib/stay'

export function displayDate(iso: string, ru: boolean) {
  if (!iso) return ''
  const [year, month, day] = iso.split('-')
  return [day, month, year.startsWith('20') ? year.slice(2) : year].join(ru ? '.' : '/')
}

export default function StayDateDialog({ id, label, ru, value, min, today, rangeMessage, onSelect, onClose }: {
  id: string
  label: string
  ru: boolean
  value: string
  min: string
  today: string
  rangeMessage: string
  onSelect: (value: string) => void
  onClose: () => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const field = useRef<HTMLInputElement>(null)
  const [manual, setManual] = useState(false)
  const [draft, setDraft] = useState(displayDate(value, ru))
  const [attempted, setAttempted] = useState(false)
  const parsed = readStayDate(draft)
  const error = !parsed
    ? (ru ? 'Введите существующую дату в формате ДД.ММ.ГГ.' : 'Enter a valid date in DD/MM/YY format.')
    : parsed < min ? rangeMessage : ''

  useLayoutEffect(() => {
    dialog.current?.showModal()
  }, [])

  useLayoutEffect(() => {
    if (manual) {
      field.current?.focus()
      field.current?.select()
    }
  }, [manual])

  function choose(iso: string) {
    onSelect(iso)
    dialog.current?.close()
  }

  function applyDraft() {
    if (error) {
      setAttempted(true)
      field.current?.focus()
    } else {
      choose(parsed)
    }
  }

  function editDate(event: React.ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget
    const action = (event.nativeEvent as InputEvent).inputType
    const raw = input.value
    const caret = input.selectionStart ?? raw.length
    let digitPosition = raw.slice(0, caret).replace(/\D/g, '').length
    let digits = raw.replace(/\D/g, '')
    const previous = draft.replace(/\D/g, '')

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

    if (action === 'insertText' && raw.startsWith(draft) && digits.length === previous.length + 1) {
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
    setDraft(formatted)
  }

  function pasteDate(event: React.ClipboardEvent<HTMLInputElement>) {
    const input = event.currentTarget
    const pasted = event.clipboardData.getData('text').trim()
    const start = input.selectionStart ?? 0
    const end = input.selectionEnd ?? start
    const replaced = draft.slice(0, start) + pasted + draft.slice(end)
    if (replaced.replace(/\D/g, '').length > 8) {
      event.preventDefault()
      return
    }
    if (start !== 0 || end !== draft.length) return
    const date = readStayDate(pasted)
    if (date) {
      event.preventDefault()
      setDraft(displayDate(date, ru))
    }
  }

  return (
    <dialog ref={dialog} id={id} className="stay-dialog" aria-labelledby={id + '-title'} onClose={onClose}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return
        const { left, right, top, bottom } = event.currentTarget.getBoundingClientRect()
        if (event.clientX < left || event.clientX > right || event.clientY < top || event.clientY > bottom) {
          event.currentTarget.close()
        }
      }}>
      <header className="stay-dialog-head">
        <h2 id={id + '-title'}>{label}</h2>
        <button type="button" className="stay-dialog-close" aria-label={ru ? 'Закрыть' : 'Close'} onClick={() => dialog.current?.close()}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m4 4 8 8m0-8-8 8" /></svg>
        </button>
      </header>
      {manual ? (
        <div className="stay-manual">
          <label htmlFor={id + '-input'}>{ru ? 'День, месяц, год' : 'Day, month, year'}</label>
          <input ref={field} id={id + '-input'} type="text" inputMode="numeric" autoComplete="off"
            placeholder={ru ? 'ДД.ММ.ГГ' : 'DD/MM/YY'} value={draft} onChange={editDate} onPaste={pasteDate}
            aria-invalid={attempted && Boolean(error)} aria-describedby={attempted && error ? id + '-error' : undefined}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                applyDraft()
              }
            }} />
          {attempted && error && <p role="alert" id={id + '-error'}>{error}</p>}
          <button type="button" className="stay-apply" onClick={applyDraft}>{ru ? 'Применить' : 'Apply date'}</button>
        </div>
      ) : (
        <DayPicker locale={ru ? russian : enGB} mode="single" required weekStartsOn={1} autoFocus
          today={parseISO(today)} defaultMonth={parseISO(value >= min ? value : min)} startMonth={parseISO(min)}
          disabled={{ before: parseISO(min) }} selected={value ? parseISO(value) : undefined}
          onSelect={(day) => choose(calendarDay(day))} />
      )}
      <div className="stay-dialog-actions">
        <button type="button" onClick={() => { setManual(!manual); setAttempted(false) }}>
          {manual ? (ru ? 'К календарю' : 'Back to calendar') : (ru ? 'Ввести вручную' : 'Enter manually')}
        </button>
        {value && <button type="button" onClick={() => choose('')}>{ru ? 'Сбросить' : 'Clear'}</button>}
      </div>
    </dialog>
  )
}
