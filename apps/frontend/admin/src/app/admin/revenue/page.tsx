'use client'

import Card from '@/components/ui/Card'
import SimpleLineChart from '@/components/charts/SimpleLineChart'
import { useMemo, useState } from 'react'

export default function RevenueDashboardPage() {
  const kpisRow1 = [
    { label: '이번 달 매출', value: '₩12,345,678' },
    { label: '전월 대비', value: '+15.3%' },
    { label: '연간 누적', value: '₩98,765,432' },
  ]
  const kpisRow2 = [
    { label: '신규 기업', value: '3개' },
    { label: '평균 ARPU', value: '₩234,567' },
    { label: '구독 이탈률', value: '2.1%' },
  ]

  const standardTop = [
    { name: 'Company A', amount: 1234567, pct: 35 },
    { name: 'Company B', amount: 987654, pct: 28 },
    { name: 'Company C', amount: 654321, pct: 18 },
    { name: 'Company D', amount: 432198, pct: 12 },
    { name: '기타 5개사', amount: 234567, pct: 7 },
  ]
  const businessTop = [
    { name: 'Company A', amount: 1234567, pct: 35 },
    { name: 'Company B', amount: 987654, pct: 28 },
    { name: 'Company C', amount: 654321, pct: 18 },
    { name: 'Company D', amount: 432198, pct: 12 },
    { name: '기타 5개사', amount: 234567, pct: 7 },
  ]

  // filters
  const [range, setRange] = useState<'3M'|'6M'|'12M'>('6M')
  const [tier, setTier] = useState<'전체'|'Standard'|'Business'>('전체')
  const [company, setCompany] = useState<'전체'|'Company A'|'Company B'|'Company C'|'Company D'>('전체')

  const labels = useMemo(() => {
    const months = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']
    if (range === '3M') return months.slice(0, 3)
    if (range === '6M') return months.slice(0, 6)
    return months
  }, [range])

  const series = useMemo(() => {
    const base = range === '3M' ? [900, 1100, 1300]
      : range === '6M' ? [700, 850, 920, 1100, 1200, 1400]
      : [600, 720, 810, 900, 980, 1100, 1200, 1300, 1400, 1500, 1600, 1750]
    let factor = 1
    if (tier === 'Standard') factor += 0.05
    if (tier === 'Business') factor += 0.12
    if (company !== '전체') factor += 0.08
    const data = base.map((v, i) => Math.round(v * factor + (i%3)*20))
    return [{ label: '매출', data }]
  }, [range, tier, company])

  return (
    <div className="space-y-6">
      {/* KPI Row 1 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kpisRow1.map((k, i) => (
          <Card key={i}>
            <div className="text-sm text-white/70">{k.label}</div>
            <div className="mt-1 text-2xl font-semibold text-white">
              <span className="text-teal-300">{k.value}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* KPI Row 2 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kpisRow2.map((k, i) => (
          <Card key={i}>
            <div className="text-sm text-white/70">{k.label}</div>
            <div className="mt-1 text-2xl font-semibold text-white">
              <span className="text-teal-300">{k.value}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Trend + Filters */}
      <Card>
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm font-semibold">매출 추이</div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <div className="flex gap-1">
              {(['3M','6M','12M'] as const).map(r => (
                <button key={r} onClick={()=>setRange(r)} className={`rounded px-2 py-1 ${range===r? 'bg-teal-600/90 text-white':'bg-white/10 text-white/80 hover:bg-white/15'}`}>{r}</button>
              ))}
            </div>
            <select value={tier} onChange={e=>setTier(e.target.value as any)} className="rounded bg-black/40 px-2 py-1 text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-teal-400/60">
              <option value="전체">등급: 전체</option>
              <option value="Standard">Standard</option>
              <option value="Business">Business</option>
            </select>
            <select value={company} onChange={e=>setCompany(e.target.value as any)} className="rounded bg-black/40 px-2 py-1 text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-teal-400/60">
              <option value="전체">기업: 전체</option>
              <option value="Company A">Company A</option>
              <option value="Company B">Company B</option>
              <option value="Company C">Company C</option>
              <option value="Company D">Company D</option>
            </select>
          </div>
        </div>
        <div className="min-w-0 overflow-hidden">
          <SimpleLineChart labels={labels} series={series} />
        </div>
      </Card>

      {/* Standard Top */}
      <Card>
        <div className="mb-2 text-sm font-semibold">Standard 등급 TOP 매출 기업 (이번 달)</div>
        <div className="space-y-3">
          {standardTop.map((c, i) => (
            <div key={i} className="text-sm">
              <div className="flex items-center justify-between">
                <div className="text-white/90">{c.name}</div>
                <div className="text-white/70">₩{c.amount.toLocaleString()} <span className="ml-1 text-white/50">({c.pct}%)</span></div>
              </div>
              <div className="mt-1 h-2 w-full overflow-hidden rounded bg-white/10">
                <div className="h-full bg-teal-400" style={{ width: `${c.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Business Top */}
      <Card>
        <div className="mb-2 text-sm font-semibold">Business 등급 TOP 매출 기업 (이번 달)</div>
        <div className="space-y-3">
          {businessTop.map((c, i) => (
            <div key={i} className="text-sm">
              <div className="flex items-center justify-between">
                <div className="text-white/90">{c.name}</div>
                <div className="text-white/70">₩{c.amount.toLocaleString()} <span className="ml-1 text-white/50">({c.pct}%)</span></div>
              </div>
              <div className="mt-1 h-2 w-full overflow-hidden rounded bg-white/10">
                <div className="h-full bg-teal-400" style={{ width: `${c.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
} 