'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useAdminStore } from '@/lib/adminStore'
import { useState } from 'react'
import EQVisualizer from './EQVisualizer'
import { usePlayerStore } from '@/lib/playerStore'

const NAV_LINKS = [
  { href: '/beats', label: 'Beats' },
  { href: '/free', label: 'Free' },
  { href: '/lab', label: 'In The Lab' },
  { href: '/tapes', label: 'Beat Tapes' },
  { href: '/produced-by', label: 'Produced By' },
]

export default function Nav() {
  const pathname = usePathname()
  const { isAdmin, logout } = useAdminStore()
  const { eqActive } = usePlayerStore()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-40 bg-black/90 backdrop-blur-md border-b border-[#1a1a1a]">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="shrink-0">
          <div className="flex items-center gap-2">
            <div className="logo-glow">
              <Image src="/logo.png" alt="ThisBeatIzBananaz" width={40} height={40} className="rounded-full" />
            </div>
            {eqActive && <EQVisualizer size="sm" color="#8BFF00" />}
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors rounded ${
                  active
                    ? 'text-[#8BFF00] bg-[#8BFF0011]'
                    : 'text-gray-400 hover:text-white hover:bg-[#111]'
                }`}
              >
                {label}
              </Link>
            )
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {isAdmin ? (
            <div className="flex items-center gap-2">
              <Link
                href="/admin"
                className="text-[10px] px-3 py-1.5 rounded bg-[#8BFF00] text-black font-black uppercase tracking-wide hover:bg-white transition"
              >
                Admin
              </Link>
              <button
                onClick={logout}
                className="text-[10px] text-gray-500 hover:text-red-400 transition"
              >
                Out
              </button>
            </div>
          ) : (
            <Link
              href="/admin"
              className="text-[10px] text-gray-600 hover:text-gray-400 transition"
            >
              ·
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-gray-400 hover:text-white"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-[#1a1a1a] bg-black/95">
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`block px-4 py-3 text-sm font-bold uppercase tracking-wide border-b border-[#0a0a0a] transition-colors ${
                  active ? 'text-[#8BFF00] bg-[#8BFF0008]' : 'text-gray-400 hover:text-white'
                }`}
              >
                {label}
              </Link>
            )
          })}
        </div>
      )}
    </nav>
  )
}
