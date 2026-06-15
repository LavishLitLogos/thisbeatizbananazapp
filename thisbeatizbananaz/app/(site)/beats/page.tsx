'use client'
import { useEffect, useState } from 'react'
import { supabase, Beat } from '@/lib/supabase'
import BeatCard from '@/components/BeatCard'
import { useAdminStore } from '@/lib/adminStore'

export default function BeatsPage() {
  const [beats, setBeats] = useState<Beat[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const { isAdmin } = useAdminStore()

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('beats')
        .select('*')
        .eq('section', 'beats_for_sale')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
      setBeats(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = filter
    ? beats.filter(b =>
        b.title.toLowerCase().includes(filter.toLowerCase()) ||
        b.tags?.some(t => t.toLowerCase().includes(filter.toLowerCase()))
      )
    : beats

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Beats for Sale</h1>
          <p className="text-gray-500 text-xs mt-0.5">{beats.length} tracks available</p>
        </div>
        <input
          value={filter}
          onChange={e => setFilter(e.target.value)}
          placeholder="Search..."
          className="bg-[#111] border border-[#222] rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#8BFF00] w-40 transition-colors"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-square rounded-xl bg-[#0a0a0a] animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-600">
          {filter ? 'No beats match that search.' : 'No beats yet. Check back soon.'}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((beat) => (
            <BeatCard
              key={beat.id}
              beat={beat}
              queue={filtered}
              showAdminControls={isAdmin}
            />
          ))}
        </div>
      )}
    </div>
  )
}
