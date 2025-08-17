import Card from '@/components/ui/Card'

type Props = {
  forecastKrw: number
  momDeltaPct: number
}

function formatKRW(n: number) {
  return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 }).format(n)
}

export default function MonthlyRevenueCard({ forecastKrw, momDeltaPct }: Props) {
  const sign = momDeltaPct >= 0 ? '+' : ''
  return (
    <Card>
      <div className="mb-2 text-xs uppercase tracking-wider text-white/60">이번 달 예상 매출</div>
      <div className="text-3xl font-semibold text-white">{formatKRW(forecastKrw)} <span className="ml-2 align-middle text-base text-teal-300">({sign}{momDeltaPct}% 전월比)</span></div>
      <div className="mt-1 text-xs text-white/60">* 구독료 기준</div>
    </Card>
  )
} 