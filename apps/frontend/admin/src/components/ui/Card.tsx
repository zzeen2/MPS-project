import type { ReactNode } from 'react'

type Props = { children: ReactNode; className?: string }

export default function Card({ children, className }: Props) {
  const base = 'rounded-2xl border border-white/10 bg-neutral-900/60 p-6 shadow-xl shadow-black/30 backdrop-blur-md transition-colors'
  const classes = className ? `${base} ${className}` : base
  return (
    <div className={classes}>
      {children}
    </div>
  )
} 