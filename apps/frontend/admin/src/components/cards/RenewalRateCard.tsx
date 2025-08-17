import Card from '@/components/ui/Card'

type Props = {
  ratePct: number
  momDeltaPct: number
  churned: number
  resubscribed: number
}

export default function RenewalRateCard({ ratePct, momDeltaPct, churned, resubscribed }: Props) {
  const sign = momDeltaPct >= 0 ? '+' : ''
  return (
    <Card>
      <div className="mb-2 text-xs uppercase tracking-wider text-white/60">구독 갱신률</div>
      <div className="text-3xl font-semibold text-white">{ratePct}% <span className="ml-2 align-middle text-base text-teal-300">({sign}{momDeltaPct}% 전월比)</span></div>
      <div className="mt-1 text-xs text-white/60">신규 해지: {churned}개 기업 · 재구독: {resubscribed}개 기업</div>
    </Card>
  )
} 