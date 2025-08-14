'use client'

import Card from '@/components/ui/Card'
import { useParams } from 'next/navigation'

export default function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const idNum = Number(id) || 1
  const name = `Company ${String.fromCharCode(64 + ((idNum-1)%26)+1)}`

  const topTracks = [
    { name: 'Song A', count: 1234, pct: 24 },
    { name: 'Song B', count: 987, pct: 19 },
    { name: 'Song C', count: 765, pct: 15 },
    { name: '기타', count: 2014, pct: 42 },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <div className="mb-2 text-lg font-semibold text-white">{name}</div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 text-sm text-white/80">
            <div>사업자등록번호: <span className="text-white">123-45-67890</span></div>
            <div>대표자명: <span className="text-white">김철수</span></div>
            <div>연락처: <span className="text-white">02-1234-5678</span></div>
            <div>이메일: <span className="text-white">admin@companya.com</span></div>
          </div>
          <div className="space-y-2 text-sm text-white/80">
            <div>홈페이지 url: <span className="text-white">-</span></div>
            <div>담당자: <span className="text-white">이영희</span> (<span className="text-white">dev@companya.com</span>)</div>
            <div>등급: <span className="text-white">Business</span></div>
            <div>가입일: <span className="text-white">2024.01.15</span></div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
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

        <Card>
          <div className="mb-2 text-sm font-semibold">리워드 토큰 현황</div>
          <div className="space-y-2 text-sm text-white/80">
            <div>현재 보유: <span className="text-white">1,234.567</span> 토큰</div>
            <div>이번 달 적립: <span className="text-teal-300">+456.789</span> 토큰</div>
            <div>이번 달 사용: <span className="text-white/90">-234.567</span> 토큰 <span className="text-white/60">(할인 적용)</span></div>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded bg-white/10">
            <div className="h-full bg-teal-400" style={{ width: '68%' }} />
          </div>
        </Card>
      </div>
    </div>
  )
} 