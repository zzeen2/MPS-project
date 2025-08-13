import Card from '@/components/ui/Card'

type Props = {
  monthTotal: number
  momDeltaPct: number
  dailyAvg: number
}

export default function MonthlyPlaysCard({ monthTotal, momDeltaPct, dailyAvg }: Props) {
  const sign = momDeltaPct >= 0 ? '+' : ''
  return (
    <Card>
      <div className="mb-2 text-xs uppercase tracking-wider text-white/60">이번 달 총 재생 횟수</div>
      <div className="text-3xl font-semibold text-white">{monthTotal.toLocaleString()}회 <span className="ml-2 align-middle text-base text-teal-300">({sign}{momDeltaPct}% 전월比)</span></div>
      <div className="mt-1 text-xs text-white/60">일평균: {dailyAvg.toLocaleString()}회</div>
    </Card>
  )
} 