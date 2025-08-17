import Card from '@/components/ui/Card'

type Props = {
  achieved: number
  totalTargets: number
  issuedRwd: number
  usedRwd: number
}

export default function RewardsStatusCard({ achieved, totalTargets, issuedRwd, usedRwd }: Props) {
  const usedRate = Math.round((usedRwd / Math.max(1, issuedRwd)) * 100)
  const achievedRate = Math.round((achieved / Math.max(1, totalTargets)) * 100)

  return (
    <Card>
      <div className="mb-2 text-xs uppercase tracking-wider text-white/60">리워드 달성 현황</div>
      <div className="text-sm text-white">달성: {achieved}곡 ({achievedRate}%) · 미달성: {Math.max(0, totalTargets - achieved)}곡</div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded bg-white/10">
        <div className="h-full rounded bg-white/40" style={{ width: `${achievedRate}%` }} />
      </div>
      <div className="mt-3 text-sm text-white/80">발행: {issuedRwd.toLocaleString()} RWD</div>
      <div className="text-sm text-white/80">사용: {usedRwd.toLocaleString()} RWD ({usedRate}%)</div>
    </Card>
  )
} 