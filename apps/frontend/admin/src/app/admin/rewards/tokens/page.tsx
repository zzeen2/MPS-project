import Card from '@/components/ui/Card'

export default function RewardsTokensPage() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <div className="mb-2 text-sm font-semibold">ERC20 토큰 정보</div>
          <div className="space-y-2 text-sm text-white/80">
            <div>컨트랙트 주소: <span className="text-white">0x1234...abcd</span></div>
            <div>총 발행량: <span className="text-white">1,000,000</span> 토큰</div>
            <div>현재 유통량: <span className="text-white">876,543</span> 토큰</div>
            <div>소각된 토큰: <span className="text-white">12,345</span> 토큰</div>
            <div>가스 사용량: 평균 <span className="text-white">21,000</span> gas</div>
          </div>
        </Card>
        <Card>
          <div className="mb-2 text-sm font-semibold">자동 민팅 설정</div>
          <div className="text-sm text-white/80">번들러로 10초 단위 묶음 처리 예정</div>
          <div className="mt-3 flex items-center gap-2 text-sm">
            <label className="text-white/80">민팅 주기(초)</label>
            <input defaultValue={10} className="w-24 rounded bg-black/40 px-2 py-1 text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-teal-400/60" />
            <button className="rounded bg-teal-600/90 px-3 py-1.5 text-white hover:bg-teal-500">저장</button>
          </div>
        </Card>
      </div>

      <Card>
        <div className="mb-3 text-sm font-semibold">트랜잭션 모니터링</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-white/60">
              <tr>
                <th className="py-2 pr-4">시간</th>
                <th className="py-2 pr-4">타입</th>
                <th className="py-2 pr-4">토큰량</th>
                <th className="py-2 pr-4">수신자</th>
                <th className="py-2 pr-4">트랜잭션 해시</th>
                <th className="py-2 pr-4">상태</th>
                <th className="py-2 pr-0 text-right">가스비</th>
              </tr>
            </thead>
            <tbody>
              {[
                {time:'14:41', type:'민팅', amount:'1,234토큰', to:'Company A', hash:'0xabcd...', status:'✅성공', gas:'0.005ETH'},
                {time:'14:31', type:'민팅', amount:'567토큰', to:'Company B', hash:'0xefgh...', status:'⏳대기', gas:'-'},
              ].map((t, i)=> (
                <tr key={i} className="border-t border-white/5">
                  <td className="py-2 pr-4 text-white/80">{t.time}</td>
                  <td className="py-2 pr-4 text-white/80">{t.type}</td>
                  <td className="py-2 pr-4 text-white/80">{t.amount}</td>
                  <td className="py-2 pr-4 text-white/80">{t.to}</td>
                  <td className="py-2 pr-4 text-white/80">{t.hash}</td>
                  <td className="py-2 pr-4 text-white/80">{t.status}</td>
                  <td className="py-2 pr-0 text-right text-white/80">{t.gas}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
} 