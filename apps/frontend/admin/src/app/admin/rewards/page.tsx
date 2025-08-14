'use client'

import Card from '@/components/ui/Card'
import SimpleLineChart from '@/components/charts/SimpleLineChart'

export default function RewardsOverviewPage() {
  // 더미 데이터 (결정론적)
  const trackRows = Array.from({ length: 8 }).map((_, i) => {
    const name = `Track ${String.fromCharCode(65 + i)}`
    const used = 200 + i * 70 // 이번 달 사용
    const limit = i % 4 === 0 ? null : 1000 + i * 120 // null: 무제한
    const companies = 5 + (i % 4) * 3
    const pct = limit ? Math.min(100, Math.round((used / limit) * 100)) : null
    return { name, used, limit, companies, pct }
  })

  return (
    <div className="space-y-6">
      {/* KPI */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <div className="text-sm text-white/70">이번 달 총 지급</div>
          <div className="mt-1 text-2xl font-semibold text-white"><span className="text-teal-300">12,345</span> 토큰</div>
        </Card>
        <Card>
          <div className="text-sm text-white/70">누적 총 지급량</div>
          <div className="mt-1 text-2xl font-semibold text-white"><span className="text-teal-300">987,654</span> 토큰</div>
        </Card>
        <Card>
          <div className="text-sm text-white/70">평균 사용률</div>
          <div className="mt-1 text-2xl font-semibold text-white"><span className="text-teal-300">67%</span></div>
        </Card>
      </div>

      {/* 월별 지급 추이 */}
      <Card>
        <div className="mb-2 text-sm font-semibold">월별 리워드 지급 추이</div>
        <SimpleLineChart labels={["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"]} series={[{label:'지급량', data:[800,900,950,1100,1200,1400,1350,1500,1600,1700,1650,1800]}]} />
      </Card>

      {/* 기업별 현황 */}
      <Card>
        <div className="mb-3 text-sm font-semibold">기업별 리워드 현황</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-white/60">
              <tr>
                <th className="py-2 pr-4">기업명</th>
                <th className="py-2 pr-4">등급</th>
                <th className="py-2 pr-4">보유 토큰</th>
                <th className="py-2 pr-4">이번 달 적립</th>
                <th className="py-2 pr-4">사용한 토큰</th>
                <th className="py-2 pr-4">사용률</th>
                <th className="py-2 pr-0 text-right">상세보기</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({length:8}).map((_,i)=> (
                <tr key={i} className="border-t border-white/5">
                  <td className="py-2 pr-4 text-white">Company {String.fromCharCode(65+i)}</td>
                  <td className="py-2 pr-4 text-white/80">{i%3===0?'Business':i%3===1?'Standard':'Free'}</td>
                  <td className="py-2 pr-4 text-white/80">{(1200-i*37).toLocaleString()}토큰</td>
                  <td className="py-2 pr-4 text-white/80">+{(300-i*13).toLocaleString()}토큰</td>
                  <td className="py-2 pr-4 text-white/80">{(200-i*11).toLocaleString()}토큰</td>
                  <td className="py-2 pr-4 text-white/80">{(20+i*3)}%</td>
                  <td className="py-2 pr-0 text-right"><button className="rounded bg-white/10 px-2 py-1 text-xs text-white hover:bg-white/15">상세</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 음원별 현황 */}
      <Card>
        <div className="mb-3 text-sm font-semibold">음원별 리워드 현황</div>
        <div className="space-y-3">
          {trackRows.map((t, idx) => (
            <div key={idx} className="rounded-lg border border-white/5 bg-white/5 p-3">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-white">{t.name}</div>
                  <div className="mt-1 text-xs text-white/70">
                    이번 달 사용: <span className="text-teal-300">{t.used.toLocaleString()}</span> 토큰
                    {t.limit ? (
                      <>
                        {' '} / 최대 <span className="text-white">{t.limit.toLocaleString()}</span> 토큰
                        {' '}(<span className="text-white/70">{t.pct}%</span>)
                      </>
                    ) : (
                      <span className="ml-1 rounded bg-white/10 px-1.5 py-0.5 text-[11px] text-white/80">무제한</span>
                    )}
                  </div>
                </div>
                <div className="shrink-0 text-xs text-white/70">사용 기업 <span className="text-white">{t.companies}</span></div>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded bg-white/10">
                {t.pct !== null ? (
                  <div className="h-full bg-teal-400" style={{ width: `${t.pct}%` }} />
                ) : (
                  <div className="h-full bg-white/20" style={{ width: '100%' }} />
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
} 