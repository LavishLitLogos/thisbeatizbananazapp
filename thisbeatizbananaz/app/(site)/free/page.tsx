'use client'
import { useEffect, useState } from 'react'
import { supabase, Beat } from '@/lib/supabase'
import BeatCard from '@/components/BeatCard'
import { useAdminStore } from '@/lib/adminStore'

export default function FreePage() {
  const [beats, setBeats] = useState<Beat[]>([])
  const [loading, setLoading] = useState(true)
  const { isAdmin } = useAdminStore()

  useEffect(() => {
    supabase
      .from('beats')
      .select('*')
      .eq('section', 'free')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setBeats(data || []); setLoading(false) })
  }, [])

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-[#00BFFF]">Free Section</h1>
        <p className="text-gray-500 text-xs mt-0.5">On the house. All I ask is credit.</p>
      </div>
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="aspect-square rounded-xl bg-[#0a0a0a] animate-pulse" />)}
        </div>
      ) : beats.length === 0 ? (
        <div className="text-center py-20 text-gray-600">Nothing free right now. Check back.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {beats.map(beat => <BeatCard key={beat.id} beat={beat} queue={beats} showAdminControls={isAdmin} />)}
        </div>
      )}
    </div>
  )
}
