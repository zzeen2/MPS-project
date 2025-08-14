'use client'

import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'

export default function MusicCreatePage() {
  const router = useRouter()

  // 기본 정보
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [genre, setGenre] = useState('Pop')
  const [tags, setTags] = useState('')
  const [releaseYear, setReleaseYear] = useState<number | ''>('')
  const [durationSec, setDurationSec] = useState<number | ''>('')
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [thumbFile, setThumbFile] = useState<File | null>(null)
  const [autoThumb, setAutoThumb] = useState(true)

  // 가격/리워드
  const [priceRef, setPriceRef] = useState(7) // 원
  const [rewardPerPlay, setRewardPerPlay] = useState(0.007)
  const [rewardCap, setRewardCap] = useState<number | ''>('')
  const [usePeriod, setUsePeriod] = useState<'always' | 'period'>('always')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  // API 설정
  const [accessTier, setAccessTier] = useState<'all' | 'subscribed'>('all')
  const [limitType, setLimitType] = useState<'unlimited' | 'hour' | 'day'>('unlimited')
  const [limitValue, setLimitValue] = useState<number | ''>('')

  // 미리보기
  const previewReward1000 = useMemo(() => {
    const n = Math.max(0, Number(rewardPerPlay) || 0)
    return Math.round(n * 1000 * 1000) / 1000 // 소수 3자리
  }, [rewardPerPlay])

  function onSelectAudio(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) {
      setAudioFile(f)
      // 간단 길이 추출: 브라우저에서 가능하나, 여기선 표면만 표시
      // 실제 구현 시 WebAudio API 또는 업로드 후 서버 분석을 권장
    }
  }

  function onSelectThumb(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) setThumbFile(f)
  }

  function onCancel() {
    router.back()
  }

  function onSaveDraft() {
    alert('임시저장(더미): 나중에 API 연결')
  }

  function onSave() {
    // TODO: 업로드 → 생성 API 연동
    alert('저장(더미): 나중에 API 연결')
  }

  return (
    <div className="space-y-6 pb-24">
      {/* 기본 정보 섹션 */}
      <section className="rounded-2xl border border-white/10 bg-neutral-900/60 p-6 backdrop-blur-md">
        <h2 className="mb-4 text-sm font-semibold text-white">음원 기본 정보</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <label className="block text-xs text-white/60">음원 파일(.mp3/.wav/.flac)</label>
            <input type="file" accept=".mp3,.wav,.flac" onChange={onSelectAudio} className="w-full rounded bg-black/40 px-3 py-2 text-sm text-white ring-1 ring-white/10 file:mr-3 file:rounded file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-white hover:file:bg-white/15" />
            {audioFile && <p className="text-xs text-white/60">선택됨: {audioFile.name}</p>}
          </div>
          <div className="space-y-3">
            <label className="block text-xs text-white/60">썸네일(.jpg/.png)</label>
            <div className="flex items-center gap-3">
              <input type="file" accept=".jpg,.jpeg,.png" disabled={autoThumb} onChange={onSelectThumb} className="w-full rounded bg-black/40 px-3 py-2 text-sm text-white ring-1 ring-white/10 file:mr-3 file:rounded file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-white disabled:opacity-60" />
              <label className="flex items-center gap-2 text-xs text-white/70"><input type="checkbox" checked={autoThumb} onChange={(e)=>setAutoThumb(e.target.checked)} /> 자동 생성</label>
            </div>
            {thumbFile && !autoThumb && <p className="text-xs text-white/60">선택됨: {thumbFile.name}</p>}
          </div>
          <div className="space-y-2">
            <label className="block text-xs text-white/60">음원명(필수)</label>
            <input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="제목" className="w-full rounded bg-black/40 px-3 py-2 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-teal-400/60" />
          </div>
          <div className="space-y-2">
            <label className="block text-xs text-white/60">아티스트(선택)</label>
            <input value={artist} onChange={(e)=>setArtist(e.target.value)} placeholder="아티스트명" className="w-full rounded bg-black/40 px-3 py-2 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-teal-400/60" />
          </div>
          <div className="space-y-2">
            <label className="block text-xs text-white/60">장르</label>
            <select value={genre} onChange={(e)=>setGenre(e.target.value)} className="w-full rounded bg-black/40 px-3 py-2 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-teal-400/60">
              <option>Pop</option>
              <option>Rock</option>
              <option>Jazz</option>
              <option>HipHop</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-xs text-white/60">태그(쉼표로 구분)</label>
            <input value={tags} onChange={(e)=>setTags(e.target.value)} placeholder="#차분한, #릴렉스" className="w-full rounded bg-black/40 px-3 py-2 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-teal-400/60" />
          </div>
          <div className="space-y-2">
            <label className="block text-xs text-white/60">발매년도</label>
            <input value={releaseYear} onChange={(e)=>setReleaseYear(e.target.value ? Number(e.target.value) : '')} type="number" placeholder="2024" className="w-full rounded bg-black/40 px-3 py-2 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-teal-400/60" />
          </div>
          <div className="space-y-2">
            <label className="block text-xs text-white/60">재생 시간(초) — 자동 감지 후 수정 가능</label>
            <input value={durationSec} onChange={(e)=>setDurationSec(e.target.value ? Number(e.target.value) : '')} type="number" placeholder="180" className="w-full rounded bg-black/40 px-3 py-2 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-teal-400/60" />
          </div>
        </div>
      </section>

      {/* 가격 및 리워드 설정 */}
      <section className="rounded-2xl border border-white/10 bg-neutral-900/60 p-6 backdrop-blur-md">
        <h2 className="mb-4 text-sm font-semibold text-white">가격 및 리워드 설정</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-xs text-white/60">참고 가격(원)</label>
            <div className="flex items-center gap-2">
              <button type="button" onClick={()=>setPriceRef(7)} className="rounded bg-teal-600/90 px-3 py-1.5 text-xs text-white hover:bg-teal-500">기본값 7원</button>
              <input value={priceRef} onChange={(e)=>setPriceRef(Number(e.target.value)||0)} type="number" className="w-32 rounded bg-black/40 px-3 py-2 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-teal-400/60" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-xs text-white/60">1회 재생당 리워드(토큰)</label>
            <input value={rewardPerPlay} onChange={(e)=>setRewardPerPlay(Number(e.target.value)||0)} type="number" step="0.001" className="w-40 rounded bg-black/40 px-3 py-2 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-teal-400/60" />
          </div>
          <div className="space-y-2">
            <label className="block text-xs text-white/60">최대 리워드 총량(토큰, 옵션)</label>
            <input value={rewardCap} onChange={(e)=>setRewardCap(e.target.value ? Number(e.target.value) : '')} type="number" className="w-48 rounded bg-black/40 px-3 py-2 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-teal-400/60" />
          </div>
          <div className="space-y-2">
            <label className="block text-xs text-white/60">리워드 활성 기간</label>
            <div className="flex items-center gap-3 text-sm text-white/80">
              <label className="flex items-center gap-2"><input type="radio" checked={usePeriod==='always'} onChange={()=>setUsePeriod('always')} /> 항상</label>
              <label className="flex items-center gap-2"><input type="radio" checked={usePeriod==='period'} onChange={()=>setUsePeriod('period')} /> 기간 설정</label>
            </div>
            {usePeriod==='period' && (
              <div className="flex gap-2">
                <input type="date" value={fromDate} onChange={(e)=>setFromDate(e.target.value)} className="rounded bg-black/40 px-3 py-2 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-teal-400/60" />
                <span className="self-center text-white/60">~</span>
                <input type="date" value={toDate} onChange={(e)=>setToDate(e.target.value)} className="rounded bg-black/40 px-3 py-2 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-teal-400/60" />
              </div>
            )}
          </div>
        </div>
        <div className="mt-4 rounded border border-white/10 bg-black/30 p-3 text-sm text-white/80">
          미리보기: 이 음원 1000회 재생 시 <span className="text-teal-300">{previewReward1000}</span> 토큰 지급 예상
        </div>
      </section>

      {/* API 설정 섹션 */}
      <section className="rounded-2xl border border-white/10 bg-neutral-900/60 p-6 backdrop-blur-md">
        <h2 className="mb-4 text-sm font-semibold text-white">API 엔드포인트 설정</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-xs text-white/60">엔드포인트 URL</label>
            <input value="/api/music/{music_id}/play" readOnly className="w-full cursor-not-allowed rounded bg-black/30 px-3 py-2 text-sm text-white outline-none ring-1 ring-white/10" />
          </div>
          <div className="space-y-2">
            <label className="block text-xs text-white/60">API 키 권한</label>
            <select value={accessTier} onChange={(e)=>setAccessTier(e.target.value as any)} className="w-full rounded bg-black/40 px-3 py-2 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-teal-400/60">
              <option value="all">모든 기업(무료)</option>
              <option value="subscribed">구독 기업만</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-xs text-white/60">사용 제한</label>
            <div className="flex items-center gap-3 text-sm text-white/80">
              <label className="flex items-center gap-2"><input type="radio" checked={limitType==='unlimited'} onChange={()=>setLimitType('unlimited')} /> 무제한</label>
              <label className="flex items-center gap-2"><input type="radio" checked={limitType==='hour'} onChange={()=>setLimitType('hour')} /> 시간당</label>
              <label className="flex items-center gap-2"><input type="radio" checked={limitType==='day'} onChange={()=>setLimitType('day')} /> 일일</label>
              {(limitType==='hour' || limitType==='day') && (
                <input value={limitValue} onChange={(e)=>setLimitValue(e.target.value ? Number(e.target.value) : '')} type="number" placeholder="횟수" className="w-28 rounded bg-black/40 px-3 py-2 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-teal-400/60" />
              )}
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-xs text-white/60">테스트</label>
            <button type="button" onClick={()=>alert('API 테스트(더미)')} className="rounded bg-teal-600/90 px-3 py-2 text-sm text-white hover:bg-teal-500">API 테스트 실행</button>
          </div>
        </div>
      </section>

      {/* 액션 푸터 */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-neutral-900/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1400px] items-center justify-end gap-2 px-6 py-3">
          <button onClick={onCancel} className="rounded border border-white/15 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10">취소</button>
          <button onClick={onSaveDraft} className="rounded bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/15">임시저장</button>
          <button onClick={onSave} className="rounded bg-teal-600/90 px-3 py-2 text-sm text-white hover:bg-teal-500">저장</button>
        </div>
      </div>
    </div>
  )
} 