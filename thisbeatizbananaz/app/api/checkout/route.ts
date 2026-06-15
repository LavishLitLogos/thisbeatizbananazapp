import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getStripe() {
  const stripeKey = process.env.STRIPE_SECRET_KEY

  if (!stripeKey) {
    throw new Error('Missing STRIPE_SECRET_KEY')
  }

  return new Stripe(stripeKey, {
    apiVersion: '2026-05-27.dahlia',
  })
}

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, supabaseAnonKey)
}

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripe()
    const supabase = getSupabase()

    const { beatId, beatTapeId, licenseType } = await req.json()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    let beat: any = null
    let tape: any = null
    let unitAmount: number
    let productName: string
    const metadata: Record<string, string> = {
      licenseType: licenseType || 'standard',
    }

    if (beatId) {
      const { data, error } = await supabase
        .from('beats')
        .select('*')
        .eq('id', beatId)
        .single()

      if (error) {
        throw new Error(error.message)
      }

      beat = data

      if (!beat) {
        return NextResponse.json({ error: 'Beat not found' }, { status: 404 })
      }

      if (licenseType === 'mp3_lease') {
        unitAmount = Math.round(Number(beat.mp3_price) * 100)
        productName = `${beat.title} — MP3 Lease`
      } else {
        unitAmount = Math.round(Number(beat.wav_price) * 100)
        productName = `${beat.title} — MP3 + WAV Lease`
      }

      metadata.beatId = String(beatId)
    } else if (beatTapeId) {
      const { data, error } = await supabase
        .from('beat_tapes')
        .select('*')
        .eq('id', beatTapeId)
        .single()

      if (error) {
        throw new Error(error.message)
      }

      tape = data

      if (!tape) {
        return NextResponse.json({ error: 'Tape not found' }, { status: 404 })
      }

      unitAmount = Math.round(Number(tape.price) * 100)
      productName = `${tape.title} — Beat Tape`
      metadata.beatTapeId = String(beatTapeId)
    } else {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    }

    if (!unitAmount || unitAmount < 50) {
      return NextResponse.json(
        { error: 'Invalid product price' },
        { status: 400 }
      )
    }

    const imageUrl = beat?.cover_url || tape?.cover_url
    const needsEmail = licenseType === 'mp3_wav_lease'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'cashapp'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: productName,
              ...(imageUrl ? { images: [imageUrl] } : {}),
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/beats`,
      metadata,
      ...(needsEmail ? { customer_creation: 'always' } : {}),
    })

    return NextResponse.json({ url: session.url })
  } catch (e: any) {
    console.error('Checkout error:', e)
    return NextResponse.json(
      { error: e?.message || 'Checkout failed' },
      { status: 500 }
    )
  }
}