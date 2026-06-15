import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-05-27.dahlia' })
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Webhook signature failed' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const { beatId, beatTapeId, licenseType } = session.metadata || {}
    const buyerEmail = session.customer_details?.email || null
    const amountPaid = (session.amount_total || 0) / 100

    // Generate download token for MP3 leases
    let downloadToken: string | null = null
    let tokenExpiry: string | null = null

    if (licenseType === 'mp3_lease') {
      downloadToken = crypto.randomUUID()
      const expiry = new Date(Date.now() + 15 * 60 * 1000) // 15 min
      tokenExpiry = expiry.toISOString()
    }

    // Record purchase
    await supabase.from('purchases').insert({
      beat_id: beatId || null,
      beattape_id: beatTapeId || null,
      buyer_email: buyerEmail,
      license_type: licenseType,
      amount_paid: amountPaid,
      stripe_session_id: session.id,
      download_token: downloadToken,
      token_expires_at: tokenExpiry,
      notified_owner: false,
    })

    // Increment purchase count
    if (beatId) {
      await supabase.rpc('increment_purchase_count', { beat_id: beatId })
    }

    // Notify owner if WAV order
    if (licenseType === 'mp3_wav_lease' && buyerEmail) {
      const { data: beat } = await supabase.from('beats').select('title').eq('id', beatId).single()
      await resend.emails.send({
        from: 'TBIB <notifications@thisbeatizbananaz.com>',
        to: ['thisbeatizbananaz@gmail.com', 'supatraxxbeatz@gmail.com'],
        subject: `🔥 WAV Order — ${beat?.title || 'Unknown Beat'}`,
        html: `
          <h2>New WAV Order!</h2>
          <p><strong>Beat:</strong> ${beat?.title}</p>
          <p><strong>Buyer Email:</strong> ${buyerEmail}</p>
          <p><strong>Amount:</strong> $${amountPaid}</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          <p>Send the WAV file to ${buyerEmail} ASAP!</p>
          <br/>
          <a href="mailto:${buyerEmail}?subject=Your WAV File - ThisBeatIzBananaz&body=Hey! Here's your WAV file for ${beat?.title}. Thanks for shopping!">
            Click here to email them
          </a>
        `,
      })
      await supabase.from('purchases').update({ notified_owner: true }).eq('stripe_session_id', session.id)
    }
  }

  return NextResponse.json({ received: true })
}

