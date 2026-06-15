'use client'
import Image from 'next/image'
import Link from 'next/link'

const SECTIONS = [
  { href: '/beats', label: 'Beats for Sale', desc: 'MP3 & WAV leases. Premium cookups.', color: '#8BFF00' },
  { href: '/free', label: 'Free Section', desc: 'On the house. Still bananaz.', color: '#00BFFF' },
  { href: '/lab', label: 'In The Lab', desc: 'Latest drops hot off the MPC.', color: '#FF1744' },
  { href: '/tapes', label: 'Beat Tapes', desc: 'Full projects, full vibes.', color: '#9B27FF' },
  { href: '/produced-by', label: 'Produced By TBIB', desc: 'My credits. Artists who ate.', color: '#C0C0C0' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative flex flex-col items-center justify-center pt-16 pb-12 px-4 overflow-hidden">
        {/* BG glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#8BFF00] opacity-[0.04] rounded-full blur-3xl" />
          <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-[#FF1744] opacity-[0.03] rounded-full blur-3xl" />
        </div>

        <div className="logo-glow mb-6">
          <Image
            src="/logo.png"
            alt="ThisBeatIzBananaz"
            width={160}
            height={160}
            className="rounded-full"
            priority
          />
        </div>

        <h1 className="text-3xl md:text-5xl font-black text-center leading-none mb-3">
          <span className="text-white">THIS BEAT</span>{' '}
          <span className="text-[#8BFF00]" style={{ textShadow: '0 0 30px #8BFF0066' }}>
            IZ BANANAZ
          </span>
        </h1>
        <p className="text-gray-500 text-sm text-center max-w-sm mb-8">
          Beats so hard they're a health hazard. Shop, listen, grab.
        </p>

        <Link
          href="/beats"
          className="btn-banana px-8 py-3 rounded-full text-sm font-black uppercase tracking-widest"
        >
          Shop Beats
        </Link>
      </div>

      {/* Section divider */}
      <div className="section-divider mx-8 mb-10" />

      {/* Section grid */}
      <div className="max-w-6xl mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SECTIONS.map(({ href, label, desc, color }) => (
            <Link
              key={href}
              href={href}
              className="group relative bg-[#0a0a0a] border border-[#1a1a1a] hover:border-[#333] rounded-xl p-5 transition-all duration-300 hover:-translate-y-1"
              style={{ '--section-color': color } as React.CSSProperties}
            >
              <div
                className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl opacity-60 group-hover:opacity-100 transition-opacity"
                style={{ background: color }}
              />
              <h2
                className="font-black text-base mb-1 group-hover:drop-shadow-sm transition-all"
                style={{ color }}
              >
                {label}
              </h2>
              <p className="text-gray-500 text-xs">{desc}</p>
              <div className="mt-4 text-xs text-gray-600 group-hover:text-gray-400 transition-colors font-medium">
                Enter →
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
