'use client'

import Card from '@/components/ui/Card'

type CompanyRow = {
  id: string
  name: string
  tier: string
  joined: string
  monthly: string
  tokens: string
  usedTracks: number
  active: boolean
}

type Props = {
  open: boolean
  onClose: () => void
  company: CompanyRow | null
}

export default function CompanyDetailModal({ open, onClose, company }: Props) {
  if (!open || !company) return null

  const topTracks = [
    { name: 'Song A', count: 1234, pct: 24 },
    { name: 'Song B', count: 987, pct: 19 },
    { name: 'Song C', count: 765, pct: 15 },
    { name: '기타', count: 2014, pct: 42 },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-4xl rounded-2xl border border-white/10 bg-neutral-900/90 p-6 text-white shadow-2xl backdrop-blur-md">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{company.name}</h3>
            <p className="text-xs text-white/60">기업 상세 정보</p>
          </div>
          <button onClick={onClose} className="rounded bg-white/10 px-3 py-1.5 text-sm hover:bg-white/15">닫기</button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <div className="mb-2 text-sm font-semibold">기본 정보</div>
            <div className="space-y-2 text-sm text-white/80">
              <div>등급: <span className="text-white">{company.tier}</span></div>
              <div>가입일: <span className="text-white">{company.joined}</span></div>
              <div>보유 토큰: <span className="text-white">{company.tokens}</span></div>
              <div>월 사용량: <span className="text-white">{company.monthly}</span></div>
              <div>사용 음원: <span className="text-white">{company.usedTracks}</span> 곡</div>
              <div>상태: <span className={company.active? 'text-teal-300':'text-white/70'}>{company.active? '활성':'비활성'}</span></div>
            </div>
          </Card>

          <Card>
            <div className="mb-2 text-sm font-semibold">리워드 토큰 현황</div>
            <div className="space-y-2 text-sm text-white/80">
              <div>현재 보유: <span className="text-white">1,234.567</span> 토큰</div>
              <div>이번 달 적립: <span className="text-teal-300">+456.789</span> 토큰</div>
              <div>이번 달 사용: <span className="text-white/90">-234.567</span> 토큰 <span className="text-white/60">(할인 적용)</span></div>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded bg-white/10"><div className="h-full bg-teal-400" style={{ width: '68%' }} /></div>
          </Card>
        </div>

        <Card className="mt-4">
          <div className="mb-2 text-sm font-semibold">TOP 사용 음원 (이번 달)</div>
          <div className="space-y-3">
            {topTracks.map((t, i) => (
              <div key={i} className="text-sm">
                <div className="flex items-center justify-between">
                  <div className="text-white/90">{t.name}</div>
                  <div className="text-white/60">{t.count.toLocaleString()}회 <span className="ml-1 text-white/50">({t.pct}%)</span></div>
                </div>
                <div className="mt-1 h-2 w-full overflow-hidden rounded bg-white/10">
                  <div className="h-full bg-teal-400" style={{ width: `${t.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
} 