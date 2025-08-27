'use client'
import { useState } from 'react'
import SimpleLineChart from '@/components/charts/SimpleLineChart'
import Card from '@/components/ui/Card'

type Props = { open: boolean; onClose: () => void; title?: string }

export default function MusicStatsModal({ open, onClose, title = '음원 상세' }: Props) {
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
            <p className="mt-1 text-sm text-teal-300">음원 상세 정보 및 통계</p>
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
          {/* 음원 상세 정보 */}
          <div className="grid gap-6 mb-6">
            {/* 기본 정보 */}
            <Card>
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="h-4 w-1.5 rounded bg-teal-300" />
                  <div className="text-sm font-semibold">음원 기본 정보</div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-white/60 mb-1">음원명</div>
                    <div className="text-white font-medium">{title}</div>
                  </div>
                  <div>
                    <div className="text-white/60 mb-1">장르</div>
                    <div className="text-white font-medium">Pop</div>
                  </div>
                  <div>
                    <div className="text-white/60 mb-1">음원 유형</div>
                    <div className="text-white font-medium">일반</div>
                  </div>
                  <div>
                    <div className="text-white/60 mb-1">재생 시간</div>
                    <div className="text-white font-medium">3분 30초</div>
                  </div>
                  <div>
                    <div className="text-white/60 mb-1">참고 가격</div>
                    <div className="text-white font-medium">음원만: 5원, 가사만: 3원, 둘다: 7원</div>
                  </div>
                  <div>
                    <div className="text-white/60 mb-1">호출당 리워드</div>
                    <div className="text-white font-medium">0.007 토큰</div>
                  </div>
                  <div>
                    <div className="text-white/60 mb-1">월 최대 한도</div>
                    <div className="text-white font-medium">1,000 토큰</div>
                  </div>
                  <div>
                    <div className="text-white/60 mb-1">등록일</div>
                    <div className="text-white font-medium">2024.01.15</div>
                  </div>
                </div>
              </div>
            </Card>

            {/* 유효재생 추이 차트 */}
            <Card>
              <div className="mb-3">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-4 w-1.5 rounded bg-teal-300" />
                    <div className="text-sm font-semibold">유효재생 추이</div>
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
              <div className="min-w-0 overflow-hidden h-64">
                <SimpleLineChart 
                  labels={timeTab === 'daily' ? [...Array(31)].map((_,i)=>`${i+1}일`) : 
                          timeTab === 'weekly' ? ['1주', '2주', '3주', '4주'] : 
                          ['1월', '2월', '3월', '4월', '5월', '6월']}
                  series={[
                    {
                      label: timeTab === 'daily' ? '일간 유효재생' : timeTab === 'weekly' ? '주간 유효재생' : '월간 유효재생',
                      data: timeTab === 'daily' ? [...Array(31)].map((_,i)=>100+i*13) :
                             timeTab === 'weekly' ? [1200, 1350, 1480, 1620] :
                             [5000, 5800, 6600, 7200, 7800, 8400]
                    },
                    {
                      label: timeTab === 'daily' ? '일간 총재생' : timeTab === 'weekly' ? '주간 총재생' : '월간 총재생',
                      data: timeTab === 'daily' ? [...Array(31)].map((_,i)=>Math.floor((100+i*13)*1.15)) :
                             timeTab === 'weekly' ? [1380, 1550, 1700, 1860] :
                             [5750, 6670, 7590, 8280, 8970, 9660]
                    }
                  ]}
                  colors={['#14b8a6', '#6b7280']}
                />
              </div>
            </Card>
          </div>


        </div>
      </div>
    </div>
  )
} 