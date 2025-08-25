'use client'
import { useState } from 'react'
import SimpleLineChart from '@/components/charts/SimpleLineChart'
import Card from '@/components/ui/Card'

type Props = { open: boolean; onClose: () => void; title?: string }

export default function MusicStatsModal({ open, onClose, title = '음원 상세 통계' }: Props) {
  const [timeTab, setTimeTab] = useState<'daily'|'weekly'|'monthly'>('daily')
  const [selectedMonth, setSelectedMonth] = useState('3월')
  
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-7xl rounded-2xl border border-white/10 bg-neutral-900/90 text-white shadow-2xl backdrop-blur-md max-h-[90vh] flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-white/10">
          <div>
            <h3 className="text-xl font-semibold text-white">{title}</h3>
            <p className="mt-1 text-sm text-teal-300">재생 통계 분석</p>
          </div>
          <button 
            onClick={onClose} 
            className="rounded-lg bg-white/10 p-2 text-white hover:bg-white/15 transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 내용 - 스크롤 가능 */}
        <div className="flex-1 overflow-y-auto p-6 pt-4 scrollbar-thin scrollbar-track-white/5 scrollbar-thumb-white/20 hover:scrollbar-thumb-white/30">
          {/* 4개 차트 그리드 */}
          <div className="grid gap-4 md:grid-cols-2 mb-6">
            {/* 재생 추이 */}
            <Card>
              <div className="mb-3">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-4 w-1.5 rounded bg-teal-300" />
                    <div className="text-sm font-semibold">재생 추이</div>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <button 
                      onClick={() => setTimeTab('daily')} 
                      className={`rounded px-2 py-1 ${timeTab === 'daily' ? 'bg-teal-600/90' : 'bg-white/10 hover:bg-white/15'}`}
                    >
                      일간
                    </button>
                    <button 
                      onClick={() => setTimeTab('weekly')} 
                      className={`rounded px-2 py-1 ${timeTab === 'weekly' ? 'bg-teal-600/90' : 'bg-white/10 hover:bg-white/15'}`}
                    >
                      주간
                    </button>
                    <button 
                      onClick={() => setTimeTab('monthly')} 
                      className={`rounded px-2 py-1 ${timeTab === 'monthly' ? 'bg-teal-600/90' : 'bg-white/10 hover:bg-white/15'}`}
                    >
                      월간
                    </button>
                  </div>
                </div>
              </div>
              <div className="min-w-0 overflow-hidden h-48">
                <SimpleLineChart 
                  labels={timeTab === 'daily' ? [...Array(31)].map((_,i)=>`${i+1}일`) : 
                          timeTab === 'weekly' ? ['1주', '2주', '3주', '4주'] : 
                          ['1월', '2월', '3월', '4월', '5월', '6월']}
                  series={[{
                    label: timeTab === 'daily' ? '일간 재생' : timeTab === 'weekly' ? '주간 재생' : '월간 재생',
                    data: timeTab === 'daily' ? [...Array(31)].map((_,i)=>100+i*13) :
                           timeTab === 'weekly' ? [1200, 1350, 1480, 1620] :
                           [5000, 5800, 6600, 7200, 7800, 8400]
                  }]}
                  colors={['#14b8a6']}
                />
              </div>
            </Card>

            {/* 시간대별 재생 패턴 */}
            <Card>
              <div className="mb-2 flex items-center gap-2">
                <span className="h-4 w-1.5 rounded bg-teal-300" />
                <div className="text-sm font-semibold">시간대별 재생 패턴</div>
              </div>
              <div className="min-w-0 overflow-hidden h-48">
                <SimpleLineChart 
                  labels={[...Array(24)].map((_,i)=>`${i}시`)}
                  series={[
                    {label: '금일', data: [20,18,17,15,14,12,16,22,30,40,45,48,50,52,49,46,42,38,35,30,28,25,22,20]},
                    {label: '전일', data: [18,16,15,13,12,10,14,20,28,38,43,46,48,50,47,44,40,36,33,28,26,23,20,18]}
                  ]}
                  colors={['#14b8a6', '#9ca3af']}
                />
              </div>
            </Card>

            {/* 요일별 재생 패턴 */}
            <Card>
              <div className="mb-2 flex items-center gap-2">
                <span className="h-4 w-1.5 rounded bg-teal-300" />
                <div className="text-sm font-semibold">요일별 재생 패턴</div>
              </div>
              <div className="min-w-0 overflow-hidden h-48">
                <SimpleLineChart 
                  labels={['월', '화', '수', '목', '금', '토', '일']}
                  series={[
                    {label: '이번주', data: [180, 190, 200, 220, 240, 210, 200]},
                    {label: '지난주', data: [170, 180, 190, 210, 230, 200, 190]}
                  ]}
                  colors={['#14b8a6', '#9ca3af']}
                />
              </div>
            </Card>

            {/* 월별 성장률 */}
            <Card>
              <div className="mb-2 flex items-center gap-2">
                <span className="h-4 w-1.5 rounded bg-teal-300" />
                <div className="text-sm font-semibold">월별 성장률</div>
              </div>
              <div className="min-w-0 overflow-hidden h-48">
                <SimpleLineChart 
                  labels={['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']}
                  series={[{
                    label: '성장률(%)',
                    data: [5, 12, 8, 12, 6, 9, 4, 7, 10, 8, -2, 3]
                  }]}
                  colors={['#14b8a6']}
                />
              </div>
            </Card>
          </div>

          {/* 기업별 재생 순위 */}
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-4 w-1.5 rounded bg-teal-300" />
                <div className="text-sm font-semibold">기업별 재생 순위</div>
              </div>
              <select 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="rounded bg-white/10 px-2 py-1 text-xs text-white border border-white/20"
              >
                <option>1월</option>
                <option>2월</option>
                <option>3월</option>
                <option>4월</option>
                <option>5월</option>
                <option>6월</option>
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-white/60">
                  <tr>
                    <th className="py-2 pr-4">순위</th>
                    <th className="py-2 pr-4">기업명</th>
                    <th className="py-2 pr-4">등급</th>
                    <th className="py-2 pr-4">{selectedMonth} 재생</th>
                    <th className="py-2 pr-4">전월 대비</th>
                    <th className="py-2 pr-0 text-right">누적 재생</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({length:10}).map((_,i)=> (
                    <tr key={i} className="border-t border-white/5">
                      <td className="py-2 pr-4 text-white/80">{i+1}</td>
                      <td className="py-2 pr-4 text-white">Company {i+1}</td>
                      <td className="py-2 pr-4">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${
                          i < 3 ? 'bg-gradient-to-r from-blue-400/15 to-blue-400/15 text-blue-300 border border-blue-400/25' :
                          i < 6 ? 'bg-gradient-to-r from-teal-400/15 to-blue-400/15 text-teal-300 border border-teal-400/25' :
                          'bg-gradient-to-r from-gray-400/15 to-gray-400/15 text-gray-300 border border-gray-400/25'
                        }`}>
                          {i < 3 ? 'Business' : i < 6 ? 'Standard' : 'Free'}
                        </span>
                      </td>
                      <td className="py-2 pr-4 text-white/80">{(3000-i*120).toLocaleString()}회</td>
                      <td className="py-2 pr-4 text-teal-400">+{(15.0-i*1.2).toFixed(1)}%</td>
                      <td className="py-2 pr-0 text-right text-white/80">{(15000-i*600).toLocaleString()}회</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
} 