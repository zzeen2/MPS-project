import Card from '@/components/ui/Card'
import Title from '@/components/ui/Title'

export default function MonthlyPlaysCard() {
  return (
    <Card>
      <div className="space-y-1">
        <Title variant="card">이번 달 총 재생 횟수</Title>
        <div className="text-3xl font-bold text-white">524,300회</div>
        <div className="space-y-0.5">
          <div className="text-sm text-teal-300">(전월 대비 +8%)</div>
          <div className="mt-2">
            <div className="text-xs text-white/60">일평균: 17,480회</div>
          </div>
        </div>
      </div>
    </Card>
  )
} 