'use client'
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Chart, DoughnutController, ArcElement, Legend, Tooltip } from 'chart.js'

Chart.register(DoughnutController, ArcElement, Legend, Tooltip)

export default function PieTierDistribution() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const chartRef = useRef<Chart | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (!canvasRef.current) return
    const ctx = canvasRef.current.getContext('2d')!

    const labels = ['Standard (+5%)', 'Business (+3%)']
    const counts = [220, 120]

    chartRef.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [
          { data: counts, backgroundColor: ['#d1d5db', '#9ca3af'], borderColor: 'rgba(0,0,0,0.8)', borderWidth: 2 },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 12, color: '#9ca3af' } } },
        onClick: (_, elements) => {
          if (!elements.length) return
          const idx = elements[0].index
          const tier = idx === 0 ? 'standard' : 'business'
          router.push(`/admin/companies?tier=${tier}`)
        },
      },
    })

    return () => chartRef.current?.destroy()
  }, [router])

  return (
    <div className="relative h-[280px] w-full">
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center text-sm text-white/80" aria-hidden>
        전체 340개 기업
      </div>
      <canvas ref={canvasRef} className="relative z-0 h-full w-full" />
    </div>
  )
} 