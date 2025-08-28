'use client'

import React, { useState } from 'react'
import CompanyDetailModal from '@/components/modals/CompanyDetailModal'

type Company = {
  id: string
  name: string
  tier: string
  totalTokens: number
  monthlyEarned: number
  monthlyUsed: number
  usageRate: number
  activeTracks: number
  status: 'active' | 'inactive' | 'suspended'
  lastActivity: string
  joinedDate: string
  contactEmail: string
  contactPhone: string
  contractStart: string
  contractEnd: string
  monthlyUsage: number[]
  monthlyRewards: number[]
  topTracks: Array<{ title: string; usage: number; category: string }>
  // 추가 필드들
  ceoName: string
  profileImageUrl: string
  homepageUrl: string
  smartAccountAddress: string
  apiKeyHash: string
  createdAt: string
  updatedAt: string
  subscriptionStart: string
  subscriptionEnd: string
  businessNumber: string
}

export default function CompanyRewardsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTier, setSelectedTier] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  
  // 드롭다운 필터 상태
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [tierFilter, setTierFilter] = useState('전체')
  const [tokensFilter, setTokensFilter] = useState('전체')
  const [earnedFilter, setEarnedFilter] = useState('전체')
  const [usedFilter, setUsedFilter] = useState('전체')
  const [usageRateFilter, setUsageRateFilter] = useState('전체')
  const [activeTracksFilter, setActiveTracksFilter] = useState('전체')
  
  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // 드롭다운 관련 함수들
  const toggleDropdown = (dropdown: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const newState = openDropdown === dropdown ? null : dropdown
    setTimeout(() => {
      setOpenDropdown(newState)
    }, 0)
  }

  const closeDropdown = () => {
    setOpenDropdown(null)
  }

  // 외부 클릭 시 드롭다운 닫기
  React.useEffect(() => {
    const handleClickOutside = () => {
      setOpenDropdown(null)
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  const companies: Company[] = [
    {
      id: '1',
      name: 'TechCorp Solutions',
      tier: 'Business',
      totalTokens: 125000,
      monthlyEarned: 15000,
      monthlyUsed: 8500,
      usageRate: 68,
      activeTracks: 45,
      status: 'active',
      lastActivity: '2024-01-15',
      joinedDate: '2023-01-15',
      contactEmail: 'admin@techcorp.com',
      contactPhone: '02-1234-5678',
      contractStart: '2023-01-15',
      contractEnd: '2024-12-31',
      monthlyUsage: [1200, 1350, 1100, 1400, 1600, 1800, 2000, 1900, 2100, 1950, 2200, 2400],
      monthlyRewards: [15000, 16800, 13750, 17500, 20000, 22500, 25000, 23750, 26250, 24375, 27500, 30000],
      topTracks: [
        { title: 'Shape of You', usage: 1250, category: 'Pop' },
        { title: 'Blinding Lights', usage: 980, category: 'Pop' },
        { title: 'Bohemian Rhapsody', usage: 850, category: 'Rock' },
        { title: 'Take Five', usage: 720, category: 'Jazz' },
        { title: 'Moonlight Sonata', usage: 680, category: 'Classical' }
      ],
      // 추가 필드들
      ceoName: '김철수',
      profileImageUrl: 'https://example.com/profile1.jpg',
      homepageUrl: 'https://techcorp.com',
      smartAccountAddress: '0x1234567890abcdef1234567890abcdef12345678',
      apiKeyHash: 'hash_abc123def456',
      createdAt: '2023-01-15',
      updatedAt: '2024-01-15',
      subscriptionStart: '2023-01-15',
      subscriptionEnd: '2024-12-31',
      businessNumber: '123-45-67890'
    },
    {
      id: '2',
      name: 'Digital Media Inc',
      tier: 'Standard',
      totalTokens: 85000,
      monthlyEarned: 12000,
      monthlyUsed: 7200,
      usageRate: 85,
      activeTracks: 32,
      status: 'active',
      lastActivity: '2024-01-14',
      joinedDate: '2023-03-20',
      contactEmail: 'info@digitalmedia.com',
      contactPhone: '02-2345-6789',
      contractStart: '2023-03-20',
      contractEnd: '2024-12-31',
      monthlyUsage: [800, 950, 1100, 1200, 1350, 1500, 1600, 1550, 1700, 1650, 1800, 2000],
      monthlyRewards: [10000, 11875, 13750, 15000, 16875, 18750, 20000, 19375, 21250, 20625, 22500, 25000],
      topTracks: [
        { title: 'Dance Monkey', usage: 1100, category: 'Pop' },
        { title: 'Hotel California', usage: 850, category: 'Rock' },
        { title: 'Sandstorm', usage: 720, category: 'Electronic' },
        { title: 'Lose Yourself', usage: 680, category: 'Hip-Hop' },
        { title: 'So What', usage: 550, category: 'Jazz' }
      ],
      // 추가 필드들
      ceoName: '이영희',
      profileImageUrl: 'https://example.com/profile2.jpg',
      homepageUrl: 'https://digitalmedia.com',
      smartAccountAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
      apiKeyHash: 'hash_def456ghi789',
      createdAt: '2023-03-20',
      updatedAt: '2024-01-14',
      subscriptionStart: '2023-03-20',
      subscriptionEnd: '2024-12-31',
      businessNumber: '234-56-78901'
    },
    {
      id: '3',
      name: 'Startup Ventures',
      tier: 'Free',
      totalTokens: 25000,
      monthlyEarned: 5000,
      monthlyUsed: 4800,
      usageRate: 96,
      activeTracks: 18,
      status: 'active',
      lastActivity: '2024-01-13',
      joinedDate: '2023-06-10',
      contactEmail: 'hello@startup.com',
      contactPhone: '02-3456-7890',
      contractStart: '2023-06-10',
      contractEnd: '2024-06-09',
      monthlyUsage: [400, 500, 600, 700, 800, 900, 1000, 950, 1100, 1050, 1200, 1300],
      monthlyRewards: [5000, 6250, 7500, 8750, 10000, 11250, 12500, 11875, 13750, 13125, 15000, 16250],
      topTracks: [
        { title: 'In Da Club', usage: 650, category: 'Hip-Hop' },
        { title: 'Levels', usage: 580, category: 'Electronic' },
        { title: 'Symphony No. 5', usage: 420, category: 'Classical' },
        { title: 'Stairway to Heaven', usage: 380, category: 'Rock' },
        { title: 'Blinding Lights', usage: 320, category: 'Pop' }
      ],
      // 추가 필드들
      ceoName: '박민수',
      profileImageUrl: '',
      homepageUrl: '',
      smartAccountAddress: '',
      apiKeyHash: 'hash_ghi789jkl012',
      createdAt: '2023-06-10',
      updatedAt: '2024-01-13',
      subscriptionStart: '2023-06-10',
      subscriptionEnd: '2024-06-09',
      businessNumber: '345-67-89012'
    }
  ]

  const filteredCompanies = React.useMemo(() => {
    let filteredData = companies.filter(company => 
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedTier === 'all' || company.tier === selectedTier)
    )
    
    // 새로운 필터링 로직
    filteredData = filteredData.filter(company => {
      if (tierFilter !== '전체' && company.tier !== tierFilter) return false
      if (tokensFilter !== '전체') {
        if (tokensFilter === '많은순' && company.totalTokens < 100000) return false
        if (tokensFilter === '적은순' && company.totalTokens > 100000) return false
      }
      if (earnedFilter !== '전체') {
        if (earnedFilter === '많은순' && company.monthlyEarned < 15000) return false
        if (earnedFilter === '적은순' && company.monthlyEarned > 15000) return false
      }
      if (usedFilter !== '전체') {
        if (usedFilter === '많은순' && company.monthlyUsed < 8000) return false
        if (usedFilter === '적은순' && company.monthlyUsed > 8000) return false
      }
      if (usageRateFilter !== '전체') {
        if (usageRateFilter === '높은순' && company.usageRate < 70) return false
        if (usageRateFilter === '낮은순' && company.usageRate > 70) return false
      }
      if (activeTracksFilter !== '전체') {
        if (activeTracksFilter === '많은순' && company.activeTracks < 40) return false
        if (activeTracksFilter === '적은순' && company.activeTracks > 40) return false
      }
      return true
    })
    
    // 정렬
    if (sortBy && sortOrder) {
      filteredData.sort((a, b) => {
        let aVal: any, bVal: any
      
      switch (sortBy) {
        case 'name':
            aVal = a.name
            bVal = b.name
          break
        case 'tokens':
            aVal = a.totalTokens
            bVal = b.totalTokens
          break
        case 'usage':
            aVal = a.usageRate
            bVal = b.usageRate
          break
        default:
            aVal = a.name
            bVal = b.name
      }

      if (sortOrder === 'asc') {
          return aVal > bVal ? 1 : -1
      } else {
          return aVal < bVal ? 1 : -1
        }
      })
    }
    
    return filteredData
  }, [companies, searchTerm, selectedTier, tierFilter, tokensFilter, earnedFilter, usedFilter, usageRateFilter, activeTracksFilter, sortBy, sortOrder])

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedCompanies = filteredCompanies.slice(startIndex, endIndex)

  // 페이지 변경 시 현재 페이지를 1로 리셋
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedTier, tierFilter, tokensFilter, earnedFilter, usedFilter, usageRateFilter, activeTracksFilter, sortBy, sortOrder])



  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Business': return 'bg-purple-500/20 text-purple-300 border-purple-500/30'
      case 'Standard': return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
      case 'Free': return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
      default: return 'bg-white/10 text-white/80 border-white/20'
    }
  }

  return (
    <div className="space-y-4">
      {/* 검색 및 기업 현황 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="min-w-[300px]">
            <input
              type="text"
              placeholder="기업명으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-teal-400/50 transition-colors text-sm"
            />
          </div>
        </div>
        
        <div className="text-sm text-white/60">
          총 <span className="text-teal-300 font-semibold">{filteredCompanies.length}</span>개 기업
        </div>
      </div>

      {/* 기업 목록 */}
      <div className="overflow-visible">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-sm">
            <thead className="text-center">
              <tr className="border-b border-white/10">
                <th className="px-6 py-4 text-white/70 font-medium text-center">기업명</th>
                <th className="px-6 py-4 text-white/70 font-medium text-center">
                  <div className="relative">
                    <button 
                      onClick={(e) => toggleDropdown('tier', e)}
                      className="flex items-center justify-center gap-1 w-full text-center hover:text-white/90 transition-colors"
                    >
                      <span>등급</span>
                      <span className="text-white/50">▼</span>
                    </button>
                    
                    {/* 등급 드롭다운 메뉴 */}
                    {openDropdown === 'tier' && (
                      <div className="absolute top-full left-0 mt-1 bg-black/90 border border-white/20 rounded-lg shadow-xl z-[9999] min-w-[120px]">
                        <div className="py-1">
                          <button 
                            onClick={() => { setTierFilter('전체'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              tierFilter === '전체' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            전체
                          </button>
                          <button 
                            onClick={() => { setTierFilter('Business'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              tierFilter === 'Business' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            Business
                          </button>
                          <button 
                            onClick={() => { setTierFilter('Standard'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              tierFilter === 'Standard' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            Standard
                          </button>
                          <button 
                            onClick={() => { setTierFilter('Free'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              tierFilter === 'Free' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            Free
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-white/70 font-medium text-center">
                  <div className="relative">
                    <button 
                      onClick={(e) => toggleDropdown('tokens', e)}
                      className="flex items-center justify-center gap-1 w-full text-center hover:text-white/90 transition-colors"
                    >
                      <span>보유 토큰</span>
                      <span className="text-white/50">▼</span>
                    </button>
                    
                    {/* 보유 토큰 드롭다운 메뉴 */}
                    {openDropdown === 'tokens' && (
                      <div className="absolute top-full left-0 mt-1 bg-black/90 border border-white/20 rounded-lg shadow-xl z-[9999] min-w-[120px]">
                        <div className="py-1">
                          <button 
                            onClick={() => { setTokensFilter('전체'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              tokensFilter === '전체' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            전체
                          </button>
                          <button 
                            onClick={() => { setTokensFilter('많은순'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              tokensFilter === '많은순' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            많은순
                          </button>
                          <button 
                            onClick={() => { setTokensFilter('적은순'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              tokensFilter === '적은순' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            적은순
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-white/70 font-medium text-center">
                  <div className="relative">
                    <button 
                      onClick={(e) => toggleDropdown('earned', e)}
                      className="flex items-center justify-center gap-1 w-full text-center hover:text-white/90 transition-colors"
                    >
                      <span>이번 달 적립</span>
                      <span className="text-white/50">▼</span>
                    </button>
                    
                    {/* 이번 달 적립 드롭다운 메뉴 */}
                    {openDropdown === 'earned' && (
                      <div className="absolute top-full left-0 mt-1 bg-black/90 border border-white/20 rounded-lg shadow-xl z-[9999] min-w-[120px]">
                        <div className="py-1">
                          <button 
                            onClick={() => { setEarnedFilter('전체'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              earnedFilter === '전체' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            전체
                          </button>
                          <button 
                            onClick={() => { setEarnedFilter('많은순'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              earnedFilter === '많은순' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            많은순
                          </button>
                          <button 
                            onClick={() => { setEarnedFilter('적은순'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              earnedFilter === '적은순' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            적은순
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-white/70 font-medium text-center">
                  <div className="relative">
                    <button 
                      onClick={(e) => toggleDropdown('used', e)}
                      className="flex items-center justify-center gap-1 w-full text-center hover:text-white/90 transition-colors"
                    >
                      <span>이번 달 사용</span>
                      <span className="text-white/50">▼</span>
                    </button>
                    
                    {/* 이번 달 사용 드롭다운 메뉴 */}
                    {openDropdown === 'used' && (
                      <div className="absolute top-full left-0 mt-1 bg-black/90 border border-white/20 rounded-lg shadow-xl z-[9999] min-w-[120px]">
                        <div className="py-1">
                          <button 
                            onClick={() => { setUsedFilter('전체'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              usedFilter === '전체' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            전체
                          </button>
                          <button 
                            onClick={() => { setUsedFilter('많은순'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              usedFilter === '많은순' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            많은순
                          </button>
                          <button 
                            onClick={() => { setUsedFilter('적은순'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              usedFilter === '적은순' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            적은순
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-white/70 font-medium text-center">
                  <div className="relative">
                    <button 
                      onClick={(e) => toggleDropdown('usageRate', e)}
                      className="flex items-center justify-center gap-1 w-full text-center hover:text-white/90 transition-colors"
                    >
                      <span>사용률</span>
                      <span className="text-white/50">▼</span>
                    </button>
                    
                    {/* 사용률 드롭다운 메뉴 */}
                    {openDropdown === 'usageRate' && (
                      <div className="absolute top-full left-0 mt-1 bg-black/90 border border-white/20 rounded-lg shadow-xl z-[9999] min-w-[120px]">
                        <div className="py-1">
                          <button 
                            onClick={() => { setUsageRateFilter('전체'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              usageRateFilter === '전체' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            전체
                          </button>
                          <button 
                            onClick={() => { setUsageRateFilter('높은순'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              usageRateFilter === '높은순' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            높은순
                          </button>
                          <button 
                            onClick={() => { setUsageRateFilter('낮은순'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              usageRateFilter === '낮은순' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            낮은순
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-white/70 font-medium text-center">
                  <div className="relative">
                    <button 
                      onClick={(e) => toggleDropdown('activeTracks', e)}
                      className="flex items-center justify-center gap-1 w-full text-center hover:text-white/90 transition-colors"
                    >
                      <span>사용중 음원</span>
                      <span className="text-white/50">▼</span>
                    </button>
                    
                    {/* 사용중 음원 드롭다운 메뉴 */}
                    {openDropdown === 'activeTracks' && (
                      <div className="absolute top-full left-0 mt-1 bg-black/90 border border-white/20 rounded-lg shadow-xl z-[9999] min-w-[120px]">
                        <div className="py-1">
                          <button 
                            onClick={() => { setActiveTracksFilter('전체'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              activeTracksFilter === '전체' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            전체
                          </button>
                          <button 
                            onClick={() => { setActiveTracksFilter('많은순'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              activeTracksFilter === '많은순' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            많은순
                          </button>
                          <button 
                            onClick={() => { setActiveTracksFilter('적은순'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              activeTracksFilter === '적은순' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            적은순
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-white/70 font-medium text-center">액션</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCompanies.map((company, index) => (
                <tr 
                  key={company.id} 
                  className={`border-b border-white/5 transition-all duration-200 cursor-pointer ${
                  index % 2 === 0 ? 'bg-white/2' : 'bg-white/1'
                  } hover:bg-white/8`}
                  onClick={() => {
                    setSelectedCompany(company)
                    setModalOpen(true)
                  }}
                >
                  <td className="px-6 py-4 text-center">
                    <div className="font-semibold text-white">{company.name}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${
                      company.tier === 'Business' ? 'bg-gradient-to-r from-purple-400/15 to-purple-500/15 text-purple-300 border border-purple-400/25' :
                      company.tier === 'Standard' ? 'bg-gradient-to-r from-blue-400/15 to-blue-500/15 text-blue-300 border border-blue-400/25' :
                      'bg-gradient-to-r from-gray-400/15 to-gray-500/15 text-gray-300 border border-gray-400/25'
                    }`}>
                      {company.tier}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-white/90 font-medium text-center">
                    {company.totalTokens.toLocaleString()}
                  </td>
                  <td className="px-8 py-5 text-teal-400 font-medium text-center">
                    +{company.monthlyEarned.toLocaleString()}
                  </td>
                  <td className="px-8 py-5 text-white/80 text-center">
                    {company.monthlyUsed.toLocaleString()}
                  </td>
                  <td className="px-8 py-5 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-20 bg-white/10 rounded-full h-1.5">
                        <div 
                          className="bg-gradient-to-r from-teal-400 to-blue-400 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${company.usageRate}%` }}
                        />
                      </div>
                      <span className="text-white/70 text-xs font-medium">{company.usageRate}%</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-white/80 text-center">
                    {company.activeTracks}개
                  </td>
                  <td className="px-8 py-5 text-center">
                    <button 
                      className="rounded-md bg-teal-500/90 px-2.5 py-1.5 text-xs text-white font-medium hover:bg-teal-400 transition-all duration-200"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedCompany(company)
                        setModalOpen(true)
                      }}
                    >
                      상세
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 페이지네이션 */}
      <div className="sticky bottom-0 flex items-center justify-center text-sm text-white/70 mt-8 bg-neutral-950 py-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <button 
            className="rounded-lg border border-white/10 bg-white/5 p-2.5 hover:bg-white/10 transition-all duration-200 hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
          <button 
            className="rounded-lg border border-white/10 bg-white/5 p-2.5 hover:bg-white/10 transition-all duration-200 hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="px-5 py-2.5 bg-gradient-to-r from-white/8 to-white/5 rounded-lg border border-white/10 font-medium">
            {currentPage} / {totalPages}
          </span>
          <button 
            className="rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 p-2.5 text-white font-medium hover:from-teal-600 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button 
            className="rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 p-2.5 text-white font-medium hover:from-teal-600 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* 기업 상세 모달 */}
      {selectedCompany && (
        <CompanyDetailModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          company={selectedCompany}
        />
      )}
    </div>
  )
} 