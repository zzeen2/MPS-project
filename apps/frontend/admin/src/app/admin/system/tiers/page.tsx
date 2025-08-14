'use client'

import { useState } from 'react'
import Card from '@/components/ui/Card'

export default function TierManagementPage() {
  const [standardLimit, setStandardLimit] = useState(100000)
  const [businessLimit, setBusinessLimit] = useState(1000000)

  const [selectedCompany, setSelectedCompany] = useState('Company A')
  const [currentTier] = useState<'Standard'|'Business'>('Standard')
  const [newTier, setNewTier] = useState<'Standard'|'Business'>('Business')
  const [reason, setReason] = useState('')
  const [applyWhen, setApplyWhen] = useState<'now'|'next'>('now')

  return (
    <div className="space-y-6">
      <Card>
        <div className="mb-3 text-sm font-semibold">등급별 정책 설정</div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-medium text-white">Standard 등급</div>
            <div className="mt-2 text-xs text-white/70">월 최대 리워드 카운팅 한도</div>
            <div className="mt-2 flex items-center gap-2">
              <input type="number" value={standardLimit} onChange={(e)=>setStandardLimit(Number(e.target.value))} className="w-40 rounded bg-black/40 px-3 py-2 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-teal-400/60" />
              <span className="text-sm text-white/70">회</span>
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-medium text-white">Business 등급</div>
            <div className="mt-2 text-xs text-white/70">월 최대 리워드 카운팅 한도</div>
            <div className="mt-2 flex items-center gap-2">
              <input type="number" value={businessLimit} onChange={(e)=>setBusinessLimit(Number(e.target.value))} className="w-48 rounded bg-black/40 px-3 py-2 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-teal-400/60" />
              <span className="text-sm text-white/70">회</span>
            </div>
          </div>
        </div>
        <div className="mt-4 text-right">
          <button className="rounded bg-teal-600/90 px-3 py-2 text-sm text-white hover:bg-teal-500">저장</button>
        </div>
      </Card>

      <Card>
        <div className="mb-3 text-sm font-semibold">등급 수동 조정</div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <div className="text-sm text-white/80">대상 기업 선택</div>
            <div className="flex gap-2">
              <select value={selectedCompany} onChange={(e)=>setSelectedCompany(e.target.value)} className="min-w-[200px] rounded bg-black/40 px-3 py-2 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-teal-400/60">
                {['Company A','Company B','Company C','Company D'].map((c)=>(<option key={c} value={c}>{c}</option>))}
              </select>
              <input placeholder="검색" className="flex-1 rounded bg-black/40 px-3 py-2 text-sm text-white placeholder-white/40 outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-teal-400/60" />
            </div>
            <div className="text-sm text-white/80">현재 등급: <span className="text-white">{currentTier}</span></div>
            <div className="flex items-center gap-2 text-sm">
              <div className="text-white/80">변경할 등급</div>
              <select value={newTier} onChange={(e)=>setNewTier(e.target.value as any)} className="rounded bg-black/40 px-3 py-2 text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-teal-400/60">
                <option value="Standard">Standard</option>
                <option value="Business">Business</option>
              </select>
            </div>
            <div>
              <div className="text-sm text-white/80">변경 사유</div>
              <textarea value={reason} onChange={(e)=>setReason(e.target.value)} rows={3} className="mt-1 w-full rounded bg-black/40 px-3 py-2 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-teal-400/60" />
            </div>
            <div className="flex items-center gap-4 text-sm text-white/80">
              <label className="flex items-center gap-2"><input type="radio" name="applyWhen" checked={applyWhen==='now'} onChange={()=>setApplyWhen('now')} /> 즉시 적용</label>
              <label className="flex items-center gap-2"><input type="radio" name="applyWhen" checked={applyWhen==='next'} onChange={()=>setApplyWhen('next')} /> 다음 결제주기</label>
            </div>
          </div>
          <div className="flex items-end justify-end">
            <div className="space-x-2">
              <button className="rounded border border-white/15 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10">취소</button>
              <button className="rounded bg-teal-600/90 px-3 py-2 text-sm text-white hover:bg-teal-500">변경 실행</button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
} 