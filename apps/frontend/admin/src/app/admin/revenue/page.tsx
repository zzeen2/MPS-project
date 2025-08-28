'use client'

import { useEffect, useState } from 'react'
import Card from '@/components/ui/Card'
import Title from '@/components/ui/Title'
import SimpleLineChart from '@/components/charts/SimpleLineChart'
import BarCategoryTop5 from '@/components/charts/BarCategoryTop5'
import PieTierDistribution from '@/components/charts/PieTierDistribution'

export default function RevenueDashboardPage() {
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [company, setCompany] = useState<'전체'|'Company A'|'Company B'|'Company C'|'Company D'>('전체')
  const [lifecycleFilter, setLifecycleFilter] = useState<'전체'|'1월'|'2월'|'3월'|'4월'|'5월'|'6월'|'7월'|'8월'|'9월'|'10월'|'11월'|'12월'>('전체')

  // KPI 데이터
  const kpis = [
    { 
      title: '이번 달 총 매출', 
      value: '₩12,345,678', 
      change: '+15.3%', 
      detail: '전월: ₩10,714,286'
    },
    { 
      title: '구독료', 
      value: '₩8,234,567', 
      change: '+12.8%', 
      detail: 'Standard: ₩4.6M, Business: ₩3.7M'
    },
    { 
      title: '사용료', 
      value: '₩4,111,111', 
      change: '+22.5%', 
      detail: '일반음원: ₩2.3M, 가사만: ₩1.0M, Inst: ₩0.8M'
    },
    { 
      title: '리워드 할인', 
      value: '₩1,234,567', 
      change: '+15.3%', 
      detail: '총 할인 금액'
    },
  ]

  // TOP 기업 데이터
  const standardTop = [
    { name: 'Company A', amount: 1234567, pct: 35, growth: '+12.3%' },
    { name: 'Company B', amount: 987654, pct: 28, growth: '+8.7%' },
    { name: 'Company C', amount: 654321, pct: 18, growth: '+15.2%' },
    { name: 'Company D', amount: 432198, pct: 12, growth: '+5.4%' },
    { name: '기타 5개사', amount: 234567, pct: 7, growth: '+3.1%' },
  ]
  const businessTop = [
    { name: 'Company A', amount: 1234567, pct: 35, growth: '+18.9%' },
    { name: 'Company B', amount: 987654, pct: 28, growth: '+11.2%' },
    { name: 'Company C', amount: 654321, pct: 18, growth: '+22.5%' },
    { name: 'Company D', amount: 432198, pct: 12, growth: '+7.8%' },
    { name: '기타 5개사', amount: 234567, pct: 7, growth: '+4.2%' },
  ]

  // 차트 데이터
  const labels = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']
  
  const subscriptionSeries = [
    {
      label: 'Standard',
      data: [4000000, 4200000, 4400000, 4600000, 4800000, 5000000, 5200000, 5400000, 5600000, 5800000, 6000000, 6200000]
    },
    {
      label: 'Business',
      data: [2500000, 2700000, 2900000, 3100000, 3300000, 3500000, 3700000, 3900000, 4100000, 4300000, 4500000, 4700000]
    }
  ]

  const usageSeries = [
    {
      label: '일반음원',
      data: [1500000, 1650000, 1800000, 1950000, 2100000, 2250000, 2400000, 2550000, 2700000, 2850000, 3000000, 3150000]
    },
    {
      label: '가사만',
      data: [600000, 650000, 700000, 750000, 800000, 850000, 900000, 950000, 1000000, 1050000, 1100000, 1150000]
    },
    {
      label: 'Inst음원',
      data: [400000, 450000, 500000, 550000, 600000, 650000, 700000, 750000, 800000, 850000, 900000, 950000]
    }
  ]

  useEffect(() => {
    // 마지막 업데이트 시간
    const updateTime = () => {
      const now = new Date()
      const s = now.toLocaleString('ko-KR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
      setLastUpdated(s)
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-full px-6 py-6">
      {/* KPI Cards */}
      <section className="mb-8">
        <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
          {kpis.map((kpi, i) => (
            <Card key={i}>
              <div className="space-y-1">
                <Title variant="card">{kpi.title}</Title>
                <div className="text-3xl font-bold text-white">{kpi.value}</div>
                <div className="space-y-0.5">
                  <div className="text-sm text-teal-300">({kpi.change})</div>
                  <div className="mt-2 space-y-0.5">
                    <div className="text-xs text-white/60">{kpi.detail}</div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Charts Section */}
      <section className="mb-8">
        <Title variant="section" className="mb-4">매출 분석</Title>
        <div className="grid gap-5 [grid-template-columns:1fr_1fr] max-[1200px]:grid-cols-1">
          <Card>
            <Title variant="card" className="mb-4">월별 구독료 추이</Title>
            <div className="h-80">
              <SimpleLineChart labels={labels} series={subscriptionSeries} />
            </div>
          </Card>
          <Card>
            <Title variant="card" className="mb-4">월별 사용료 추이</Title>
            <div className="h-80">
              <SimpleLineChart labels={labels} series={usageSeries} />
            </div>
          </Card>
        </div>
      </section>

      {/* TOP Companies Section */}
      <section className="mb-8">
        <Title variant="section" className="mb-4">기업별 매출 현황</Title>
        <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(380px,1fr))]">
          {/* Standard TOP */}
          <Card>
            <Title variant="card" className="mb-4">Standard 등급 TOP 기업</Title>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-center py-2 px-3 text-xs font-medium text-white/60">순위</th>
                    <th className="text-center py-2 px-3 text-xs font-medium text-white/60">기업명</th>
                    <th className="text-center py-2 px-3 text-xs font-medium text-white/60">매출</th>
                    <th className="text-center py-2 px-3 text-xs font-medium text-white/60">비중</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {standardTop.map((company, i) => (
                    <tr key={i} className="border-b border-white/5">
                      <td className={`py-2 px-3 font-medium text-center ${
                        i < 3 ? 'text-teal-300' : 'text-white/60'
                      }`}>{i + 1}</td>
                      <td className="py-2 px-3 text-white/80 text-center">{company.name}</td>
                      <td className="py-2 px-3 text-teal-400 font-semibold text-center">₩{company.amount.toLocaleString()}</td>
                      <td className="py-2 px-3 text-white/60 text-center">{company.pct}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Business TOP */}
          <Card>
            <Title variant="card" className="mb-4">Business 등급 TOP 기업</Title>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-center py-2 px-3 text-xs font-medium text-white/60">순위</th>
                    <th className="text-center py-2 px-3 text-xs font-medium text-white/60">기업명</th>
                    <th className="text-center py-2 px-3 text-xs font-medium text-white/60">매출</th>
                    <th className="text-center py-2 px-3 text-xs font-medium text-white/60">비중</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {businessTop.map((company, i) => (
                    <tr key={i} className="border-b border-white/5">
                      <td className={`py-2 px-3 font-medium text-center ${
                        i < 3 ? 'text-teal-300' : 'text-white/60'
                      }`}>{i + 1}</td>
                      <td className="py-2 px-3 text-white/80 text-center">{company.name}</td>
                      <td className="py-2 px-3 text-teal-400 font-semibold text-center">₩{company.amount.toLocaleString()}</td>
                      <td className="py-2 px-3 text-white/60 text-center">{company.pct}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </section>
    </div>
  )
} 