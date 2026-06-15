import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) return NextResponse.json({ error: 'No token' }, { status: 400 })

  const { data: purchase } = await supabase
    .from('purchases')
    .select('*, beats(*)')
    .eq('download_token', token)
    .single()

  if (!purchase) return NextResponse.json({ error: 'Invalid token' }, { status: 404 })

  const expiry = new Date(purchase.token_expires_at)
  if (expiry < new Date()) {
    return NextResponse.json({ error: 'Download link expired' }, { status: 410 })
  }

  // Return the mp3 url for redirect
  const beat = purchase.beats
  if (!beat?.mp3_url) return NextResponse.json({ error: 'File not found' }, { status: 404 })

  return NextResponse.redirect(beat.mp3_url)
}
