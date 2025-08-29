'use client'
import { useState } from 'react'
import SimpleLineChart from '@/components/charts/SimpleLineChart'
import Card from '@/components/ui/Card'

type Props = { 
  open: boolean; 
  onClose: () => void; 
  title?: string;
  musicData?: {
    id?: string;
    title: string;
    artist: string;
    album?: string;
    category?: string;
    genre: string;
    tags: string;
    releaseYear: number;
    durationSec: number;
    musicType?: '일반' | 'Inst' | '가사만';
    priceMusicOnly?: number;
    priceLyricsOnly?: number;
    priceBoth?: number;
    rewardPerPlay?: number;
    maxPlayCount?: number;
    accessTier?: 'all' | 'subscribed';
    lyricist?: string;
    composer?: string;
    arranger?: string;
    isrc?: string;
    coverImageUrl?: string;
    createdAt?: string;
  }
}

export default function MusicStatsModal({ open, onClose, title = '음원 상세', musicData }: Props) {
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
                  <div className="text-lg font-semibold">음원 기본 정보</div>
                </div>
                <div className="flex gap-8 items-start">
                  {/* 음원 커버 이미지 */}
                  <div className="flex-shrink-0">
                    <div className="w-64 h-64 rounded-lg border border-white/10 overflow-hidden bg-white/5">
                      {musicData?.coverImageUrl ? (
                        <img 
                          src={musicData.coverImageUrl} 
                          alt={`${musicData.title} 커버`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            if (target.nextElementSibling) {
                              target.nextElementSibling.classList.remove('hidden');
                            }
                          }}
                        />
                      ) : null}
                      <div className={`w-full h-full flex items-center justify-center ${musicData?.coverImageUrl ? 'hidden' : ''}`}>
                        <div className="text-center">
                          <svg className="w-20 h-20 mx-auto text-white/30 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                          </svg>
                          <div className="text-xs text-white/40">음원 커버</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* 음원 정보 */}
                  <div className="flex-1 min-w-0 pt-1">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-white/60 mb-1">음원명</div>
                        <div className="text-white font-medium">{musicData?.title || title}</div>
                      </div>
                      <div>
                        <div className="text-white/60 mb-1">아티스트</div>
                        <div className="text-white font-medium">{musicData?.artist || 'Unknown'}</div>
                      </div>
                      <div>
                        <div className="text-white/60 mb-1">앨범</div>
                        <div className="text-white font-medium">{musicData?.album || '-'}</div>
                      </div>
                      <div>
                        <div className="text-white/60 mb-1">장르</div>
                        <div className="text-white font-medium">{musicData?.genre || 'Pop'}</div>
                      </div>
                      <div>
                        <div className="text-white/60 mb-1">카테고리</div>
                        <div className="text-white font-medium">{musicData?.category || '-'}</div>
                      </div>
                      <div>
                        <div className="text-white/60 mb-1">음원 유형</div>
                        <div className="text-white font-medium">{musicData?.musicType || '일반'}</div>
                      </div>
                      <div>
                        <div className="text-white/60 mb-1">재생 시간</div>
                        <div className="text-white font-medium">
                          {musicData?.durationSec ? 
                            `${Math.floor(musicData.durationSec / 60)}분 ${musicData.durationSec % 60}초` : 
                            '3분 30초'
                          }
                        </div>
                      </div>
                      <div>
                        <div className="text-white/60 mb-1">발매년도</div>
                        <div className="text-white font-medium">{musicData?.releaseYear || '2024'}</div>
                      </div>
                      <div>
                        <div className="text-white/60 mb-1">ISRC</div>
                        <div className="text-white font-medium font-mono text-xs">{musicData?.isrc || '-'}</div>
                      </div>
                      <div>
                        <div className="text-white/60 mb-1">작사자</div>
                        <div className="text-white font-medium">{musicData?.lyricist || '-'}</div>
                      </div>
                      <div>
                        <div className="text-white/60 mb-1">작곡자</div>
                        <div className="text-white font-medium">{musicData?.composer || '-'}</div>
                      </div>
                      <div>
                        <div className="text-white/60 mb-1">편곡자</div>
                        <div className="text-white font-medium">{musicData?.arranger || '-'}</div>
                      </div>
                      <div>
                        <div className="text-white/60 mb-1">참고가격(음원, 가사, 음원+가사)</div>
                        <div className="text-white font-medium text-xs">
                          {musicData?.priceMusicOnly || 5}원, {musicData?.priceLyricsOnly || 3}원, {musicData?.priceBoth || 7}원
                        </div>
                      </div>
                      <div>
                        <div className="text-white/60 mb-1">호출당 리워드</div>
                        <div className="text-white font-medium">{musicData?.rewardPerPlay ? `${musicData.rewardPerPlay} 토큰` : '0.007 토큰'}</div>
                      </div>
                      <div>
                        <div className="text-white/60 mb-1">월 최대 한도</div>
                        <div className="text-white font-medium">{musicData?.maxPlayCount ? `${musicData.maxPlayCount.toLocaleString()} 토큰` : '1,000 토큰'}</div>
                      </div>
                      <div>
                        <div className="text-white/60 mb-1">API 접근 권한</div>
                        <div className="text-white font-medium">
                          {musicData?.accessTier === 'all' ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30">
                              모든 기업
                            </span>
                          ) : (
                            <div className="flex gap-1">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                Business
                              </span>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                Standard
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-white/60 mb-1">등록일</div>
                        <div className="text-white font-medium">{musicData?.createdAt || '2024.01.15'}</div>
                      </div>
                    </div>
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
                    <div className="text-lg font-semibold">유효재생 추이</div>
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