'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import axios from 'axios'
import { useState } from 'react'

const DASHBOARD = { href: '/admin/dashboard', label: '대시보드' }

const MUSIC_GROUP = {
  label: '음원 관리',
  items: [
    { href: '/admin/musics', label: '음원 목록' },
    { href: '/admin/musics/new', label: '음원 등록' },
    { href: '/admin/musics/categories', label: '카테고리 관리' },
  ],
}

export default function Sidebar() {
  const pathname = usePathname()
  const [openMusic, setOpenMusic] = useState(true)

  async function logout() {
    const response = await axios.post('/api/logout')
    console.log(response)
    location.href = '/admin'
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-60 border-r border-white/10 bg-neutral-900/80 text-white backdrop-blur-md p-4 flex flex-col">
      <div className="mb-4 px-3 text-sm font-semibold tracking-wide text-white/80">Admin</div>

      <nav className="space-y-2 text-sm">
        <Link
          href={DASHBOARD.href}
          className={`block rounded px-3 py-2 ${isActive(DASHBOARD.href) ? 'bg-white/10 text-white' : 'text-white/70 hover:text-white hover:bg-white/5'}`}
        >
          {DASHBOARD.label}
        </Link>

        <div>
          <button
            className="flex w-full items-center justify-between rounded px-3 py-2 text-left text-white/70 hover:text-white hover:bg-white/5"
            onClick={() => setOpenMusic((v) => !v)}
            aria-expanded={openMusic}
          >
            <span>{MUSIC_GROUP.label}</span>
            <span className="text-xs">{openMusic ? '▾' : '▸'}</span>
          </button>
          {openMusic && (
            <div className="mt-1 space-y-1 pl-3">
              {MUSIC_GROUP.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded px-3 py-2 ${isActive(item.href) ? 'bg-white/10 text-white' : 'text-white/70 hover:text-white hover:bg-white/5'}`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>

      <div className="mt-auto border-t border-white/10 pt-4">
        <button onClick={logout} className="w-full rounded bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/15"> 로그아웃 </button>
      </div>
    </aside>
  )
} 