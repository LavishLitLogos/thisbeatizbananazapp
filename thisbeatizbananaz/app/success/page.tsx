'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

function SuccessContent() {
  const params = useSearchParams()
  const sessionId = params.get('session_id')
  const [purchase, setPurchase] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [downloaded, setDownloaded] = useState(false)

  useEffect(() => {
    if (!sessionId) { setLoading(false); return }
    fetch(`/api/purchase-info?session_id=${sessionId}`)
      .then(r => r.json())
      .then(data => { setPurchase(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [sessionId])

  const handleDownload = () => {
    if (purchase?.download_token) {
      window.location.href = `/api/download?token=${purchase.download_token}`
      setDownloaded(true)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <div className="logo-glow mb-6">
        <Image src="/logo.png" alt="TBIB" width={100} height={100} className="rounded-full" />
      </div>

      {loading ? (
        <div className="text-gray-500 text-sm">Loading...</div>
      ) : (
        <div className="max-w-sm w-full space-y-6">
          <div>
            <h1 className="text-3xl font-black text-[#8BFF00] mb-2">PAYMENT APPROVED!</h1>
            <p className="text-gray-400 text-sm">You got heat to cook with.</p>
          </div>

          {purchase?.license_type === 'mp3_lease' && purchase?.download_token && !downloaded && (
            <button
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-3 btn-banana py-4 rounded-xl font-black uppercase tracking-wide"
            >
              <Image src="/grab-icon.png" alt="download" width={24} height={24} />
              Download Your MP3
            </button>
          )}

          {downloaded && (
            <div className="bg-[#0a0a0a] border border-[#8BFF0044] rounded-xl p-5 text-left space-y-3">
              <div className="text-[#8BFF00] font-black text-sm">✓ Download started!</div>
              <p className="text-gray-400 text-xs leading-relaxed">
                thanks for shopping, you got heat to cook up! all i ask is you drop
                {' '}<span className="text-[#8BFF00] font-bold">'prod. by ThisBeatIzBananaz'</span>{' '}
                with the song, whenever you drop it! oh, and keep checking back for more cookups!
              </p>
            </div>
          )}

          {purchase?.license_type === 'mp3_wav_lease' && (
            <div className="bg-[#0a0a0a] border border-[#9B27FF44] rounded-xl p-5 text-left">
              <div className="text-[#9B27FF] font-black text-sm mb-2">WAV Incoming!</div>
              <p className="text-gray-400 text-xs leading-relaxed">
                Your WAV file is on the way. The owner has been notified with your email and will send the WAV file shortly. Check your inbox!
              </p>
            </div>
          )}

          <Link href="/beats" className="block text-xs text-gray-600 hover:text-gray-400 transition underline">
            Back to the shop →
          </Link>
        </div>
      )}
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  )
}
