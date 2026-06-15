'use client'
import { useEffect, useState } from 'react'
import { supabase, Beat } from '@/lib/supabase'
import BeatCard from '@/components/BeatCard'
import { useAdminStore } from '@/lib/adminStore'

export default function LabPage() {
  const [beats, setBeats] = useState<Beat[]>([])
  const [loading, setLoading] = useState(true)
  const { isAdmin } = useAdminStore()

  useEffect(() => {
    // In The Lab = most recent uploads across all sections + in_the_lab section
    supabase
      .from('beats')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => { setBeats(data || []); setLoading(false) })
  }, [])

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-[#FF1744] animate-pulse" />
          <h1 className="text-2xl font-black text-[#FF1744]">In The Lab</h1>
        </div>
        <p className="text-gray-500 text-xs">Latest cookups. Fresh off the board.</p>
      </div>
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="aspect-square rounded-xl bg-[#0a0a0a] animate-pulse" />)}
        </div>
      ) : beats.length === 0 ? (
        <div className="text-center py-20 text-gray-600">Nothing cooking yet.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {beats.map(beat => <BeatCard key={beat.id} beat={beat} queue={beats} showAdminControls={isAdmin} />)}
        </div>
      )}
    </div>
  )
}
