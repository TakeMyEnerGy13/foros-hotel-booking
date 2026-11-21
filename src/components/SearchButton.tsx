import styles from './HomeHero.module.css'

export default function SearchButton({ locale }: { locale: string }) {
  return (
    <button type="submit" className={styles.submit}>
      {locale === 'ru' ? 'Найти' : 'Search'} <span aria-hidden="true">→</span>
    </button>
  )
}
