'use client'
import { useEffect, useState } from 'react'
import { supabase, Beat } from '@/lib/supabase'
import BeatCard from '@/components/BeatCard'
import { useAdminStore } from '@/lib/adminStore'

export default function ProducedByPage() {
  const [credits, setCredits] = useState<Beat[]>([])
  const [loading, setLoading] = useState(true)
  const { isAdmin } = useAdminStore()

  useEffect(() => {
    supabase
      .from('beats')
      .select('*')
      .eq('section', 'produced_by')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setCredits(data || []); setLoading(false) })
  }, [])

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-[#C0C0C0]">Produced By ThisBeatIzBananaz</h1>
        <p className="text-gray-500 text-xs mt-0.5">Artists who cooked with the sauce.</p>
      </div>
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="aspect-square rounded-xl bg-[#0a0a0a] animate-pulse" />)}
        </div>
      ) : credits.length === 0 ? (
        <div className="text-center py-20 text-gray-600">Credits coming soon.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {credits.map(beat => <BeatCard key={beat.id} beat={beat} queue={credits} showAdminControls={isAdmin} />)}
        </div>
      )}
    </div>
  )
}
