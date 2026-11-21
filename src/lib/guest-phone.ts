export function compactPhoneDraft(value: string): string | null {
  if (value.length > 32 || !/^\+?[\d()\s-]*$/.test(value)) return null
  const compact = value.replace(/[()\s-]/g, '')
  const digits = compact.replace(/^\+/, '')
  const limit = compact.startsWith('+') && !compact.startsWith('+7') ? 15 : /^[78]/.test(digits) ? 11 : 10
  return digits.length <= limit ? compact : null
}

export function normalizeGuestPhone(value: string): string {
  const phone = compactPhoneDraft(value.trim())
  if (!phone) return ''
  if (phone.startsWith('+7')) return /^\+7\d{10}$/.test(phone) ? phone : ''
  if (phone.startsWith('+')) return /^\+[1-9]\d{7,14}$/.test(phone) ? phone : ''
  if (/^[78]/.test(phone)) return phone.length === 11 ? '+7' + phone.slice(1) : ''
  return /^[1-9]\d{9}$/.test(phone) ? '+7' + phone : ''
}

export function displayGuestPhone(normalized: string) {
  return normalized.replace(/^\+7(\d{3})(\d{3})(\d{2})(\d{2})$/, '+7 ($1) $2-$3-$4')
}
