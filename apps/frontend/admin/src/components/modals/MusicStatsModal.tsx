'use client'
import { useState } from 'react'
import SimpleLineChart from '@/components/charts/SimpleLineChart'
import Card from '@/components/ui/Card'

type Props = { open: boolean; onClose: () => void; title?: string }

export default function MusicStatsModal({ open, onClose, title = '음원 상세 통계' }: Props) {
  const [tab, setTab] = useState<'plays'|'revenue'|'rewards'>('plays')
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-5xl rounded-2xl border border-white/10 bg-neutral-900/90 p-6 text-white shadow-2xl backdrop-blur-md">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-xs text-white/60">재생/매출/리워드 통계</p>
          </div>
          <button onClick={onClose} className="rounded bg-white/10 px-3 py-1.5 text-sm hover:bg-white/15">닫기</button>
        </div>

        <div className="mb-4 flex gap-2 text-sm">
          <button onClick={()=>setTab('plays')} className={`rounded px-3 py-1.5 ${tab==='plays'?'bg-teal-600/90':'bg-white/10 hover:bg-white/15'}`}>재생 통계</button>
          <button onClick={()=>setTab('revenue')} className={`rounded px-3 py-1.5 ${tab==='revenue'?'bg-teal-600/90':'bg-white/10 hover:bg-white/15'}`}>매출 기여도</button>
          <button onClick={()=>setTab('rewards')} className={`rounded px-3 py-1.5 ${tab==='rewards'?'bg-teal-600/90':'bg-white/10 hover:bg-white/15'}`}>리워드 현황</button>
        </div>

        {tab==='plays' && (
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <div className="mb-2 text-sm font-semibold">일/주/월 재생 추이</div>
              <div className="min-w-0 overflow-hidden"><SimpleLineChart /></div>
            </Card>
            <Card>
              <div className="mb-2 text-sm font-semibold">시간대별 재생 패턴</div>
              <div className="min-w-0 overflow-hidden"><SimpleLineChart labels={[...Array(24)].map((_,i)=>`${i}시`)} series={[{label:'금일',data:[20,18,17,15,14,12,16,22,30,40,45,48,50,52,49,46,42,38,35,30,28,25,22,20]}]} /></div>
            </Card>
            <Card className="md:col-span-2">
              <div className="mb-2 text-sm font-semibold">기업별 재생 순위(Top 10)</div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-white/60">
                    <tr><th className="py-2 pr-4">순위</th><th className="py-2 pr-4">기업</th><th className="py-2 pr-0 text-right">재생수</th></tr>
                  </thead>
                  <tbody>
                    {Array.from({length:10}).map((_,i)=> (
                      <tr key={i} className="border-t border-white/5">
                        <td className="py-2 pr-4 text-white/80">{i+1}</td>
                        <td className="py-2 pr-4 text-white">Company {i+1}</td>
                        <td className="py-2 pr-0 text-right text-white/80">{(3000-i*120).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {tab==='revenue' && (
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <div className="mb-2 text-sm font-semibold">예상 매출 추이</div>
              <div className="min-w-0 overflow-hidden"><SimpleLineChart /></div>
            </Card>
            <Card>
              <div className="mb-2 text-sm font-semibold">전체 매출 대비 비중</div>
              <div className="text-sm text-white/80">이 음원: <span className="text-teal-300">12.4%</span></div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded bg-white/10">
                <div className="h-full bg-teal-400" style={{width:'12.4%'}} />
              </div>
            </Card>
            <Card className="md:col-span-2">
              <div className="mb-2 text-sm font-semibold">기업별 사용량 분포</div>
              <div className="min-w-0 overflow-hidden"><SimpleLineChart /></div>
            </Card>
          </div>
        )}

        {tab==='rewards' && (
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <div className="mb-2 text-sm font-semibold">총 지급된 리워드</div>
              <div className="text-3xl font-semibold text-white">8,500 <span className="text-sm font-normal text-white/70">RWD</span></div>
              <div className="mt-3 text-sm text-white/80">사용률: <span className="text-teal-300">71%</span></div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded bg-white/10"><div className="h-full bg-teal-400" style={{width:'71%'}} /></div>
            </Card>
            <Card>
              <div className="mb-2 text-sm font-semibold">기업별 리워드 수령 현황</div>
              <div className="min-w-0 overflow-hidden"><SimpleLineChart /></div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
} 