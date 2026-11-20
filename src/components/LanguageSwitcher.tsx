'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LanguageSwitcher({ currentLocale }: { currentLocale: string }) {
  const router = useRouter()
  const [locale, setLocale] = useState(currentLocale)

  const switchLanguage = async (newLocale: string) => {
    document.cookie = `locale=${newLocale};path=/;max-age=31536000`
    setLocale(newLocale)
    router.refresh()
  }

  return (
    <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => switchLanguage('ru')}
        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
          locale === 'ru'
            ? 'bg-white text-gray-800 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        RU
      </button>
      <button
        onClick={() => switchLanguage('en')}
        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
          locale === 'en'
            ? 'bg-white text-gray-800 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        EN
      </button>
    </div>
  )
}