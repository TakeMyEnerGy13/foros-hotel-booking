'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async () => {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    })

    if (res.ok) {
      router.push('/admin')
      router.refresh()
    } else {
      setError('Неверный пароль')
    }
  }

  return (
    <main className="min-h-screen bg-stone-900 flex items-center justify-center px-4">
      <div className="bg-stone-800 rounded-2xl p-10 w-full max-w-md">
        <h1 className="text-3xl text-white mb-2" style={{fontFamily: "'DM Serif Display', serif"}}>
          Вход
        </h1>
        <p className="text-stone-400 text-sm mb-8" style={{fontFamily: "'Inter', sans-serif"}}>
          Панель администратора — Берег Радости
        </p>

        <div className="mb-4">
          <label className="block text-stone-400 text-xs uppercase mb-2" style={{fontFamily: "'Inter', sans-serif"}}>
            Пароль
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            className="w-full bg-stone-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-400"
            style={{fontFamily: "'Inter', sans-serif"}}
            placeholder="Введите пароль"
          />
        </div>

        {error && (
          <p className="text-red-400 text-sm mb-4" style={{fontFamily: "'Inter', sans-serif"}}>
            {error}
          </p>
        )}

        <button
          onClick={handleLogin}
          className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-3 rounded-lg transition-colors"
          style={{fontFamily: "'Inter', sans-serif"}}
        >
          Войти
        </button>
      </div>
    </main>
  )
}