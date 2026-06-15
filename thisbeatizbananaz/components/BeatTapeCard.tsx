'use client'
import Image from 'next/image'
import { useState } from 'react'
import { BeatTape } from '@/lib/supabase'
import { usePlayerStore } from '@/lib/playerStore'
import EQVisualizer from './EQVisualizer'
import toast from 'react-hot-toast'

interface BeatTapeCardProps {
  tape: BeatTape
  showAdminControls?: boolean
  onEdit?: (tape: BeatTape) => void
  onDelete?: (tape: BeatTape) => void
}

export default function BeatTapeCard({ tape, showAdminControls, onEdit, onDelete }: BeatTapeCardProps) {
  const { currentBeat, isPlaying, play } = usePlayerStore()
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState(false)

  const isAnyTrackPlaying = tape.tracks?.some(t => t.id === currentBeat?.id) && isPlaying

  const handlePlayAll = () => {
    if (tape.tracks?.length > 0) {
      play(tape.tracks[0], tape.tracks.slice(1))
    }
  }

  const handleBuy = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ beatTapeId: tape.id, licenseType: 'beattape' }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else toast.error('Checkout failed.')
    } catch {
      toast.error('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] hover:border-[#8BFF0033] rounded-xl overflow-hidden transition-all duration-300 card-in">
      <div className="flex gap-3 p-3">
        {/* Cover */}
        <div className="relative w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-[#111]">
          {tape.cover_url ? (
            <Image src={tape.cover_url} alt={tape.title} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Image src="/beattapes.png" alt="Beat Tape" width={60} height={60} className="object-contain" />
            </div>
          )}
          <button
            onClick={handlePlayAll}
            className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity"
          >
            <Image src="/play-icon.png" alt="Play" width={36} height={36} />
          </button>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-sm truncate">{tape.title}</h3>
              {isAnyTrackPlaying && <EQVisualizer size="sm" />}
            </div>
            {tape.description && (
              <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">{tape.description}</p>
            )}
            <p className="text-[11px] text-gray-600 mt-1">{tape.tracks?.length || 0} tracks</p>
          </div>

          <div className="flex items-center gap-2 mt-2">
            {tape.is_free || tape.price === 0 ? (
              <button
                onClick={handlePlayAll}
                className="flex-1 btn-banana py-1.5 rounded-lg text-xs font-black uppercase"
              >
                Play Free
              </button>
            ) : (
              <button
                onClick={handleBuy}
                disabled={loading}
                className="flex-1 btn-banana py-1.5 rounded-lg text-xs font-black uppercase disabled:opacity-50"
              >
                {loading ? '...' : `$${tape.price} — Buy`}
              </button>
            )}
            <button
              onClick={() => setExpanded(!expanded)}
              className="px-3 py-1.5 rounded-lg border border-[#222] text-xs hover:border-[#8BFF00] transition-colors"
            >
              {expanded ? '▲' : '▼'}
            </button>
          </div>
        </div>
      </div>

      {/* Track list */}
      {expanded && tape.tracks?.length > 0 && (
        <div className="border-t border-[#1a1a1a] px-3 py-2 space-y-1">
          {tape.tracks.map((track, i) => {
            const isPlaying2 = currentBeat?.id === track.id && isPlaying
            return (
              <div
                key={track.id}
                className="flex items-center gap-2 py-1.5 hover:bg-[#111] rounded px-2 cursor-pointer group"
                onClick={() => play(track, tape.tracks.slice(i + 1))}
              >
                <span className="text-[10px] text-gray-600 w-4">{i + 1}</span>
                <span className="flex-1 text-xs truncate text-gray-300 group-hover:text-white transition-colors">
                  {track.title}
                </span>
                {isPlaying2 ? (
                  <EQVisualizer size="sm" />
                ) : (
                  <Image src="/play-icon.png" alt="play" width={14} height={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
                {track.bpm && <span className="text-[9px] text-gray-600">{track.bpm}</span>}
              </div>
            )
          })}
        </div>
      )}

      {showAdminControls && (
        <div className="flex gap-2 p-3 border-t border-[#1a1a1a]">
          <button onClick={() => onEdit?.(tape)} className="flex-1 text-[10px] py-1 rounded bg-[#1a1a1a] text-gray-400 hover:text-white">Edit</button>
          <button onClick={() => onDelete?.(tape)} className="flex-1 text-[10px] py-1 rounded bg-[#1a1a1a] text-gray-400 hover:text-red-400">Delete</button>
        </div>
      )}
    </div>
  )
}
