const phone = '+7 (978) 000-00-00'

export const bookingContact = {
  name: { ru: 'Ольга', en: 'Olga' },
  phone,
  href: 'tel:' + phone.replace(/[^+\d]/g, ''),
}
