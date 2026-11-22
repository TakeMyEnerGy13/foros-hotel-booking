'use client'

import { useEffect } from 'react'

export default function useVisibleRefresh(refresh: () => void, enabled = true) {
  useEffect(() => {
    if (!enabled) return
    const refreshVisible = () => {
      if (document.visibilityState === 'visible') refresh()
    }
    const timer = window.setInterval(refreshVisible, 10000)
    window.addEventListener('focus', refreshVisible)
    document.addEventListener('visibilitychange', refreshVisible)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener('focus', refreshVisible)
      document.removeEventListener('visibilitychange', refreshVisible)
    }
  }, [enabled, refresh])
}
