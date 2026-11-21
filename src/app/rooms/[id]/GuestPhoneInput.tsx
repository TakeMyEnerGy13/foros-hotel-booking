import { useId, useState } from 'react'
import { compactPhoneDraft, displayGuestPhone, normalizeGuestPhone } from '@/lib/guest-phone'

export default function GuestPhoneInput({ value, onChange, ru }: {
  value: string
  onChange: (value: string) => void
  ru: boolean
}) {
  const hintId = useId()
  const [error, setError] = useState('')
  const hint = ru ? 'Введите 10 цифр после +7 или международный номер с кодом страны.'
    : 'Enter 10 digits after +7, or an international number with its country code.'
  return (
    <label>
      <span className="sr-only">{ru ? 'Телефон' : 'Phone'}</span>
      <input type="tel" inputMode="tel" autoComplete="tel" required value={value}
        placeholder={ru ? 'Телефон · +7 (___) ___-__-__' : 'Phone · +country code'}
        aria-invalid={Boolean(error)} aria-describedby={error ? hintId : undefined}
        onChange={event => {
          const input = event.currentTarget
          if (compactPhoneDraft(input.value) === null) {
            const edit = event.nativeEvent as InputEvent
            if (edit.inputType === 'insertText' && edit.data?.length === 1) return
            input.setCustomValidity(hint)
            setError(hint)
            return
          }
          const normalized = normalizeGuestPhone(input.value)
          const completed = normalized.startsWith('+7') && input.selectionStart === input.value.length && input.value.length > value.length
          onChange(completed ? displayGuestPhone(normalized) : input.value)
          input.setCustomValidity(input.value && !normalized ? hint : '')
          setError('')
        }}
        onBlur={event => {
          if (event.currentTarget.validity.valid) onChange(displayGuestPhone(normalizeGuestPhone(value)))
          else if (value) setError(hint)
        }}
        onInvalid={() => setError(hint)}
      />
      {error && <span id={hintId} className="guest-phone-error">{error}</span>}
    </label>
  )
}
