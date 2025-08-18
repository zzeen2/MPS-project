'use client'

import { useState } from 'react'
import Card from '@/components/ui/Card'
import Title from '@/components/ui/Title'

export default function RewardsMusicsPage() {
  const [bulkMode, setBulkMode] = useState(false)
  const [applyType, setApplyType] = useState<'mul'|'add'>('mul')
  const [mulValue, setMulValue] = useState(1.2)
  const [addValue, setAddValue] = useState(0.001)
  const [schedule, setSchedule] = useState<'now'|'next'>('now')

  return (
    <div className="space-y-8">
      {/* 페이지 헤더 */}
      <div className="mb-6">
        <Title variant="section">음원별 리워드 현황</Title>
        <div className="mt-1 text-sm text-white/60">음원별 리워드 사용 현황 및 일괄 수정</div>
      </div>

      {/* 음원별 리워드 현황 */}
      <section>
        <Card>
          <div className="mb-4">
            <Title>음원별 리워드 현황</Title>
          </div>
          <div className="space-y-4">
            {Array.from({ length: 8 }).map((_, i) => {
              const name = `Track ${String.fromCharCode(65 + i)}`
              const used = 200 + i * 70
              const limit = i % 4 === 0 ? null : 1000 + i * 120
              const companies = 5 + (i % 4) * 3
              const pct = limit ? Math.min(100, Math.round((used / limit) * 100)) : null
              
              return (
                <div key={i} className="rounded-xl border border-white/8 bg-gradient-to-br from-white/5 to-white/3 p-4 hover:border-white/15 transition-all duration-200">
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-white">{name}</div>
                      <div className="mt-1 text-xs text-white/70">
                        이번 달 사용: <span className="text-teal-300 font-medium">{used.toLocaleString()}</span> 토큰
                        {limit ? (
                          <>
                            {' '} / 최대 <span className="text-white font-medium">{limit.toLocaleString()}</span> 토큰
                            {' '}(<span className="text-teal-300 font-medium">{pct}%</span>)
                          </>
                        ) : (
                          <span className="ml-2 rounded-lg bg-gradient-to-r from-teal-400/15 to-blue-400/15 px-2 py-1 text-[11px] text-teal-300 border border-teal-400/25 font-medium">무제한</span>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0 text-xs text-white/70">
                      사용 기업 <span className="text-white font-medium">{companies}</span>개
                    </div>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                    {pct !== null ? (
                      <div className="h-full bg-gradient-to-r from-teal-400 to-blue-400 rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
                    ) : (
                      <div className="h-full bg-gradient-to-r from-white/20 to-white/30 rounded-full" style={{ width: '100%' }} />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </section>

      {/* 일괄 수정 기능 */}
      <section>
        <Card>
          <div className="mb-4">
            <Title>일괄 수정</Title>
          </div>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <input placeholder="음원 검색" className="min-w-[240px] flex-1 rounded-lg bg-black/30 px-3 py-2 text-sm text-white placeholder-white/50 outline-none ring-1 ring-white/8 focus:ring-2 focus:ring-teal-400/40 border border-white/5" />
            <button 
              onClick={()=>setBulkMode(v=>!v)} 
              className={`${bulkMode? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white':'border border-white/10 bg-white/5 text-white/90 hover:bg-white/10'} rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200`}
            >
              일괄 수정 모드 {bulkMode? 'ON':'OFF'}
            </button>
          </div>

          {bulkMode && (
            <div className="rounded-lg border border-white/8 bg-white/5 p-4">
              <div className="mb-3 text-sm font-medium text-white/90">일괄 수정 옵션</div>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <div className="text-xs text-white/60 mb-2">비율 적용</div>
                  <div className="flex items-center gap-2 text-sm">
                    <label className="flex items-center gap-2">
                      <input type="radio" name="apply" checked={applyType==='mul'} onChange={()=>setApplyType('mul')} className="accent-teal-400" />
                      현재값 ×
                      <input type="number" step="0.1" min={0} value={mulValue} onChange={(e)=>setMulValue(Number(e.target.value))} className="w-20 rounded-lg bg-black/30 px-2 py-1 text-white outline-none ring-1 ring-white/8 focus:ring-2 focus:ring-teal-400/40 border border-white/5" />
                    </label>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <label className="flex items-center gap-2">
                      <input type="radio" name="apply" checked={applyType==='add'} onChange={()=>setApplyType('add')} className="accent-teal-400" />
                      현재값 +
                      <input type="number" step="0.001" min={0} value={addValue} onChange={(e)=>setAddValue(Number(e.target.value))} className="w-24 rounded-lg bg-black/30 px-2 py-1 text-white outline-none ring-1 ring-white/8 focus:ring-2 focus:ring-teal-400/40 border border-white/5" />
                    </label>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-white/60 mb-2">기간 설정</div>
                  <div className="flex gap-3 text-sm">
                    <label className="flex items-center gap-2">
                      <input type="radio" name="schedule" checked={schedule==='now'} onChange={()=>setSchedule('now')} className="accent-teal-400" /> 
                      즉시 적용
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="schedule" checked={schedule==='next'} onChange={()=>setSchedule('next')} className="accent-teal-400" /> 
                      다음 정산 주기부터
                    </label>
                  </div>
                </div>
                <div className="flex items-end justify-end">
                  <div className="space-x-2">
                    <button className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10 transition-all duration-200">미리보기</button>
                    <button className="rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 px-4 py-2 text-sm text-white font-medium hover:from-teal-600 hover:to-teal-700 transition-all duration-200">적용</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>
      </section>

      {/* 음원별 리워드 설정 테이블 */}
      <section>
        <Card>
          <div className="mb-4">
            <Title>음원별 리워드 설정</Title>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left">
                <tr className="border-b border-white/10 bg-gradient-to-r from-white/5 to-white/3">
                  <th className="px-4 py-3 text-white/70 font-medium">
                    <input type="checkbox" className="accent-teal-400 rounded" />
                  </th>
                  <th className="px-4 py-3 text-white/70 font-medium">음원명</th>
                  <th className="px-4 py-3 text-white/70 font-medium">현재 리워드/회</th>
                  <th className="px-4 py-3 text-white/70 font-medium">총 리워드 한도</th>
                  <th className="px-4 py-3 text-white/70 font-medium">사용률</th>
                  <th className="px-4 py-3 text-right text-white/70 font-medium">수정</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({length:12}).map((_,i)=> (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/3 transition-all duration-200">
                    <td className="px-4 py-3">
                      <input type="checkbox" className="accent-teal-400 rounded" />
                    </td>
                    <td className="px-4 py-3 text-white font-medium">Song {String.fromCharCode(65+i)}</td>
                    <td className="px-4 py-3 text-white/80">{(0.005 + (i%3)*0.001).toFixed(3)}토큰</td>
                    <td className="px-4 py-3 text-white/80">{i%4===0? '무제한': `${(800 + i*50).toLocaleString()}토큰`}</td>
                    <td className="px-4 py-3 text-white/80">{(10 + i*2)}%</td>
                    <td className="px-4 py-3 text-right">
                      <button className="rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 px-3 py-1.5 text-xs text-white font-medium hover:from-teal-600 hover:to-teal-700 transition-all duration-200">
                        수정
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </div>
  )
} 