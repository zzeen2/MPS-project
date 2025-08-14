'use client'

import Card from '@/components/ui/Card'

export default function MusicCategoriesPage() {
  const main = [
    { name: 'Pop', count: 234 },
    { name: 'Rock', count: 156 },
    { name: 'Jazz', count: 89 },
  ]
  const sub = [
    { path: 'Pop > K-Pop', count: 123 },
    { path: 'Pop > J-Pop', count: 45 },
    { path: 'Rock > Hard Rock', count: 67 },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <div className="mb-3 text-sm font-semibold">장르 관리</div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <div className="mb-2 text-sm text-white/70">메인 장르</div>
            <ul className="space-y-2 text-sm">
              {main.map((m, i) => (
                <li key={i} className="flex items-center justify-between rounded border border-white/10 bg-white/5 px-3 py-2 text-white/90">
                  <span>{m.name}</span>
                  <span className="text-white/70">음원 {m.count}개</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="mb-2 text-sm text-white/70">서브 장르</div>
            <ul className="space-y-2 text-sm">
              {sub.map((s, i) => (
                <li key={i} className="flex items-center justify-between rounded border border-white/10 bg-white/5 px-3 py-2 text-white/90">
                  <span>{s.path}</span>
                  <span className="text-white/70">음원 {s.count}개</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
} 