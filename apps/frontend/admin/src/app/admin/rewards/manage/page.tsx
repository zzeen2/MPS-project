'use client'

import { useState } from 'react'
import Card from '@/components/ui/Card'

export default function RewardsManagePage() {
  const [bulkMode, setBulkMode] = useState(false)
  const [applyType, setApplyType] = useState<'mul'|'add'>('mul')
  const [mulValue, setMulValue] = useState(1.2)
  const [addValue, setAddValue] = useState(0.001)
  const [schedule, setSchedule] = useState<'now'|'next'>('now')

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-center gap-2">
          <input placeholder="음원 검색" className="min-w-[240px] flex-1 rounded bg-black/40 px-3 py-2 text-sm text-white placeholder-white/40 outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-teal-400/60" />
          <button onClick={()=>setBulkMode(v=>!v)} className={`${bulkMode? 'bg-teal-600/90 text-white':'bg-white/10 text-white/90 hover:bg-white/15'} rounded px-3 py-2 text-sm`}>일괄 수정 모드 {bulkMode? 'ON':'OFF'}</button>
        </div>
      </Card>

      {bulkMode && (
        <Card>
          <div className="mb-3 text-sm font-semibold">일괄 수정 옵션</div>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <div className="text-xs text-white/60 mb-2">비율 적용</div>
              <div className="flex items-center gap-2 text-sm">
                <label className="flex items-center gap-2">
                  <input type="radio" name="apply" checked={applyType==='mul'} onChange={()=>setApplyType('mul')} />
                  현재값 ×
                  <input type="number" step="0.1" min={0} value={mulValue} onChange={(e)=>setMulValue(Number(e.target.value))} className="w-20 rounded bg-black/40 px-2 py-1 outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-teal-400/60" />배
                </label>
              </div>
              <div className="mt-2 flex items-center gap-2 text-sm">
                <label className="flex items-center gap-2">
                  <input type="radio" name="apply" checked={applyType==='add'} onChange={()=>setApplyType('add')} />
                  현재값 +
                  <input type="number" step="0.001" min={0} value={addValue} onChange={(e)=>setAddValue(Number(e.target.value))} className="w-24 rounded bg-black/40 px-2 py-1 outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-teal-400/60" />토큰
                </label>
              </div>
            </div>
            <div>
              <div className="text-xs text-white/60 mb-2">기간 설정</div>
              <div className="flex gap-3 text-sm">
                <label className="flex items-center gap-2"><input type="radio" name="schedule" checked={schedule==='now'} onChange={()=>setSchedule('now')} /> 즉시 적용</label>
                <label className="flex items-center gap-2"><input type="radio" name="schedule" checked={schedule==='next'} onChange={()=>setSchedule('next')} /> 다음 정산 주기부터</label>
              </div>
            </div>
            <div className="flex items-end justify-end">
              <div className="space-x-2">
                <button className="rounded border border-white/15 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10">미리보기</button>
                <button className="rounded bg-teal-600/90 px-3 py-2 text-sm text-white hover:bg-teal-500">적용</button>
              </div>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-white/60">
              <tr>
                <th className="py-2 pr-4"><input type="checkbox" className="accent-teal-400" /></th>
                <th className="py-2 pr-4">음원명</th>
                <th className="py-2 pr-4">현재 리워드/회</th>
                <th className="py-2 pr-4">총 리워드 한도</th>
                <th className="py-2 pr-4">사용률</th>
                <th className="py-2 pr-0 text-right">수정</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({length:12}).map((_,i)=> (
                <tr key={i} className="border-t border-white/5">
                  <td className="py-2 pr-4"><input type="checkbox" className="accent-teal-400" /></td>
                  <td className="py-2 pr-4 text-white">Song {String.fromCharCode(65+i)}</td>
                  <td className="py-2 pr-4 text-white/80">{(0.005 + (i%3)*0.001).toFixed(3)}토큰</td>
                  <td className="py-2 pr-4 text-white/80">{i%4===0? '무제한': `${(800 + i*50).toLocaleString()}토큰`}</td>
                  <td className="py-2 pr-4 text-white/80">{(10 + i*2)}%</td>
                  <td className="py-2 pr-0 text-right"><button className="rounded bg-white/10 px-2 py-1 text-xs text-white hover:bg-white/15">수정</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
} 