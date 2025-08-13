'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import axios from 'axios'

const ITEMS = [
  { href: '/admin/dashboard', label: '대시보드' },
]

export default function Sidebar() {
  const pathname = usePathname()

  async function logout() {
    const response = await axios.post('/api/logout')
    console.log(response)
    location.href = '/admin'
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-60 border-r border-white/10 bg-neutral-900/80 text-white backdrop-blur-md p-4 flex flex-col">
      <div className="mb-4 px-3 text-sm font-semibold tracking-wide text-white/80">Admin</div>

      <nav className="space-y-1 text-sm">
        {ITEMS.map(item => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded px-3 py-2 ${active ? 'bg-white/10 text-white' : 'text-white/70 hover:text-white hover:bg-white/5'}`}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto border-t border-white/10 pt-4">
        <button onClick={logout} className="w-full rounded bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/15"> 로그아웃 </button>
      </div>
    </aside>
  )
} 