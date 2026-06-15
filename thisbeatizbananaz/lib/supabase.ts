import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Beat = {
  id: string
  title: string
  bpm?: number
  key?: string
  tags?: string[]
  section: 'beats_for_sale' | 'free' | 'in_the_lab' | 'produced_by'
  license_type?: 'mp3_lease' | 'mp3_wav_lease' | 'free'
  mp3_price: number
  wav_price: number
  mp3_url: string
  wav_url?: string
  cover_url?: string
  purchase_count: number
  created_at: string
  is_active: boolean
}

export type BeatTape = {
  id: string
  title: string
  description?: string
  cover_url?: string
  price: number
  is_free: boolean
  tracks: Beat[]
  created_at: string
  is_active: boolean
}

export type Purchase = {
  id: string
  beat_id?: string
  beattape_id?: string
  buyer_email?: string
  license_type: string
  amount_paid: number
  stripe_session_id: string
  download_token?: string
  token_expires_at?: string
  notified_owner: boolean
  created_at: string
}
