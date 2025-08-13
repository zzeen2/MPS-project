import Link from 'next/link'
import Card from '@/components/ui/Card'

type Props = {
  total: number
  momDeltaPct: number
  lastMonth: number
  ctaHref?: string
  activeApis?: number
  inactiveApis?: number
}

export default function TrackTotalCard({ total, momDeltaPct, lastMonth, ctaHref = '#', activeApis, inactiveApis }: Props) {
  const sign = momDeltaPct >= 0 ? '+' : ''
  return (
    <Card>
      <div className="mb-2 text-xs uppercase tracking-wider text-white/60">총 음원 수</div>
      <div className="text-3xl font-semibold text-white">{total.toLocaleString()}곡</div>
      <div className="mt-1 text-sm text-teal-300">({sign}{momDeltaPct}% 전월比)</div>
      <div className="mt-1 text-xs text-white/60">전월: {lastMonth.toLocaleString()}곡</div>
      {(activeApis !== undefined || inactiveApis !== undefined) && (
        <div className="mt-1 text-xs text-white/60">활성 API: {activeApis?.toLocaleString() ?? '-'}개 · 비활성 API: {inactiveApis?.toLocaleString() ?? '-'}개</div>
      )}
      <div className="mt-3">
        <Link href={ctaHref} className="text-xs text-teal-300 underline underline-offset-4 hover:text-teal-200">음원 관리 →</Link>
      </div>
    </Card>
  )
} 