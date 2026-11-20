'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) window.location.replace('/admin')
      else setError((await res.json()).error || 'Ошибка входа')
    } catch {
      setError('Не удалось связаться с сервером')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="operations login-view">
      <Link href="/" className="wordmark">
        берег радости
      </Link>
      <form
        className="ops-form"
        onSubmit={(e) => {
          e.preventDefault()
          void handleLogin()
        }}
      >
        <span className="label">Панель администратора</span>
        <h1>Вход</h1>
        <label>
          Пароль
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Введите пароль"
          />
        </label>
        {error && <p role="alert">{error}</p>}
        <button className="solid" type="submit" disabled={loading}>
          {loading ? 'Входим…' : 'Войти'}
        </button>
      </form>
    </main>
  )
}
