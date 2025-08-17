'use client'
import { useEffect, useState } from 'react'

type Props = {
  title: string
  subtitle?: string
}

export default function DashboardHeader({ title, subtitle }: Props) {
  const [lastUpdated, setLastUpdated] = useState<string>('')

  useEffect(() => {
    const update = () => {
      const now = new Date()
      const s = now.toLocaleString('ko-KR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
      setLastUpdated(s)
    }
    update()
    const id = setInterval(update, 1000) // 1초마다 업데이트
    return () => clearInterval(id)
  }, [])

  return (
    <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-white/60">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3 text-xs text-white/60">
        <span>마지막 업데이트: {lastUpdated}</span>
        <button
          onClick={() => location.reload()}
          className="rounded border border-white/10 bg-white/5 px-3 py-1.5 text-white/80 hover:bg-white/10 hover:text-white"
        >
          새로고침
        </button>
      </div>
    </div>
  )
} 