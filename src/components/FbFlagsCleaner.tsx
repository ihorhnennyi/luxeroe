// src/components/FbFlagsCleaner.tsx
'use client'
import { useEffect } from 'react'

export default function FbFlagsCleaner() {
  useEffect(() => {
    try {
      // Если пользователь вернулся/рефрешнул — просто удаляем флажок.
      // Даже если он остался после редиректа, он не приведёт к повторам,
      // мы нигде не триггерим Purchase автоматически.
      sessionStorage.removeItem('fb:last_purchase_id')
    } catch {}
  }, [])

  return null
}
