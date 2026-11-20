'use client'
import { useRouter } from 'next/navigation'

function saveLanguage(lang: string) {
  document.cookie = 'locale=' + lang + ';path=/;max-age=31536000;SameSite=Lax'
}

export default function LanguageSwitcher({ currentLocale }: { currentLocale: string }) {
  const router = useRouter()
  function select(lang: string) {
    saveLanguage(lang)
    router.refresh()
  }
  return (
    <div className="languages" aria-label="RU / EN">
      {['ru', 'en'].map((lang) => (
        <button
          key={lang}
          type="button"
          lang={lang}
          aria-pressed={currentLocale === lang}
          onClick={() => select(lang)}
        >
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
