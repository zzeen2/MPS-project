import type { ReactNode } from 'react'

export default function RewardsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="w-full">
      <div className="mb-6 border-b border-white/10 pb-4">
        <h1 className="text-xl font-semibold text-white">리워드 관리</h1>
        <p className="mt-1 text-sm text-white/60">리워드 설정 · 지급 현황 · 토큰/온체인</p>
      </div>
      {children}
    </div>
  )
} 