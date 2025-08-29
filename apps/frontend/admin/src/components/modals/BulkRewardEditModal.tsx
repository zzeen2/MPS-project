'use client'
import { useState } from 'react'

type Music = {
  id: string
  title: string
  category: string
  rewardPerPlay: number
  monthlyLimit: number | null
  maxPlayCount: number | null
  status: 'active' | 'inactive'
}

interface BulkRewardEditModalProps {
  open: boolean
  onClose: () => void
  selectedMusics: Music[]
}

export default function BulkRewardEditModal({ open, onClose, selectedMusics }: BulkRewardEditModalProps) {
  const [rewardPercentage, setRewardPercentage] = useState<number | ''>('')
  const [limitPercentage, setLimitPercentage] = useState<number | ''>('')
  const [isLoading, setIsLoading] = useState(false)

  if (!open || selectedMusics.length === 0) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // TODO: API 호출로 일괄 수정
    console.log('일괄 리워드 수정:', { 
      musicIds: selectedMusics.map(m => m.id),
      rewardPercentage,
      limitPercentage
    })
    
    // 임시 딜레이
    setTimeout(() => {
      setIsLoading(false)
      onClose()
    }, 1000)
  }

  const calculateNewReward = (currentReward: number) => {
    if (!rewardPercentage) return currentReward
    return currentReward * (1 + rewardPercentage / 100)
  }

  const calculateNewLimit = (currentLimit: number | null) => {
    if (!limitPercentage || !currentLimit) return currentLimit
    return Math.round(currentLimit * (1 + limitPercentage / 100))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* 모달 */}
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-white/10 rounded-xl shadow-2xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-white">일괄 리워드 수정</h2>
            <span className="text-sm text-teal-300 bg-teal-400/10 px-2 py-1 rounded-full">
              {selectedMusics.length}개 선택됨
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 내용 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 선택된 음원 목록 */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-white/80">선택된 음원</h3>
            <div className="h-64 overflow-y-auto space-y-2">
              {selectedMusics.length > 0 ? (
                selectedMusics.map((music) => (
                  <div key={music.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-blue-500 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-white">{music.title}</div>
                      <div className="text-xs text-white/60">
                        현재: {music.rewardPerPlay.toFixed(3)} 토큰
                        {music.monthlyLimit && ` / ${music.monthlyLimit.toLocaleString()}회`}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-white/40">
                  <svg className="w-12 h-12 mx-auto mb-3 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                  <p className="text-sm">음원을 선택해주세요</p>
                </div>
              )}
            </div>
          </div>

          {/* 수정 설정 */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* 호출당 리워드 수정 */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  호출당 리워드 조정 (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={rewardPercentage}
                    onChange={(e) => setRewardPercentage(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-teal-400/50 transition-colors text-sm"
                    placeholder="예: 10 (10% 증가)"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 text-sm">
                    %
                  </div>
                </div>
                <p className="text-xs text-white/50 mt-1">
                  양수: 증가, 음수: 감소 (예: 10 = 10% 증가, -5 = 5% 감소)
                </p>
              </div>

              {/* 리워드 미리보기 */}
              {rewardPercentage && (
                <div className="p-4 bg-gradient-to-r from-teal-400/10 to-blue-400/10 border border-teal-400/20 rounded-lg">
                  <h4 className="text-sm font-medium text-teal-300 mb-2">리워드 변경 미리보기</h4>
                  <div className="space-y-2 text-sm">
                    {selectedMusics.slice(0, 3).map((music) => (
                      <div key={music.id} className="flex justify-between">
                        <span className="text-white/70 truncate">{music.title}</span>
                        <span className="text-white font-medium">
                          {music.rewardPerPlay.toFixed(3)} → {calculateNewReward(music.rewardPerPlay).toFixed(3)}
                        </span>
                      </div>
                    ))}
                    {selectedMusics.length > 3 && (
                      <div className="text-xs text-white/50 text-center">
                        ... 외 {selectedMusics.length - 3}개 음원
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 월 한도 수정 */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  월 한도 조정 (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={limitPercentage}
                    onChange={(e) => setLimitPercentage(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-teal-400/50 transition-colors text-sm"
                    placeholder="예: 20 (20% 증가)"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 text-sm">
                    %
                  </div>
                </div>
                <p className="text-xs text-white/50 mt-1">
                  양수: 증가, 음수: 감소 (무제한 음원은 제외)
                </p>
              </div>

              {/* 한도 미리보기 */}
              {limitPercentage && (
                <div className="p-4 bg-gradient-to-r from-teal-400/10 to-blue-400/10 border border-teal-400/20 rounded-lg">
                  <h4 className="text-sm font-medium text-teal-300 mb-2">한도 변경 미리보기</h4>
                  <div className="space-y-2 text-sm">
                    {selectedMusics.filter(m => m.monthlyLimit).slice(0, 3).map((music) => (
                      <div key={music.id} className="flex justify-between">
                        <span className="text-white/70 truncate">{music.title}</span>
                        <span className="text-white font-medium">
                          {music.monthlyLimit?.toLocaleString()} → {calculateNewLimit(music.monthlyLimit)?.toLocaleString()}
                        </span>
                      </div>
                    ))}
                    {selectedMusics.filter(m => m.monthlyLimit).length === 0 && (
                      <div className="text-xs text-white/50 text-center">
                        한도가 설정된 음원이 없습니다
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-xs font-medium text-white/70 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isLoading || (!rewardPercentage && !limitPercentage)}
              className="px-3 py-2 text-xs font-medium text-white bg-teal-500/90 rounded-lg hover:bg-teal-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  수정 중...
                </div>
              ) : (
                '일괄 수정'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 