'use client'

import React, { useState, useEffect } from 'react'
import MusicStatsModal from '@/components/modals/MusicStatsModal'
import MusicEditModal from '@/components/modals/MusicEditModal'

export default function MusicsPage() {
  const [statsOpen, setStatsOpen] = useState(false)
  const [statsTitle, setStatsTitle] = useState<string>('음원 상세 통계')
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string>('')
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set())
  const [selectAll, setSelectAll] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editMusicData, setEditMusicData] = useState<any>(null)
  const [isCreateMode, setIsCreateMode] = useState(false)
  
  // 필터링 상태
  const [genreFilter, setGenreFilter] = useState('전체')
  const [validPlaysFilter, setValidPlaysFilter] = useState('전체')
  const [validRateFilter, setValidRateFilter] = useState('전체')
  const [rewardFilter, setRewardFilter] = useState('전체')
  const [musicTypeFilter, setMusicTypeFilter] = useState('전체')
  const [dateFilter, setDateFilter] = useState('전체')
  
  // 정렬 상태 추가
  const [sortBy, setSortBy] = useState<string>('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  
  // 드롭다운 열림/닫힘 상태
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  

  

  
  // 페이지 외부 클릭 시 드롭다운 닫기
  React.useEffect(() => {
    const handleClickOutside = () => {
      setOpenDropdown(null)
    }
    
    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [])

  const handleDelete = (title: string) => {
    setDeleteTarget(title)
    setDeleteModalOpen(true)
  }
  
  // 드롭다운 토글 함수
  const toggleDropdown = (dropdownName: string, e: React.MouseEvent) => {
    e.stopPropagation() // 이벤트 전파 방지
    const newState = openDropdown === dropdownName ? null : dropdownName
    
    // 상태 변경을 지연시켜서 즉시 변경되는 것 방지
    setTimeout(() => {
      setOpenDropdown(newState)
    }, 0)
  }
  
  // 드롭다운 닫기 함수
  const closeDropdown = () => {
    setOpenDropdown(null)
  }
  
  // 정렬 함수
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  const confirmDelete = () => {
    if (deleteTarget.includes('개 음원')) {
      console.log(`일괄 삭제됨: ${selectedItems.size}개 음원`)
      setSelectedItems(new Set())
      setSelectAll(false)
    } else {
      console.log(`삭제됨: ${deleteTarget}`)
    }
    setDeleteModalOpen(false)
    setDeleteTarget('')
  }

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems(new Set())
      setSelectAll(false)
    } else {
      const allIndices = new Set([...Array(10)].map((_, i) => i))
      setSelectedItems(allIndices)
      setSelectAll(true)
    }
  }

  const handleItemSelect = (index: number) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(index)) {
      newSelected.delete(index)
    } else {
      newSelected.add(index)
    }
    setSelectedItems(newSelected)
    setSelectAll(newSelected.size === 10)
  }

  const handleBulkDelete = () => {
    if (selectedItems.size === 0) return
    setDeleteTarget(`${selectedItems.size}개 음원`)
    setDeleteModalOpen(true)
  }

  const handleEdit = (index: number) => {
    const mockMusicData = {
      title: `Song Title ${index + 1}`,
      artist: `Artist ${index + 1}`,
      genre: 'Pop',
      tags: '차분한, 릴렉스',
      releaseYear: 2024,
      durationSec: 180 + index * 10,
      priceRef: 7,
      rewardPerPlay: 0.007,
      maxPlayCount: 1000,
      accessTier: 'all' as const
    }
    setIsCreateMode(false)
    setEditMusicData(mockMusicData)
    setEditModalOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* 검색/필터 및 음원 현황 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="min-w-[300px]">
            <input 
              className="w-full px-3 py-2 text-white placeholder-white/50 outline-none border border-white/10 rounded-lg focus:border-teal-400/50 transition-colors text-sm" 
              placeholder="음원명, 아티스트, 태그로 검색 .." 
            />
          </div>
          <button 
            onClick={() => {
              // 검색 기능 구현
              console.log('검색 실행')
            }}
            className="rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white/80 hover:bg-white/20 hover:text-white transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <button 
            onClick={() => {
              setIsCreateMode(true)
              setEditMusicData(null)
              setEditModalOpen(true)
            }}
            className="rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 px-4 py-2 text-sm font-medium text-white hover:from-teal-600 hover:to-teal-700 transition-all duration-200"
          >
            음원 등록
          </button>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-sm text-white/60">
            총 음원: <span className="text-teal-300 font-semibold">1,234</span>개 | 
            선택됨: <span className="text-teal-300 font-semibold">{selectedItems.size}</span>개
          </div>
          <button 
            onClick={handleBulkDelete}
            disabled={selectedItems.size === 0}
            className={`rounded-lg border border-white/10 px-4 py-2 text-sm font-medium transition-all duration-200 ${
              selectedItems.size === 0 
                ? 'bg-white/5 text-white/30 cursor-not-allowed' 
                : 'bg-white/5 text-white hover:bg-white/10'
            }`}
          >
            일괄 삭제
          </button>
        </div>
      </div>

      {/* 목록 테이블 */}
      <div className="overflow-visible">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-sm">
            <thead className="text-left">
              <tr className="border-b border-white/10">
                <th className="px-6 py-4">
                  <input 
                    type="checkbox" 
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="accent-teal-400 rounded" 
                  />
                </th>
                <th className="px-6 py-4 text-white/70 font-medium">썸네일</th>
                <th className="px-6 py-4 text-white/70 font-medium">음원명</th>
                <th className="px-6 py-4 text-white/70 font-medium">
                  <div className="relative">
                    <div className="flex items-center gap-1">
                      <span>장르</span>
                      <button 
                        onClick={(e) => toggleDropdown('genre', e)}
                        className="text-white/50 hover:text-white/70 transition-colors cursor-pointer"
                      >
                        ▼
                      </button>
                    </div>
                    
                    {/* 장르 드롭다운 메뉴 */}
                    {openDropdown === 'genre' && (
                      <div className="absolute top-full left-0 mt-1 bg-black/90 border border-white/20 rounded-lg shadow-xl z-[9999] min-w-[120px]">
                        <div className="py-1">
                          <button 
                            onClick={() => { setGenreFilter('전체'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              genreFilter === '전체' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            전체
                          </button>
                          <button 
                            onClick={() => { setGenreFilter('Pop'); setSortBy('genre'); setSortOrder('asc'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              genreFilter === 'Pop' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            Pop
                          </button>
                          <button 
                            onClick={() => { setGenreFilter('Rock'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              genreFilter === 'Rock' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            Rock
                          </button>
                          <button 
                            onClick={() => { setGenreFilter('Jazz'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              genreFilter === 'Jazz' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            Jazz
                          </button>
                          <button 
                            onClick={() => { setGenreFilter('Classical'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              genreFilter === 'Classical' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            Classical
                          </button>
                          <button 
                            onClick={() => { setGenreFilter('Electronic'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              genreFilter === 'Electronic' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            Electronic
                          </button>
                          <button 
                            onClick={() => { setGenreFilter('Hip-hop'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              genreFilter === 'Hip-hop' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            Hip-hop
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-white/70 font-medium">태그</th>
                <th className="px-6 py-4 text-white/70 font-medium">
                  <div className="relative">
                    <div className="flex items-center gap-1">
                      <span>음원 유형</span>
                      <button 
                        onClick={(e) => toggleDropdown('musicType', e)}
                        className="text-white/50 hover:text-white/70 transition-colors cursor-pointer"
                      >
                        ▼
                      </button>
                    </div>
                    
                    {/* 음원 유형 드롭다운 메뉴 */}
                    {openDropdown === 'musicType' && (
                      <div className="absolute top-full left-0 mt-1 bg-black/90 border border-white/20 rounded-lg shadow-lg z-10 min-w-[100px]">
                        <div className="py-1">
                          <button 
                            onClick={() => { setMusicTypeFilter('전체'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              musicTypeFilter === '전체' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            전체
                          </button>
                          <button 
                            onClick={() => { setMusicTypeFilter('일반'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              musicTypeFilter === '일반' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            일반
                          </button>
                          <button 
                            onClick={() => { setMusicTypeFilter('Inst'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              musicTypeFilter === 'Inst' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            Inst
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-white/70 font-medium">
                  <div className="relative">
                    <button 
                      onClick={(e) => toggleDropdown('validPlays', e)}
                      className="flex items-center gap-1 w-full text-left hover:text-white/90 transition-colors"
                    >
                      <span>유효재생</span>
                      <span className="text-white/50">▼</span>
                    </button>
                    
                    {/* 유효재생 드롭다운 메뉴 */}
                    {openDropdown === 'validPlays' && (
                      <div className="absolute top-full left-0 mt-1 bg-black/90 border border-white/20 rounded-lg shadow-lg z-10 min-w-[100px]">
                        <div className="py-1">
                          <button 
                            onClick={() => { setValidPlaysFilter('전체'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              validPlaysFilter === '전체' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            전체
                          </button>
                          <button 
                            onClick={() => { setValidPlaysFilter('많은순'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              validPlaysFilter === '많은순' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            많은순
                          </button>
                          <button 
                            onClick={() => { setValidPlaysFilter('적은순'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              validPlaysFilter === '적은순' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            적은순
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-white/70 font-medium">
                  <div className="relative">
                    <button 
                      onClick={(e) => toggleDropdown('validRate', e)}
                      className="flex items-center gap-1 w-full text-left hover:text-white/90 transition-colors"
                    >
                      <span>유효재생률</span>
                      <span className="text-white/50">▼</span>
                    </button>
                    
                    {/* 유효재생률 드롭다운 메뉴 */}
                    {openDropdown === 'validRate' && (
                      <div className="absolute top-full left-0 mt-1 bg-black/90 border border-white/20 rounded-lg shadow-lg z-10 min-w-[100px]">
                        <div className="py-1">
                          <button 
                            onClick={() => { setValidRateFilter('전체'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              validRateFilter === '전체' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            전체
                          </button>
                          <button 
                            onClick={() => { setValidRateFilter('높은순'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              validRateFilter === '높은순' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            높은순
                          </button>
                          <button 
                            onClick={() => { setValidRateFilter('낮은순'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              validRateFilter === '낮은순' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            낮은순
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-white/70 font-medium">월 최대 리워드 한도</th>
                <th className="px-6 py-4 text-white/70 font-medium">
                  <div className="relative">
                    <button 
                      onClick={(e) => toggleDropdown('reward', e)}
                      className="flex items-center gap-1 w-full text-left hover:text-white/90 transition-colors"
                    >
                      <span>호출당 리워드</span>
                      <span className="text-white/50">▼</span>
                    </button>
                    
                    {/* 호출당 리워드 드롭다운 메뉴 */}
                    {openDropdown === 'reward' && (
                      <div className="absolute top-full left-0 mt-1 bg-black/90 border border-white/20 rounded-lg shadow-lg z-10 min-w-[120px]">
                        <div className="py-1">
                          <button 
                            onClick={() => { setRewardFilter('전체'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              rewardFilter === '전체' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            전체
                          </button>
                          <button 
                            onClick={() => { setRewardFilter('높은순'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              rewardFilter === '높은순' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            높은순
                          </button>
                          <button 
                            onClick={() => { setRewardFilter('낮은순'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              rewardFilter === '낮은순' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            낮은순
                          </button>
                          <button 
                            onClick={() => { setRewardFilter('리워드 있음'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              rewardFilter === '리워드 있음' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            리워드 있음
                          </button>
                          <button 
                            onClick={() => { setRewardFilter('리워드 없음'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              rewardFilter === '리워드 없음' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            리워드 없음
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-white/70 font-medium">
                  <div className="relative">
                    <button 
                      onClick={(e) => toggleDropdown('date', e)}
                      className="flex items-center gap-1 w-full text-left hover:text-white/90 transition-colors"
                    >
                      <span>등록일</span>
                      <span className="text-white/50">▼</span>
                    </button>
                    
                    {/* 등록일 드롭다운 메뉴 */}
                    {openDropdown === 'date' && (
                      <div className="absolute top-full left-0 mt-1 bg-black/90 border border-white/20 rounded-lg shadow-lg z-10 min-w-[100px]">
                        <div className="py-1">
                          <button 
                            onClick={() => { setDateFilter('전체'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              dateFilter === '전체' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            전체
                          </button>
                          <button 
                            onClick={() => { setDateFilter('최신순'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              dateFilter === '최신순' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            최신순
                          </button>
                          <button 
                            onClick={() => { setDateFilter('오래된순'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              dateFilter === '오래된순' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            오래된순
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-white/70 font-medium">액션</th>
              </tr>
            </thead>
            <tbody>
              {React.useMemo(() => {
                // 필터링 + 정렬된 데이터 생성
                let filteredData = [...Array(10)].map((_, i) => ({
                  index: i,
                  title: `Song Title ${i+1}`,
                  genre: 'Pop',
                  tags: '차분한, 릴렉스',
                  musicType: i % 2 === 0 ? '일반' : 'Inst',
                  validPlays: 1000 + i * 3,
                  validRate: Math.round(((1000 + i * 3) / (1000 + i * 3 + 100)) * 100),
                  reward: i % 3 === 0 ? '-' : '1000토큰',
                  rewardPerPlay: i % 3 === 0 ? '-' : '0.007토큰',
                  date: '2024.01.15'
                }))
                
                // 필터링
                filteredData = filteredData.filter(item => {
                  if (genreFilter !== '전체' && item.genre !== genreFilter) return false
                  if (musicTypeFilter !== '전체' && item.musicType !== musicTypeFilter) return false
                  if (validPlaysFilter !== '전체') {
                    if (validPlaysFilter === '많은순' && item.validPlays < 1015) return false
                    if (validPlaysFilter === '적은순' && item.validPlays > 1015) return false
                  }
                  if (validRateFilter !== '전체') {
                    if (validRateFilter === '높은순' && item.validRate < 90) return false
                    if (validRateFilter === '낮은순' && item.validRate > 90) return false
                  }
                  if (rewardFilter !== '전체') {
                    if (rewardFilter === '리워드 있음' && item.reward === '-') return false
                    if (rewardFilter === '리워드 없음' && item.reward !== '-') return false
                  }
                  return true
                })
                
                // 정렬
                if (sortBy && sortOrder) {
                  filteredData.sort((a, b) => {
                    let aVal = a[sortBy as keyof typeof a]
                    let bVal = b[sortBy as keyof typeof b]
                    
                    if (typeof aVal === 'string' && typeof bVal === 'string') {
                      return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
                    }
                    if (typeof aVal === 'number' && typeof bVal === 'number') {
                      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
                    }
                    return 0
                  })
                }
                
                return filteredData
              }, [genreFilter, musicTypeFilter, validPlaysFilter, validRateFilter, rewardFilter, sortBy, sortOrder]).map((item) => {
                return (
                                  <tr key={item.index} className={`border-b border-white/5 transition-all duration-200 ${
                    item.index % 2 === 0 ? 'bg-white/2' : 'bg-white/1'
                } hover:bg-white/8`}>
                  <td className="px-6 py-4">
                    <input 
                      type="checkbox" 
                        checked={selectedItems.has(item.index)}
                        onChange={() => handleItemSelect(item.index)}
                      className="accent-teal-400 rounded" 
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-teal-400/20 via-blue-400/15 to-purple-400/20 border border-white/10 flex items-center justify-center shadow-inner">
                      <span className="text-teal-300 text-xl">🎵</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                      <div className="font-semibold text-white">{item.title}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-teal-400/15 to-blue-400/15 text-teal-300 border border-teal-400/25">
                        {item.genre}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white/60">{item.tags}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-purple-400/15 to-purple-400/15 text-purple-300 border border-purple-400/25">
                        {item.musicType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-white/80">
                      <span className="font-medium">{item.validPlays.toLocaleString()}회</span>
                  </td>
                  <td className="px-6 py-4">
                      <span className="text-teal-300 font-medium">{item.validRate}%</span>
                    </td>
                    <td className="px-6 py-4 text-white/80">
                      {item.reward}
                    </td>
                    <td className="px-6 py-4 text-white/80">
                      {item.rewardPerPlay}
                  </td>
                    <td className="px-6 py-4 text-white/60">{item.date}</td>
                  <td className="px-6 py-4">
                                        <div className="flex gap-2">
                      <button 
                        className="rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 px-3 py-1.5 text-xs text-white font-medium hover:from-teal-600 hover:to-teal-700 transition-all duration-200"
                        onClick={() => handleEdit(item.index)}
                      >
                        수정
                      </button>
                      <button 
                        className="rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 px-3 py-1.5 text-xs text-white font-medium hover:from-teal-600 hover:to-teal-700 transition-all duration-200" 
                        onClick={()=>{ setStatsTitle(item.title); setStatsOpen(true) }}
                      >
                        상세
                      </button>
                    </div>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>

      {/* 페이지네이션 */}
      <div className="sticky bottom-0 flex items-center justify-center text-sm text-white/70 mt-8 bg-neutral-950 py-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <button className="rounded-lg border border-white/10 bg-white/5 p-2.5 hover:bg-white/10 transition-all duration-200 hover:border-white/20">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
          <button className="rounded-lg border border-white/10 bg-white/5 p-2.5 hover:bg-white/10 transition-all duration-200 hover:border-white/20">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="px-5 py-2.5 bg-gradient-to-r from-white/8 to-white/5 rounded-lg border border-white/10 font-medium">1 / 25</span>
          <button className="rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 p-2.5 text-white font-medium hover:from-teal-600 hover:to-teal-700 transition-all duration-200">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button className="rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 p-2.5 text-white font-medium hover:from-teal-600 hover:to-teal-700 transition-all duration-200">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* 통계 모달 */}
      <MusicStatsModal open={statsOpen} onClose={()=>setStatsOpen(false)} title={statsTitle} />

      {/* 수정/등록 모달 */}
      <MusicEditModal 
        open={editModalOpen} 
        onClose={() => {
          setEditModalOpen(false)
          setIsCreateMode(false)
        }} 
        musicData={editMusicData}
        isCreateMode={isCreateMode}
      />

      {/* 삭제 확인 모달 */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-neutral-900/90 p-6 text-white shadow-2xl backdrop-blur-md">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
                <svg className="h-8 w-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold">음원 삭제 확인</h3>
              <p className="text-sm text-white/60">
                <span className="font-medium text-white">"{deleteTarget}"</span> 음원을 삭제하시겠습니까?
              </p>
              <p className="mt-2 text-xs text-red-400">이 작업은 되돌릴 수 없습니다.</p>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white font-medium hover:bg-white/10 transition-all duration-200"
              >
                취소
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 rounded-lg bg-gradient-to-r from-red-500 to-red-600 px-4 py-2.5 text-sm text-white font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 