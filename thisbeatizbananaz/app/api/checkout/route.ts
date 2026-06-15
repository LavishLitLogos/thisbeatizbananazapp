import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-05-27.dahlia' })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { beatId, beatTapeId, licenseType } = await req.json()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    let beat: any = null
    let tape: any = null
    let unitAmount: number
    let productName: string
    let metadata: Record<string, string> = { licenseType }

    if (beatId) {
      const { data } = await supabase.from('beats').select('*').eq('id', beatId).single()
      beat = data
      if (!beat) return NextResponse.json({ error: 'Beat not found' }, { status: 404 })

      if (licenseType === 'mp3_lease') {
        unitAmount = beat.mp3_price * 100
        productName = `${beat.title} — MP3 Lease`
      } else {
        unitAmount = beat.wav_price * 100
        productName = `${beat.title} — MP3 + WAV Lease`
      }
      metadata.beatId = beatId
    } else if (beatTapeId) {
      const { data } = await supabase.from('beat_tapes').select('*').eq('id', beatTapeId).single()
      tape = data
      if (!tape) return NextResponse.json({ error: 'Tape not found' }, { status: 404 })
      unitAmount = tape.price * 100
      productName = `${tape.title} — Beat Tape`
      metadata.beatTapeId = beatTapeId
    } else {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    }

    const needsEmail = licenseType === 'mp3_wav_lease'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'cashapp'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: productName, images: [beat?.cover_url || tape?.cover_url].filter(Boolean) },
          unit_amount: unitAmount,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/beats`,
      metadata,
      ...(needsEmail ? { customer_creation: 'always' } : {}),
    })

    return NextResponse.json({ url: session.url })
  } catch (e: any) {
    console.error(e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
