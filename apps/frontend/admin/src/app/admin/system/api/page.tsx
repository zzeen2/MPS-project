'use client'

import Card from '@/components/ui/Card'

export default function ApiManagementPage() {
  const summary = {
    totalKeys: 45,
    activeKeys: 42,
    hourlyCalls: 12345,
    successRate: 99.8,
    avgLatencyMs: 125,
  }

  const rows = Array.from({length:10}).map((_,i)=> ({
    company: `Company ${String.fromCharCode(65+i)}`,
    key: `sk_live_${Math.random().toString(36).slice(2,8)}...`,
    created: `2024.${String(((i*2)%12)+1).padStart(2,'0')}.${String(((i*5)%28)+1).padStart(2,'0')}`,
    lastUsed: `${(i+1)*2}분 전`,
    callsPerHour: (1200 - i*53),
    status: i%6===0 ? '비활성' : '활성',
  }))

  return (
    <div className="space-y-6">
      <Card>
        <div className="mb-2 text-sm font-semibold">API 현황 (실시간)</div>
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">총 API 키: <span className="text-white">{summary.totalKeys}</span> <span className="ml-1 text-white/60">(활성 {summary.activeKeys})</span></div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">시간당 평균 호출: <span className="text-white">{summary.hourlyCalls.toLocaleString()}</span></div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">성공률: <span className="text-white">{summary.successRate}%</span></div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">평균 응답시간: <span className="text-white">{summary.avgLatencyMs}ms</span></div>
        </div>
      </Card>

      <Card>
        <div className="mb-3 text-sm font-semibold">API 키 관리</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-white/60">
              <tr>
                <th className="py-2 pr-4">기업명</th>
                <th className="py-2 pr-4">API 키</th>
                <th className="py-2 pr-4">생성일</th>
                <th className="py-2 pr-4">마지막 사용</th>
                <th className="py-2 pr-4">호출수/시간</th>
                <th className="py-2 pr-4">상태</th>
                <th className="py-2 pr-0 text-right">액션</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r,i)=> (
                <tr key={i} className="border-top border-white/5">
                  <td className="py-2 pr-4 text-white">{r.company}</td>
                  <td className="py-2 pr-4 text-white/80">{r.key}</td>
                  <td className="py-2 pr-4 text-white/80">{r.created}</td>
                  <td className="py-2 pr-4 text-white/80">{r.lastUsed}</td>
                  <td className="py-2 pr-4 text-white/80">{r.callsPerHour.toLocaleString()}</td>
                  <td className={`py-2 pr-4 ${r.status==='활성'?'text-teal-300':'text-white/70'}`}>{r.status}</td>
                  <td className="py-2 pr-0 text-right">
                    <div className="space-x-2">
                      <button className="rounded bg-white/10 px-2 py-1 text-xs text-white hover:bg-white/15">재생성</button>
                      <button className="rounded border border-white/15 bg-white/5 px-2 py-1 text-xs text-white hover:bg-white/10">{r.status==='활성'?'비활성':'활성화'}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
} 