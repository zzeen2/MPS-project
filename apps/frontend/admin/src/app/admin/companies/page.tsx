'use client'

import Link from 'next/link'
import Card from '@/components/ui/Card'
import { useState } from 'react'
import CompanyDetailModal from '@/components/modals/CompanyDetailModal'

export default function CompaniesPage() {
  const rows = Array.from({ length: 12 }).map((_, i) => {
    const name = `Company ${String.fromCharCode(65 + i)}`
    const tier = i % 3 === 0 ? 'Business' : i % 3 === 1 ? 'Standard' : 'Free'
    const joined = `2024.${String(((i*3)%12)+1).padStart(2,'0')}.${String(((i*7)%28)+1).padStart(2,'0')}`
    const monthly = (50000 - i * 3200).toLocaleString() + '회'
    const tokens = (1200 - i * 37).toLocaleString() + '토큰'
    const usedTracks = 20 + (i % 6)
    const active = i % 5 !== 2
    return { id: String(i+1), name, tier, joined, monthly, tokens, usedTracks, active }
  })

  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<typeof rows[number] | null>(null)

  const total = 45
  const activeCount = 42
  const inactiveCount = 3

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-center gap-2">
          <input className="min-w-[240px] flex-1 rounded bg-black/40 px-3 py-2 text-sm text-white placeholder-white/40 outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-teal-400/60" placeholder="기업명 검색" />
          <select className="rounded bg-black/40 px-3 py-2 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-teal-400/60">
            <option>등급: 전체</option>
            <option>Business</option>
            <option>Standard</option>
            <option>Free</option>
          </select>
          <select className="rounded bg-black/40 px-3 py-2 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-teal-400/60">
            <option>가입일</option>
            <option>최신순</option>
            <option>오래된순</option>
          </select>
          <select className="rounded bg-black/40 px-3 py-2 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-teal-400/60">
            <option>활성상태: 전체</option>
            <option>활성</option>
            <option>비활성</option>
          </select>
          <button className="rounded border border-white/15 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10">내보내기</button>
        </div>
        <div className="mt-3 text-xs text-white/70">
          총 기업: <span className="text-teal-300">{total}</span>개  |  활성: <span className="text-teal-300">{activeCount}</span>개  |  비활성: <span className="text-teal-300">{inactiveCount}</span>개
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-white/60">
              <tr>
                <th className="py-2 pr-4">기업명</th>
                <th className="py-2 pr-4">등급</th>
                <th className="py-2 pr-4">가입일</th>
                <th className="py-2 pr-4">월 사용량</th>
                <th className="py-2 pr-4">누적 구독 요금</th>
                <th className="py-2 pr-4">보유 토큰</th>
                <th className="py-2 pr-4">사용 음원 갯수</th>
                <th className="py-2 pr-0 text-right">액션</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-white/5">
                  <td className="py-2 pr-4 text-white"><Link href={`/admin/companies/${r.id}`} className="hover:underline">{r.name}</Link></td>
                  <td className="py-2 pr-4 text-white/80">{r.tier}</td>
                  <td className="py-2 pr-4 text-white/80">{r.joined}</td>
                  <td className="py-2 pr-4 text-white/80">{r.monthly}</td>
                  <td className="py-2 pr-4 text-white/50">-</td>
                  <td className="py-2 pr-4 text-white/80">{r.tokens}</td>
                  <td className="py-2 pr-4 text-white/80">{r.usedTracks}</td>
                  <td className="py-2 pr-0 text-right">
                    {r.active ? (
                      <div className="space-x-2">
                        <button
                          className="rounded bg-white/10 px-2 py-1 text-xs text-white hover:bg-white/15"
                          onClick={() => { setSelected(r); setOpen(true) }}
                        >상세</button>
                        <button className="rounded border border-white/15 bg-white/5 px-2 py-1 text-xs text-white hover:bg-white/10">수정</button>
                      </div>
                    ) : (
                      <button className="rounded bg-teal-600/90 px-2 py-1 text-xs text-white hover:bg-teal-500">활성화</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <CompanyDetailModal open={open} onClose={() => setOpen(false)} company={selected} />
    </div>
  )
} 