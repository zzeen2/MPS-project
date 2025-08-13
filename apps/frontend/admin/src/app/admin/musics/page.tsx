'use client'

export default function MusicsPage() {
  return (
    <div className="space-y-6">
      {/* 검색/필터 */}
      <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-4 backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-2">
          <input className="min-w-[240px] flex-1 rounded bg-black/40 px-3 py-2 text-sm text-white placeholder-white/40 outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-teal-400/60" placeholder="음원명/아티스트 검색" />
          <select className="rounded bg-black/40 px-3 py-2 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-teal-400/60">
            <option>장르 전체</option>
            <option>Pop</option>
            <option>Rock</option>
          </select>
          <select className="rounded bg-black/40 px-3 py-2 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-teal-400/60">
            <option>정렬: 최신순</option>
            <option>정렬: 재생순</option>
            <option>정렬: 이름순</option>
          </select>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-white/60">
          <div>
            총 음원: <span className="text-teal-300">1,234</span>개 | 선택됨: <span className="text-teal-300">0</span>개
          </div>
          <div className="space-x-2">
            <button className="rounded bg-teal-600/90 px-3 py-1.5 text-white hover:bg-teal-500">일괄 수정</button>
            <button className="rounded border border-white/15 bg-white/5 px-3 py-1.5 text-white hover:bg-white/10">일괄 삭제</button>
          </div>
        </div>
      </div>

      {/* 목록 테이블 */}
      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-neutral-900/60 backdrop-blur-md">
        <table className="w-full text-sm">
          <thead className="text-left text-white/60">
            <tr>
              <th className="px-4 py-3"><input type="checkbox" className="accent-teal-400" /></th>
              <th className="px-4 py-3">썸네일</th>
              <th className="px-4 py-3">음원명</th>
              <th className="px-4 py-3">아티스트</th>
              <th className="px-4 py-3">장르</th>
              <th className="px-4 py-3">태그</th>
              <th className="px-4 py-3">참고가격</th>
              <th className="px-4 py-3">재생(누적)</th>
              <th className="px-4 py-3">월 리워드</th>
              <th className="px-4 py-3">리워드설정</th>
              <th className="px-4 py-3">등록일</th>
              <th className="px-4 py-3">액션</th>
            </tr>
          </thead>
          <tbody>
            {[...Array(10)].map((_, i) => (
              <tr key={i} className="border-t border-white/5 hover:bg-white/5">
                <td className="px-4 py-3"><input type="checkbox" className="accent-teal-400" /></td>
                <td className="px-4 py-3"><div className="h-8 w-8 rounded bg-white/10" /></td>
                <td className="px-4 py-3 text-white">Song Title {i+1}</td>
                <td className="px-4 py-3 text-white/80">Artist {i+1}</td>
                <td className="px-4 py-3 text-white/80">Pop</td>
                <td className="px-4 py-3 text-white/60">차분한, 릴렉스</td>
                <td className="px-4 py-3 text-white/80">7원</td>
                <td className="px-4 py-3 text-white/80">{(1000+i*3).toLocaleString()}회</td>
                <td className="px-4 py-3 text-white/80">1000토큰</td>
                <td className="px-4 py-3 text-white/80">0.007토큰</td>
                <td className="px-4 py-3 text-white/60">2024.01.15</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button className="rounded bg-teal-600/90 px-2 py-1 text-xs text-white hover:bg-teal-500">수정</button>
                    <button className="rounded border border-white/15 bg-white/5 px-2 py-1 text-xs text-white hover:bg-white/10">삭제</button>
                    <button className="rounded bg-teal-600/90 px-2 py-1 text-xs text-white hover:bg-teal-500">통계</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      <div className="flex items-center justify-between text-sm text-white/70">
        <div>
          페이지당
          <select className="mx-2 rounded bg-black/40 px-2 py-1 outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-teal-400/60">
            <option>50</option>
            <option>25</option>
            <option>10</option>
            <option>100</option>
          </select>
          개 보기
        </div>
        <div className="space-x-1">
          <button className="rounded border border-white/15 bg-white/5 px-2 py-1 hover:bg-white/10">처음</button>
          <button className="rounded border border-white/15 bg-white/5 px-2 py-1 hover:bg-white/10">이전</button>
          <span className="px-2">1 / 25</span>
          <button className="rounded bg-teal-600/90 px-2 py-1 text-white hover:bg-teal-500">다음</button>
          <button className="rounded bg-teal-600/90 px-2 py-1 text-white hover:bg-teal-500">끝</button>
        </div>
      </div>
    </div>
  )
} 