'use client'
import { showcase, siteBase } from '@/lib/site-path'
import { useRouter } from 'next/navigation'

function saveLanguage(lang: string) {
  document.cookie = 'locale=' + lang + ';path=' + (siteBase || '/') + ';max-age=31536000;SameSite=Lax'
}

export default function LanguageSwitcher({ currentLocale }: { currentLocale: string }) {
  const router = useRouter()
  function select(lang: string) {
    saveLanguage(lang)
    if (showcase) window.location.reload()
    else router.refresh()
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
