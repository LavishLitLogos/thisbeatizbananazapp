'use client'
import Image from 'next/image'
import { useState } from 'react'
import { usePlayerStore } from '@/lib/playerStore'
import { Beat } from '@/lib/supabase'
import EQVisualizer from './EQVisualizer'
import toast from 'react-hot-toast'

interface BeatCardProps {
  beat: Beat
  queue?: Beat[]
  index?: number
  showAdminControls?: boolean
  onEdit?: (beat: Beat) => void
  onDelete?: (beat: Beat) => void
}

export default function BeatCard({ beat, queue = [], showAdminControls, onEdit, onDelete }: BeatCardProps) {
  const { currentBeat, isPlaying, play, pause, resume } = usePlayerStore()
  const [showWav, setShowWav] = useState(false)
  const [loadingStripe, setLoadingStripe] = useState<string | null>(null)

  const isCurrentBeat = currentBeat?.id === beat.id
  const isThisPlaying = isCurrentBeat && isPlaying

  const handlePlay = () => {
    if (isCurrentBeat) {
      isPlaying ? pause() : resume()
    } else {
      play(beat, queue.filter(b => b.id !== beat.id))
    }
  }

  const handleBuy = async (licenseType: 'mp3_lease' | 'mp3_wav_lease') => {
    setLoadingStripe(licenseType)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ beatId: beat.id, licenseType }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        toast.error('Checkout failed. Try again.')
      }
    } catch {
      toast.error('Something went wrong.')
    } finally {
      setLoadingStripe(null)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: beat.title, url: window.location.href })
    } else {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied!')
    }
  }

  return (
    <div
      className={`beat-card relative bg-[#0a0a0a] rounded-xl overflow-hidden border transition-all duration-300 card-in ${
        isCurrentBeat
          ? 'border-[#8BFF00] shadow-[0_0_20px_#8BFF0033]'
          : 'border-[#1a1a1a] hover:border-[#333]'
      }`}
      style={{ animationDelay: '0ms' }}
    >
      {/* Cover Art */}
      <div className="relative aspect-square w-full bg-[#111] overflow-hidden">
        {beat.cover_url ? (
          <Image src={beat.cover_url} alt={beat.title} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Image src="/logo.png" alt="TBIB" width={80} height={80} className="opacity-20" />
          </div>
        )}

        {/* Play overlay */}
        <div className="beat-card-overlay absolute inset-0 bg-black/60 flex items-center justify-center">
          <button
            onClick={handlePlay}
            className="w-14 h-14 flex items-center justify-center hover:scale-110 transition-transform"
          >
            <Image
              src={isThisPlaying ? '/pause-icon.png' : '/play-icon.png'}
              alt={isThisPlaying ? 'Pause' : 'Play'}
              width={56}
              height={56}
              className="drop-shadow-lg"
            />
          </button>
        </div>

        {/* Playing indicator top-right */}
        {isCurrentBeat && (
          <div className="absolute top-2 right-2">
            <EQVisualizer size="sm" />
          </div>
        )}

        {/* Section badge */}
        {beat.section === 'free' && (
          <div className="absolute top-2 left-2 bg-[#8BFF00] text-black text-[10px] font-black px-2 py-0.5 rounded uppercase">
            FREE
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-bold text-sm truncate text-white">{beat.title}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              {beat.bpm && <span className="text-[10px] text-gray-500">{beat.bpm} BPM</span>}
              {beat.key && <span className="text-[10px] text-gray-500">{beat.key}</span>}
            </div>
          </div>
          {beat.section === 'beats_for_sale' && (
            <div className="shrink-0 text-right">
              <div className="text-[#8BFF00] font-black text-sm">
                <span className="text-[10px] text-gray-400 font-normal">MP3 </span>
                ${beat.mp3_price}
              </div>
            </div>
          )}
        </div>

        {/* Tags */}
        {beat.tags && beat.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {beat.tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-[#1a1a1a] text-gray-400">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="pt-1 space-y-2">
          {/* Play button row */}
          <div className="flex gap-2">
            <button
              onClick={handlePlay}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#111] hover:bg-[#1a1a1a] border border-[#222] hover:border-[#8BFF00] transition-all text-xs font-semibold"
            >
              <Image
                src={isThisPlaying ? '/pause-icon.png' : '/play-icon.png'}
                alt="play"
                width={16}
                height={16}
              />
              {isThisPlaying ? 'Pause' : 'Play'}
              {isCurrentBeat && <EQVisualizer size="sm" color="#8BFF00" />}
            </button>

            <button
              onClick={handleShare}
              className="px-3 py-2 rounded-lg bg-[#111] hover:bg-[#1a1a1a] border border-[#222] hover:border-[#333] transition-all text-xs"
              title="Share"
            >
              ↗
            </button>
          </div>

          {/* Buy section */}
          {beat.section === 'beats_for_sale' && (
            <div className="space-y-1.5">
              <button
                onClick={() => handleBuy('mp3_lease')}
                disabled={loadingStripe === 'mp3_lease'}
                className="w-full btn-banana py-2 rounded-lg text-xs font-black uppercase tracking-wide disabled:opacity-50"
              >
                {loadingStripe === 'mp3_lease' ? '...' : `Buy MP3 — $${beat.mp3_price}`}
              </button>

              {beat.license_type === 'mp3_wav_lease' && (
                <>
                  {!showWav ? (
                    <button
                      onClick={() => setShowWav(true)}
                      className="w-full py-1.5 text-[10px] text-gray-500 hover:text-[#8BFF00] transition-colors underline"
                    >
                      See more options
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBuy('mp3_wav_lease')}
                      disabled={loadingStripe === 'mp3_wav_lease'}
                      className="w-full py-2 rounded-lg border border-[#9B27FF] text-[#9B27FF] hover:bg-[#9B27FF] hover:text-white transition-all text-xs font-black uppercase tracking-wide disabled:opacity-50"
                    >
                      {loadingStripe === 'mp3_wav_lease' ? '...' : `MP3 + WAV — $${beat.wav_price}`}
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          {beat.section === 'free' && (
            <a
              href={beat.mp3_url}
              download
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg btn-banana text-xs font-black uppercase tracking-wide"
            >
              <Image src="/grab-icon.png" alt="download" width={16} height={16} />
              Grab It Free
            </a>
          )}
        </div>

        {/* Admin controls */}
        {showAdminControls && (
          <div className="flex gap-2 pt-1 border-t border-[#1a1a1a]">
            <button
              onClick={() => onEdit?.(beat)}
              className="flex-1 text-[10px] py-1 rounded bg-[#1a1a1a] hover:bg-[#222] text-gray-400 hover:text-white transition"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete?.(beat)}
              className="flex-1 text-[10px] py-1 rounded bg-[#1a1a1a] hover:bg-red-900 text-gray-400 hover:text-red-400 transition"
            >
              Delete
            </button>
            <div className="flex-1 text-center text-[10px] py-1 text-gray-600">
              {beat.purchase_count} sold
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
