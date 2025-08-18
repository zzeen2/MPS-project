import Card from '@/components/ui/Card'
import Title from '@/components/ui/Title'

export default function RewardsStatusCard() {
  return (
    <Card>
      <div className="space-y-1">
        <Title variant="card">리워드 한도 사용률</Title>
        <div className="text-3xl font-bold text-white">38%</div>
        <div className="space-y-0.5">
          <div className="text-sm text-white">달성: 15곡 · 미달성: 25곡</div>
          <div className="mt-3 mb-2 h-1.5 w-full overflow-hidden rounded bg-white/10">
            <div className="h-full rounded bg-teal-300" style={{ width: '38%' }} />
          </div>
          <div className="text-xs text-white/60">발행: 12,000 RWD</div>
          <div className="text-xs text-white/60">사용: 8,500 RWD (71%)</div>
        </div>
      </div>
    </Card>
  )
} 