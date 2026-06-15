import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, supabaseKey)
}

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabase()

    const token = req.nextUrl.searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'No token' }, { status: 400 })
    }

    const { data: purchase, error } = await supabase
      .from('purchases')
      .select('*, beats(*)')
      .eq('download_token', token)
      .single()

    if (error || !purchase) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 404 })
    }

    const expiry = new Date(purchase.token_expires_at)

    if (expiry < new Date()) {
      return NextResponse.json({ error: 'Download link expired' }, { status: 410 })
    }

    const beat = purchase.beats

    if (!beat?.mp3_url) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    return NextResponse.redirect(beat.mp3_url)
  } catch (e: any) {
    console.error('Download error:', e)

    return NextResponse.json(
      { error: e?.message || 'Download failed' },
      { status: 500 }
    )
  }
}