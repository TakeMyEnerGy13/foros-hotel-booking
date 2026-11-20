'use client'
import { useState } from 'react'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }),
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
    <main style={{minHeight: '100vh', background: '#0f0f0f', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'}}>
      <div style={{background: '#1a1a1a', borderRadius: '24px', padding: '40px', width: '100%', maxWidth: '400px', border: '1px solid rgba(255,255,255,0.08)'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px'}}>
          <img src="/logo.png" style={{width: '40px', height: '40px'}} />
          <div>
            <h1 style={{fontFamily: "'DM Serif Display', serif", fontSize: '22px', color: 'white', margin: 0}}>Берег Радости</h1>
            <p style={{fontFamily: "'Inter', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: 0}}>Панель администратора</p>
          </div>
        </div>
        <div style={{marginBottom: '16px'}}>
          <label style={{display: 'block', fontFamily: "'Inter', sans-serif", fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: '8px'}}>Пароль</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="Введите пароль"
            style={{width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '12px 16px', color: 'white', fontFamily: "'Inter', sans-serif", fontSize: '14px', outline: 'none', boxSizing: 'border-box'}}
          />
        </div>
        {error && <p style={{fontFamily: "'Inter', sans-serif", fontSize: '13px', color: '#f87171', marginBottom: '16px'}}>{error}</p>}
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{width: '100%', background: 'rgba(245,158,11,0.9)', border: 'none', borderRadius: '12px', padding: '14px', color: 'black', fontFamily: "'Inter', sans-serif", fontSize: '13px', fontWeight: 600, cursor: 'pointer'}}
        >
          {loading ? 'Вход...' : 'Войти'}
        </button>
      </div>
    </main>
  )
}