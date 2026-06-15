'use client'
import Image from 'next/image'
import { usePlayerStore } from '@/lib/playerStore'
import EQVisualizer from './EQVisualizer'

export default function PlayerBar() {
  const { currentBeat, isPlaying, currentTime, duration, pause, resume, stop, skip, setCurrentTime } = usePlayerStore()

  if (!currentBeat) return null

  const pct = duration > 0 ? (currentTime / duration) * 100 : 0

  const fmt = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <div className="player-bar fixed bottom-0 left-0 right-0 z-50 pb-safe">
      {/* Progress bar */}
      <div
        className="w-full h-1 bg-[#1a1a1a] cursor-pointer"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          const pct = (e.clientX - rect.left) / rect.width
          setCurrentTime(pct * duration)
        }}
      >
        <div
          className="h-full bg-[#8BFF00] transition-all"
          style={{ width: `${pct}%`, boxShadow: '0 0 8px #8BFF00' }}
        />
      </div>

      <div className="flex items-center gap-3 px-4 py-3">
        {/* Cover */}
        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-[#111] shrink-0">
          {currentBeat.cover_url ? (
            <Image src={currentBeat.cover_url} alt={currentBeat.title} fill className="object-cover" />
          ) : (
            <Image src="/logo.png" alt="TBIB" fill className="object-contain p-1 opacity-50" />
          )}
        </div>

        {/* Info + EQ */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold truncate">{currentBeat.title}</span>
            <EQVisualizer size="sm" />
          </div>
          <div className="text-[10px] text-gray-500">
            {fmt(currentTime)} / {fmt(duration)}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={isPlaying ? pause : resume}
            className="hover:scale-110 transition-transform"
          >
            <Image
              src={isPlaying ? '/pause-icon.png' : '/play-icon.png'}
              alt={isPlaying ? 'Pause' : 'Play'}
              width={32}
              height={32}
            />
          </button>
          <button onClick={skip} className="hover:scale-110 transition-transform opacity-70 hover:opacity-100">
            <Image src="/skip-icon.png" alt="Skip" width={28} height={28} />
          </button>
          <button
            onClick={stop}
            className="text-gray-500 hover:text-red-400 transition-colors text-lg font-bold leading-none"
            title="Stop"
          >
            ■
          </button>
        </div>
      </div>
    </div>
  )
}
