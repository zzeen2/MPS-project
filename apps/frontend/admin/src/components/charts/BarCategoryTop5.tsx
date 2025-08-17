'use client'
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Chart, BarController, BarElement, LinearScale, CategoryScale, Tooltip } from 'chart.js'

Chart.register(BarController, BarElement, LinearScale, CategoryScale, Tooltip)

export default function BarCategoryTop5() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const chartRef = useRef<Chart | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    const parent = canvas.parentElement as HTMLElement

    const labels = ['검색', '재생', '리워드', '기업관리', '인증']
    const calls = [11200, 9800, 7600, 5200, 4100]
    const rewardPct = [12, 25, 48, 5, 2]

    function destroy() {
      chartRef.current?.destroy()
      chartRef.current = null
    }

    function create(width: number) {
      const w = Math.max(300, Math.floor(width)) // 안전 최소폭
      canvas.width = w
      canvas.height = 280
      const ctx = canvas.getContext('2d')!
      chartRef.current = new Chart(ctx, {
        type: 'bar',
        data: { labels, datasets: [{ label: '호출 수', data: calls, backgroundColor: 'rgba(255,255,255,0.12)', borderColor: '#ffffff', borderWidth: 1 }] },
        options: {
          responsive: false,
          animation: false,
          indexAxis: 'y',
          plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: (ctx) => `${ctx.parsed.x.toLocaleString()} 호출 · 리워드 기여율 ${rewardPct[ctx.dataIndex]}%` } },
          },
          scales: {
            x: { grid: { color: 'rgba(255,255,255,0.08)' }, ticks: { color: '#9ca3af' }, beginAtZero: true },
            y: { grid: { display: false }, ticks: { color: '#9ca3af' } },
          },
          onClick: (_, elements) => {
            if (!elements.length) return
            const idx = elements[0].index
            router.push(`/admin/analytics/category/${idx}`)
          },
        },
      })
    }

    // 최초 생성 + width 변화에 따라 재생성
    const measureAndCreate = () => {
      const width = parent.getBoundingClientRect().width || parent.clientWidth || 600
      destroy()
      create(width)
    }

    measureAndCreate()

    const ro = new ResizeObserver(() => {
      measureAndCreate()
    })
    ro.observe(parent)

    return () => {
      ro.disconnect()
      destroy()
    }
  }, [router])

  return (
    <div className="relative h-[280px] w-full overflow-hidden min-w-0">
      <canvas ref={canvasRef} className="block" />
    </div>
  )
} 