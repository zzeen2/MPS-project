import type { ReactNode } from 'react'

export default function SystemLayout({ children }: { children: ReactNode }) {
  return (
    <div className="w-full">
      <div className="mb-6 border-b border-white/10 pb-4">
        <h1 className="text-xl font-semibold text-white">시스템 관리</h1>
        <p className="mt-1 text-sm text-white/60">구독제 등급 · API 키/모니터링</p>
      </div>
      {children}
    </div>
  )
} 