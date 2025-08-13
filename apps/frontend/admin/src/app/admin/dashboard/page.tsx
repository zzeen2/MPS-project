'use client'
import DashboardHeader from '@/components/layout/DashboardHeader'
import HourlyUsageMultiLine from '@/components/charts/HourlyUsageMultiLine'
import PieTierDistribution from '@/components/charts/PieTierDistribution'
import BarCategoryTop5 from '@/components/charts/BarCategoryTop5'
import ApiLiveStatus from '@/components/realtime/ApiLiveStatus'
import TopTracksTable from '@/components/tables/TopTracksTable'
import RecentCompaniesTable from '@/components/tables/RecentCompaniesTable'
import TrackTotalCard from '@/components/cards/TrackTotalCard'
import CompanyTotalCard from '@/components/cards/CompanyTotalCard'
import MonthlyPlaysCard from '@/components/cards/MonthlyPlaysCard'
import MonthlyRevenueCard from '@/components/cards/MonthlyRevenueCard'
import RewardsStatusCard from '@/components/cards/RewardsStatusCard'
import RenewalRateCard from '@/components/cards/RenewalRateCard'

export default function DashboardPage() {
  const tracks = { total: 1245, momDeltaPct: 5, lastMonth: 1185, ctaHref: '/admin/tracks' }
  const companies = { total: 340, newCount: 20, standard: 220, business: 120 }
  const plays = { monthTotal: 524300, momDeltaPct: 8, dailyAvg: 17480 }
  const revenue = { forecastKrw: 12_500_000, momDeltaPct: 12 }
  const rewards = { achieved: 15, totalTargets: 40, issuedRwd: 12_000, usedRwd: 8_500 }
  const renewal = { ratePct: 88, momDeltaPct: 3, churned: 5, resubscribed: 35 }

  return (
    <div className="w-full px-6 py-6">
      <DashboardHeader title="B2B Music Licensing Platform" subtitle="관리자 대시보드 · 실시간 모니터링" />

      <section className="mb-8">
        <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
          <TrackTotalCard {...tracks} activeApis={132} inactiveApis={8} />
          <CompanyTotalCard {...companies} />
          <MonthlyPlaysCard {...plays} />
          <MonthlyRevenueCard {...revenue} />
          <RewardsStatusCard {...rewards} />
          <RenewalRateCard {...renewal} />
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-sm font-semibold text-white">차트 분석</h2>
        <div className="grid gap-5 [grid-template-columns:1.5fr_1fr_0.8fr] max-[1200px]:grid-cols-2 max-md:grid-cols-1">
          <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-6 shadow-xl shadow-black/30 backdrop-blur-md min-h-[320px]">
            <div className="mb-3 text-sm font-semibold text-white">24시간 사용량 (요금제별 + 전일 평균)</div>
            <HourlyUsageMultiLine />
          </div>
          <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-6 shadow-xl shadow-black/30 backdrop-blur-md min-h-[320px]">
            <div className="mb-3 text-sm font-semibold text-white">등급별 기업 분포</div>
            <PieTierDistribution />
          </div>
          <div className="min-w-0 rounded-2xl border border-white/10 bg-neutral-900/60 p-6 shadow-xl shadow-black/30 backdrop-blur-md min-h-[320px]">
            <div className="mb-3 text-sm font-semibold text-white">카테고리 Top5 호출수 · 리워드 기여율</div>
            <BarCategoryTop5 />
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-sm font-semibold text-white">실시간 모니터링</h2>
        <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(380px,1fr))]">
          <ApiLiveStatus />
          <TopTracksTable />
          <RecentCompaniesTable />
        </div>
      </section>
    </div>
  )
}