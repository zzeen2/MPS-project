'use client'

import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import DashboardHeader from '@/components/layout/DashboardHeader'
import CompanyTotalCard from '@/components/cards/CompanyTotalCard'
import TrackTotalCard from '@/components/cards/TrackTotalCard'
import MonthlyPlaysCard from '@/components/cards/MonthlyPlaysCard'
import MonthlyRevenueCard from '@/components/cards/MonthlyRevenueCard'
import RewardsStatusCard from '@/components/cards/RewardsStatusCard'
import RenewalRateCard from '@/components/cards/RenewalRateCard'
import Card from '@/components/ui/Card'
import Title from '@/components/ui/Title'
import SimpleLineChart from '@/components/charts/SimpleLineChart'
import DetailedLineChart from '@/components/charts/DetailedLineChart'
import BarCategoryTop5 from '@/components/charts/BarCategoryTop5'
import PieTierDistribution from '@/components/charts/PieTierDistribution'

type HourlyData = {
  hour: string
  free: { total: number; valid: number; lyrics: number }
  standard: { total: number; valid: number; lyrics: number }
  business: { total: number; valid: number; lyrics: number }
  prevAvg: number
}

export default function DashboardPage() {
  const [hourlyData, setHourlyData] = useState<HourlyData[]>([])
  const [hourlyLoading, setHourlyLoading] = useState(false)
  const [hourlyError, setHourlyError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [topTracks, setTopTracks] = useState<Array<{ rank: number; validPlays: number; totalPlays: number }>>(
    Array.from({ length: 10 }, (_, i) => ({ rank: i + 1, validPlays: 0, totalPlays: 0 }))
  )
  const [realtimeApiStatus, setRealtimeApiStatus] = useState<Array<{ 
    id: number;
    status: string; 
    endpoint: string; 
    callType: string;
    validity: string;
    company: string; 
    timestamp: string;
    musicTitle?: string;
    musicId?: number;
  }>>([])
  const [musicTitleById, setMusicTitleById] = useState<Record<number, string>>({})
  const [apiStatusFilter, setApiStatusFilter] = useState<'all' | 'music' | 'lyrics'>('all')
  const [realtimeTopTracks, setRealtimeTopTracks] = useState<Array<{ 
    id: number;
    rank: number; 
    title: string; 
    validPlays: number; 
  }>>([])
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [httpPollingInterval, setHttpPollingInterval] = useState<NodeJS.Timeout | null>(null)

  const startHttpPolling = () => {
    if (httpPollingInterval) return
    const interval = setInterval(async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000'
        const response = await fetch(`${baseUrl}/admin/dashboard/realtime`)
        if (response.ok) {
          const data = await response.json()
          const parsed = (data.apiCalls || []).map((item: any) => {
            const endpoint = item.endpoint || '/api/unknown'
            const m = (endpoint as string).match(/musics\/(\d+)/)
            const midFromEndpoint = m ? Number(m[1]) : undefined
            const midFromPayload = (item.musicId ?? item.music_id) !== undefined ? Number(item.musicId ?? item.music_id) : undefined
            const mid = midFromPayload ?? midFromEndpoint
            return ({
              id: item.id || Math.random(),
              status: item.status || 'error',
              endpoint,
              callType: item.callType || (endpoint.includes('lyrics') ? '가사 호출' : '음원 호출'),
              validity: item.validity || '유효재생',
              company: item.company || 'Unknown',
              musicTitle: item.musicTitle || item.music_title || item.trackTitle || item.title || undefined,
              musicId: mid,
              timestamp: (() => {
                if (item.timestamp && !isNaN(new Date(item.timestamp).getTime())) {
                  return new Date(item.timestamp).toLocaleString('ko-KR', {
                    year: '2-digit',
                    month: '2-digit',
                    day: '2-digit', 
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false,
                    timeZone: 'Asia/Seoul'
                  }).replace(/\./g, '-').replace(/- /g, ' ').replace(/(\d{2}) (\d{2}) (\d{2})/, '$1-$2-$3').trim()
                } else {
                  return new Date().toLocaleString('ko-KR', {
                    year: '2-digit',
                    month: '2-digit',
                    day: '2-digit', 
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false,
                    timeZone: 'Asia/Seoul'
                  }).replace(/\./g, '-').replace(/- /g, ' ').replace(/(\d{2}) (\d{2}) (\d{2})/, '$1-$2-$3').trim()
                }
              })()
            })
          })
          setRealtimeApiStatus(parsed)
          setRealtimeTopTracks(data.topTracks || [])
        }
      } catch (error) {
        // HTTP 폴링 에러 무시
      }
    }, 5000)
    setHttpPollingInterval(interval)
  }

  // WebSocket 연결
  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'
    const wsUrl = baseUrl.replace(/^https?:\/\//, 'wss://').replace(/^http:\/\//, 'ws://')
    const newSocket = io(wsUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    })

    newSocket.on('connect', () => {
      console.log('웹소켓 연결됨')
      setIsConnected(true)
      // 연결 시 실시간 데이터 구독
      newSocket.emit('subscribe-realtime')
    })

    newSocket.on('disconnect', () => {
      console.log('웹소켓 연결 해제됨')
      setIsConnected(false)
    })

    newSocket.on('realtime-update', (data) => {
      const parsed = (data.apiCalls || []).map((item: any) => {
        const endpoint: string = item.endpoint || ''
        const m = endpoint.match(/musics\/(\d+)/)
        const midFromEndpoint = m ? Number(m[1]) : undefined
        const midFromPayload = (item.musicId ?? item.music_id) !== undefined ? Number(item.musicId ?? item.music_id) : undefined
        const mid = midFromPayload ?? midFromEndpoint
        return {
          id: item.id || Math.random(),
          status: item.status || 'error',
          endpoint,
          callType: item.callType || (endpoint.includes('lyrics') ? '가사 호출' : '음원 호출'),
          validity: item.validity || '유효재생',
          company: item.company || 'Unknown',
          timestamp: item.timestamp || new Date().toISOString(),
          musicTitle: item.musicTitle || item.music_title || item.trackTitle || item.title || undefined,
          musicId: mid,
        }
      })
      setRealtimeApiStatus(parsed)
      setRealtimeTopTracks(data.topTracks || [])
      
      // 마지막 업데이트 시간 업데이트
      const now = new Date()
      const s = now.toLocaleString('ko-KR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Asia/Seoul'
      })
      setLastUpdated(s)
    })

    newSocket.on('realtime-error', (error) => {
      console.error('실시간 데이터 오류:', error)
    })

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket 연결 에러:', error)
      setIsConnected(false)
      // WebSocket 연결 실패 시 HTTP 폴링으로 fallback
      setTimeout(() => {
        startHttpPolling()
      }, 1000)
    })

    newSocket.on('reconnect', (attemptNumber) => {
      console.log('WebSocket 재연결됨:', attemptNumber)
      setIsConnected(true)
    })

    newSocket.on('reconnect_error', (error) => {
      console.error('WebSocket 재연결 실패:', error)
      setIsConnected(false)
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
      if (httpPollingInterval) {
        clearInterval(httpPollingInterval)
        setHttpPollingInterval(null)
      }
    }
  }, [])

  useEffect(() => {
    // 마지막 업데이트 시간
    const updateTime = () => {
      const now = new Date()
      const s = now.toLocaleString('ko-KR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Asia/Seoul'
      })
      setLastUpdated(s)
    }
    const fetchHourly = async () => {
      try {
        setHourlyLoading(true)
        setHourlyError(null)
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'
        console.log('Environment check:', {
          NODE_ENV: process.env.NODE_ENV,
          NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
          baseUrl: baseUrl,
          fullUrl: `${baseUrl}/admin/companies/stats/hourly-plays`
        })
        const res = await fetch(`${baseUrl}/admin/companies/stats/hourly-plays`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const j = await res.json()
        const data = (j.labels || []).map((label: string, i: number) => ({
          hour: label,
          free: j.free?.[i] ?? { total: 0, valid: 0, lyrics: 0 },
          standard: j.standard?.[i] ?? { total: 0, valid: 0, lyrics: 0 },
          business: j.business?.[i] ?? { total: 0, valid: 0, lyrics: 0 },
          prevAvg: j.prevAvg?.[i] ?? 0,
        }))
        setHourlyData(data)
      } catch (e: any) {
        setHourlyError(e.message || '조회 실패')
        setHourlyData([])
      } finally {
        setHourlyLoading(false)
      }
    }

    const fetchRealtimeData = async () => {
      // WebSocket이 연결되지 않은 경우에만 HTTP API 사용
      if (!isConnected) {
        try {
          console.log('⚠️ WebSocket 연결되지 않음, HTTP API로 실시간 데이터 조회...')
          const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000'
          
          const [apiRes, tracksRes] = await Promise.all([
            fetch(`${baseUrl}/admin/musics/realtime/api-status`),
            fetch(`${baseUrl}/admin/musics/realtime/top-tracks`)
          ])
          
          console.log('API responses:', {
            apiStatus: apiRes.status,
            topTracks: tracksRes.status
          })
          
          if (apiRes.ok) {
            const apiData = await apiRes.json()
            const items = (apiData.items || []).map((item: any) => {
              const endpoint = item.endpoint || '/api/unknown'
              const m = (endpoint as string).match(/musics\/(\d+)/)
              const midFromEndpoint = m ? Number(m[1]) : undefined
              const midFromPayload = (item.musicId ?? item.music_id) !== undefined ? Number(item.musicId ?? item.music_id) : undefined
              const mid = midFromPayload ?? midFromEndpoint
              return ({
                id: item.id || Math.random(),
                status: item.status || 'error',
                endpoint,
                callType: item.callType || (endpoint.includes('lyrics') ? '가사 호출' : '음원 호출'),
                validity: item.validity || '유효재생',
                company: item.company || 'Unknown',
                musicTitle: item.musicTitle || item.music_title || item.trackTitle || item.title || undefined,
                musicId: mid,
                timestamp: (() => {
                  if (item.timestamp && !isNaN(new Date(item.timestamp).getTime())) {
                    return new Date(item.timestamp).toLocaleString('ko-KR', {
                      year: '2-digit',
                      month: '2-digit',
                      day: '2-digit', 
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: false,
                      timeZone: 'Asia/Seoul'
                    }).replace(/\./g, '-').replace(/- /g, ' ').replace(/(\d{2}) (\d{2}) (\d{2})/, '$1-$2-$3').trim()
                  } else {
                    return new Date().toLocaleString('ko-KR', {
                      year: '2-digit',
                      month: '2-digit',
                      day: '2-digit', 
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: false,
                      timeZone: 'Asia/Seoul'
                    }).replace(/\./g, '-').replace(/- /g, ' ').replace(/(\d{2}) (\d{2}) (\d{2})/, '$1-$2-$3').trim()
                  }
                })()
              })
            })
            setRealtimeApiStatus(items)
          } else {
            console.error(apiRes.status, await apiRes.text())
          }
          
          if (tracksRes.ok) {
            const tracksData = await tracksRes.json()
            console.log('Top Tracks Data:', tracksData)
            setRealtimeTopTracks(tracksData.items || [])
          } else {
            console.error('Top Tracks failed:', tracksRes.status)
          }
          
        } catch (e) {
          console.error('실시간 데이터 조회 실패:', e)
        }
      }
    }

    fetchHourly()
    updateTime()
    fetchRealtimeData() // 초기 실시간 데이터 로드

    const interval = setInterval(() => {
      fetchHourly()
      updateTime()
      fetchRealtimeData() // 주기적으로 실시간 데이터 업데이트
    }, 30000) // 30초마다 시간 업데이트

    return () => clearInterval(interval)
  }, [isConnected]) // isConnected 상태 변경 시 재실행

  // 음원 제목 보강: payload에 제목이 없고 musicId만 있을 때 서버에서 조회해 메모리에 캐시
  useEffect(() => {
    const fetchMissingTitles = async () => {
      try {
        const ids = Array.from(new Set(
          (realtimeApiStatus || [])
            .map(i => i.musicId)
            .filter((v): v is number => typeof v === 'number' && v > 0)
        ))
        const missing = ids.filter(id => !musicTitleById[id])
        if (missing.length === 0) return
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000'
        const results = await Promise.allSettled(
          missing.map(id => fetch(`${baseUrl}/admin/musics/${id}`).then(r => r.ok ? r.json() : null))
        )
        const next: Record<number, string> = { ...musicTitleById }
        results.forEach((res, idx) => {
          const id = missing[idx]
          if (res.status === 'fulfilled' && res.value && res.value.title) {
            next[id] = res.value.title
          }
        })
        setMusicTitleById(next)
      } catch (e) {
        // ignore
      }
    }
    fetchMissingTitles()
  }, [realtimeApiStatus])

  const formatKST = (ts: string) => {
    try {
      const d = new Date(ts)
      if (isNaN(d.getTime())) return ts
      return d.toLocaleString('ko-KR', {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: 'Asia/Seoul'
      })
    } catch {
      return ts
    }
  }

  return (
    <div className="w-full px-6 py-6">
      <DashboardHeader 
        title="MPS - Music Performance Statistics" 
        subtitle="메인 대시보드"
        lastUpdated={lastUpdated}
      />

      <section className="mb-8">
        <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
          <TrackTotalCard />
          <CompanyTotalCard />
          <MonthlyPlaysCard />
          <MonthlyRevenueCard />
          <RewardsStatusCard />
          <RenewalRateCard />
        </div>
      </section>

      <section className="mb-8">
        <Title variant="section" className="mb-4">차트 분석</Title>
        <div className="grid gap-5 [grid-template-columns:1.5fr_1fr_0.8fr] max-[1200px]:grid-cols-2 max-md:grid-cols-1">
          <Card>
            <Title variant="card" className="mb-4">24시간 API 호출 현황 (전체 재생+가사 호출)</Title>
            <div className="h-80">
              <DetailedLineChart 
                data={hourlyData}
                colors={['#10b981', '#8b5cf6', '#3b82f6']}
              />
            </div>
          </Card>
          <Card>
            <Title variant="card" className="mb-4">등급별 기업 분포</Title>
            <div className="h-80">
              <PieTierDistribution />
            </div>
          </Card>
          <Card>
            <Title variant="card" className="mb-4">카테고리 Top5 유효재생</Title>
            <div className="h-80">
              <BarCategoryTop5 />
            </div>
          </Card>
        </div>
      </section>

      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <Title variant="section">실시간 모니터링</Title>
        </div>
        <div className="grid gap-5 [grid-template-columns:2fr_1fr] max-[1200px]:grid-cols-1">
          {/* 실시간 API 호출 */}
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <Title variant="card">실시간 API 호출</Title>
              <div className="flex gap-2">
                <button
                  onClick={() => setApiStatusFilter('all')}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    apiStatusFilter === 'all' 
                      ? 'bg-teal-500 text-white' 
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
                >
                  전체
                </button>
                <button
                  onClick={() => setApiStatusFilter('music')}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    apiStatusFilter === 'music' 
                      ? 'bg-teal-500 text-white' 
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
                >
                  음원 호출
                </button>
                <button
                  onClick={() => setApiStatusFilter('lyrics')}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    apiStatusFilter === 'lyrics' 
                      ? 'bg-teal-500 text-white' 
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
                >
                  가사 호출
                </button>
              </div>
            </div>
            <div className="overflow-x-auto min-h-96">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-center py-2 px-3 text-xs font-medium text-white/60">ID</th>
                    <th className="text-center py-2 px-3 text-xs font-medium text-white/60">유효재생</th>
                    <th className="text-center py-2 px-3 text-xs font-medium text-white/60">유형</th>
                    <th className="text-center py-2 px-3 text-xs font-medium text-white/60">음원</th>
                    <th className="text-center py-2 px-3 text-xs font-medium text-white/60">기업</th>
                    <th className="text-center py-2 px-3 text-xs font-medium text-white/60">시간</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {(() => {
                    return realtimeApiStatus.length > 0 ? (
                      realtimeApiStatus
                        .filter(item => {
                          if (apiStatusFilter === 'all') return true
                          if (apiStatusFilter === 'music') return item.callType === '음원 호출'
                          if (apiStatusFilter === 'lyrics') return item.callType === '가사 호출'
                          return true
                        })
                        .map((item, idx) => (
                      <tr key={idx} className="border-b border-white/5">
                        <td className="py-2 px-3 text-white/60 font-mono text-xs text-center">{item.id}</td>
                        <td className="py-2 px-3 text-center">
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                            item.status === 'success' 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {item.status === 'success' ? 'O' : 'X'}
                          </div>
                        </td>
                        <td className="py-2 px-3 text-white/80 text-center">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            item.callType === '음원 호출' 
                              ? 'bg-blue-500/20 text-blue-400' 
                              : 'bg-purple-500/20 text-purple-400'
                          }`}>
                            {item.callType === '음원 호출' ? '음원' : '가사'}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-white/80 text-center max-w-[260px]">
                          <span title={item.musicTitle || (item.musicId ? (musicTitleById[item.musicId] || `#${item.musicId}`) : '')} className="inline-block truncate align-top max-w-[240px]">
                            {item.musicTitle || (item.musicId ? (musicTitleById[item.musicId] || `#${item.musicId}`) : '-')}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-white/60 text-center">{item.company}</td>
                        <td className="py-2 px-3 text-white/40 text-center font-mono text-xs">{formatKST(item.timestamp)}</td>
                      </tr>
                        ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-4 px-3 text-center text-white/40">데이터를 불러오는 중...</td>
                      </tr>
                    )
                  })()}
                </tbody>
              </table>
            </div>
          </Card>

          {/* 인기 음원 TOP 10 */}
          <Card>
            <div className="mb-4">
              <Title variant="card">인기 음원 TOP 10</Title>
            </div>
            <div className="overflow-x-auto min-h-96">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-center py-2 px-3 text-xs font-medium text-white/60">순위</th>
                    <th className="text-center py-2 px-3 text-xs font-medium text-white/60">음원명</th>
                    <th className="text-center py-2 px-3 text-xs font-medium text-white/60">24시 유효재생</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {realtimeTopTracks.length > 0 ? (
                    realtimeTopTracks.map(({ rank, title, validPlays }) => (
                      <tr key={rank} className="border-b border-white/5">
                        <td className={`py-2 px-3 font-medium text-center ${rank <= 3 ? 'text-teal-300' : 'text-white/60'}`}>{rank}</td>
                        <td className="py-2 px-3 text-white/80 text-center">{title}</td>
                        <td className="py-2 px-3 text-white/60 text-center">{validPlays.toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="py-4 px-3 text-center text-white/40">데이터를 불러오는 중...</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

        </div>
      </section>

    </div>
  )
}