import Card from '@/components/ui/Card'

type Props = {
  total: number
  newCount: number
  standard: number
  business: number
}

export default function CompanyTotalCard({ total, newCount, standard, business }: Props) {
  return (
    <Card>
      <div className="mb-2 text-xs uppercase tracking-wider text-white/60">총 가입 기업 수</div>
      <div className="text-3xl font-semibold text-white">{total.toLocaleString()}개 기업</div>
      <div className="mt-1 text-xs text-white/60">신규 가입: {newCount.toLocaleString()}개</div>
      <div className="mt-1 text-xs text-white/60">Standard: {standard.toLocaleString()}개 · Business: {business.toLocaleString()}개</div>
    </Card>
  )
} 