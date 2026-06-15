'use client'
import { useEffect, useState } from 'react'
import { supabase, BeatTape } from '@/lib/supabase'
import BeatTapeCard from '@/components/BeatTapeCard'
import { useAdminStore } from '@/lib/adminStore'

export default function TapesPage() {
  const [tapes, setTapes] = useState<BeatTape[]>([])
  const [loading, setLoading] = useState(true)
  const { isAdmin } = useAdminStore()

  useEffect(() => {
    const load = async () => {
      const { data: tapesData } = await supabase
        .from('beat_tapes')
        .select('*, beat_tape_tracks(order_index, beats(*))')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (tapesData) {
        const formatted = tapesData.map((t: any) => ({
          ...t,
          tracks: (t.beat_tape_tracks || [])
            .sort((a: any, b: any) => a.order_index - b.order_index)
            .map((tr: any) => tr.beats)
            .filter(Boolean),
        }))
        setTapes(formatted)
      }
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-[#9B27FF]">Beat Tapes</h1>
        <p className="text-gray-500 text-xs mt-0.5">Full projects. Front to back.</p>
      </div>
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-28 rounded-xl bg-[#0a0a0a] animate-pulse" />)}
        </div>
      ) : tapes.length === 0 ? (
        <div className="text-center py-20 text-gray-600">No tapes yet.</div>
      ) : (
        <div className="space-y-4">
          {tapes.map(tape => (
            <BeatTapeCard key={tape.id} tape={tape} showAdminControls={isAdmin} />
          ))}
        </div>
      )}
    </div>
  )
}
