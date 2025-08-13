import type { ReactNode } from 'react'

export default function MusicsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="w-full">
      <div className="mb-6 border-b border-white/10 pb-4">
        <h1 className="text-xl font-semibold text-white">음원 관리</h1>
        <p className="mt-1 text-sm text-white/60">음원 목록 · 등록/수정 · 카테고리 관리</p>
      </div>
      {children}
    </div>
  )
} 