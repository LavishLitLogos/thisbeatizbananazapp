'use client'
import { useState, useEffect } from 'react'
import { useAdminStore } from '@/lib/adminStore'
import { supabase, Beat, BeatTape } from '@/lib/supabase'
import Image from 'next/image'
import toast from 'react-hot-toast'

type Section = 'beats_for_sale' | 'free' | 'in_the_lab' | 'produced_by'
type UploadTab = 'beat' | 'tape'

export default function AdminPage() {
  const { isAdmin, login, logout } = useAdminStore()
  const [code, setCode] = useState('')
  const [loginError, setLoginError] = useState(false)

  // Beat upload state
  const [uploadTab, setUploadTab] = useState<UploadTab>('beat')
  const [beatTitle, setBeatTitle] = useState('')
  const [beatBpm, setBeatBpm] = useState('')
  const [beatKey, setBeatKey] = useState('')
  const [beatTags, setBeatTags] = useState('')
  const [beatSection, setBeatSection] = useState<Section>('beats_for_sale')
  const [licenseType, setLicenseType] = useState<'mp3_lease' | 'mp3_wav_lease' | 'free'>('mp3_lease')
  const [mp3File, setMp3File] = useState<File | null>(null)
  const [wavFile, setWavFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  // Beat tape upload state
  const [tapeTitle, setTapeTitle] = useState('')
  const [tapeDesc, setTapeDesc] = useState('')
  const [tapePrice, setTapePrice] = useState('')
  const [tapeFree, setTapeFree] = useState(false)
  const [tapeCover, setTapeCover] = useState<File | null>(null)
  const [uploadingTape, setUploadingTape] = useState(false)

  // Dashboard data
  const [beats, setBeats] = useState<Beat[]>([])
  const [wavOrders, setWavOrders] = useState<any[]>([])
  const [loadingData, setLoadingData] = useState(false)

  useEffect(() => {
    if (isAdmin) loadDashboard()
  }, [isAdmin])

  const loadDashboard = async () => {
    setLoadingData(true)
    const [beatsRes, wavRes] = await Promise.all([
      supabase.from('beats').select('*').order('created_at', { ascending: false }),
      supabase.from('purchases').select('*').eq('license_type', 'mp3_wav_lease').order('created_at', { ascending: false }),
    ])
    setBeats(beatsRes.data || [])
    setWavOrders(wavRes.data || [])
    setLoadingData(false)
  }

  const handleLogin = () => {
    const ok = login(code)
    if (!ok) { setLoginError(true); setTimeout(() => setLoginError(false), 1500) }
  }

  const uploadFile = async (file: File, bucket: string, path: string) => {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true })
    if (error) throw error
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path)
    return urlData.publicUrl
  }

  const handleUploadBeat = async () => {
    if (!beatTitle.trim() || !mp3File) { toast.error('Title and MP3 are required.'); return }
    if (!confirm(`Upload "${beatTitle}" to ${beatSection}?`)) return
    setUploading(true)
    try {
      const slug = `${Date.now()}-${beatTitle.replace(/\s+/g, '-').toLowerCase()}`
      const mp3Url = await uploadFile(mp3File, 'beats', `mp3/${slug}.mp3`)
      let wavUrl: string | undefined
      if (wavFile) wavUrl = await uploadFile(wavFile, 'beats', `wav/${slug}.wav`)
      let coverUrl: string | undefined
      if (coverFile) coverUrl = await uploadFile(coverFile, 'covers', `${slug}.jpg`)

      const mp3Price = licenseType === 'free' ? 0 : 25
      const wavPrice = licenseType === 'mp3_wav_lease' ? 75 : 0

      const { error } = await supabase.from('beats').insert({
        title: beatTitle.trim(),
        bpm: beatBpm ? parseInt(beatBpm) : null,
        key: beatKey || null,
        tags: beatTags ? beatTags.split(',').map(t => t.trim()) : [],
        section: beatSection,
        license_type: licenseType,
        mp3_price: mp3Price,
        wav_price: wavPrice,
        mp3_url: mp3Url,
        wav_url: wavUrl || null,
        cover_url: coverUrl || null,
        purchase_count: 0,
        is_active: true,
      })
      if (error) throw error
      toast.success(`"${beatTitle}" uploaded!`)
      setBeatTitle(''); setBeatBpm(''); setBeatKey(''); setBeatTags('')
      setMp3File(null); setWavFile(null); setCoverFile(null)
      loadDashboard()
    } catch (e: any) {
      toast.error(e.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteBeat = async (beat: Beat) => {
    if (!confirm(`Delete "${beat.title}"? This cannot be undone.`)) return
    await supabase.from('beats').delete().eq('id', beat.id)
    toast.success('Deleted.')
    loadDashboard()
  }

  const handleUploadTape = async () => {
    if (!tapeTitle.trim()) { toast.error('Tape title required.'); return }
    if (!confirm(`Create beat tape "${tapeTitle}"?`)) return
    setUploadingTape(true)
    try {
      let coverUrl: string | undefined
      if (tapeCover) {
        const slug = `${Date.now()}-${tapeTitle.replace(/\s+/g, '-').toLowerCase()}`
        coverUrl = await uploadFile(tapeCover, 'covers', `tapes/${slug}.jpg`)
      }
      const { error } = await supabase.from('beat_tapes').insert({
        title: tapeTitle.trim(),
        description: tapeDesc || null,
        price: tapeFree ? 0 : parseFloat(tapePrice) || 0,
        is_free: tapeFree,
        cover_url: coverUrl || null,
        is_active: true,
      })
      if (error) throw error
      toast.success('Beat tape created!')
      setTapeTitle(''); setTapeDesc(''); setTapePrice(''); setTapeFree(false); setTapeCover(null)
    } catch (e: any) {
      toast.error(e.message || 'Failed')
    } finally {
      setUploadingTape(false)
    }
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-xs">
          <div className="text-center mb-8">
            <Image src="/logo.png" alt="TBIB" width={80} height={80} className="mx-auto rounded-full logo-glow mb-4" />
            <p className="text-gray-500 text-sm">Owner access only</p>
          </div>
          <div className={`space-y-3 transition-all ${loginError ? 'shake' : ''}`}>
            <input
              type="password"
              value={code}
              onChange={e => setCode(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="Secret code"
              className={`w-full bg-[#0a0a0a] border ${loginError ? 'border-red-500' : 'border-[#222]'} rounded-xl px-4 py-3 text-center text-xl font-black tracking-widest text-white focus:outline-none focus:border-[#8BFF00] transition-colors`}
              maxLength={5}
            />
            <button
              onClick={handleLogin}
              className="w-full btn-banana py-3 rounded-xl font-black uppercase tracking-widest"
            >
              Enter
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-[#8BFF00]">Admin Panel</h1>
        <button onClick={logout} className="text-xs text-gray-500 hover:text-red-400 transition">Log out</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-4 text-center">
          <div className="text-2xl font-black text-[#8BFF00]">{beats.length}</div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wide">Total Beats</div>
        </div>
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-4 text-center">
          <div className="text-2xl font-black text-[#9B27FF]">{wavOrders.length}</div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wide">WAV Orders</div>
        </div>
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-4 text-center">
          <div className="text-2xl font-black text-white">
            {beats.reduce((sum, b) => sum + (b.purchase_count || 0), 0)}
          </div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wide">Total Sales</div>
        </div>
      </div>

      {/* WAV Orders */}
      {wavOrders.length > 0 && (
        <div className="bg-[#0a0a0a] border border-[#9B27FF33] rounded-xl p-4">
          <h2 className="font-black text-sm text-[#9B27FF] mb-3">WAV Orders — Send Files Manually</h2>
          <div className="space-y-2">
            {wavOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-[#1a1a1a] last:border-0">
                <div>
                  <div className="text-xs font-bold text-white">{order.buyer_email || 'No email'}</div>
                  <div className="text-[10px] text-gray-500">{new Date(order.created_at).toLocaleDateString()} · ${order.amount_paid}</div>
                </div>
                <a
                  href={`mailto:${order.buyer_email}?subject=Your WAV File - ThisBeatIzBananaz`}
                  className="text-[10px] px-3 py-1.5 rounded bg-[#9B27FF22] text-[#9B27FF] border border-[#9B27FF33] hover:bg-[#9B27FF44] transition"
                >
                  Email WAV
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload tabs */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl overflow-hidden">
        <div className="flex border-b border-[#1a1a1a]">
          {(['beat', 'tape'] as UploadTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setUploadTab(tab)}
              className={`flex-1 py-3 text-xs font-black uppercase tracking-wide transition-colors ${
                uploadTab === tab ? 'bg-[#8BFF00] text-black' : 'text-gray-500 hover:text-white'
              }`}
            >
              {tab === 'beat' ? '+ Upload Beat' : '+ New Beat Tape'}
            </button>
          ))}
        </div>

        <div className="p-5 space-y-4">
          {uploadTab === 'beat' ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-[10px] text-gray-500 uppercase mb-1 block">Title *</label>
                  <input value={beatTitle} onChange={e => setBeatTitle(e.target.value)} className="w-full bg-[#111] border border-[#222] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#8BFF00]" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase mb-1 block">BPM</label>
                  <input value={beatBpm} onChange={e => setBeatBpm(e.target.value)} type="number" className="w-full bg-[#111] border border-[#222] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#8BFF00]" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase mb-1 block">Key</label>
                  <input value={beatKey} onChange={e => setBeatKey(e.target.value)} className="w-full bg-[#111] border border-[#222] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#8BFF00]" />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] text-gray-500 uppercase mb-1 block">Tags (comma separated)</label>
                  <input value={beatTags} onChange={e => setBeatTags(e.target.value)} placeholder="trap, dark, 808" className="w-full bg-[#111] border border-[#222] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#8BFF00] placeholder-gray-700" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-gray-500 uppercase mb-1 block">Section</label>
                  <select value={beatSection} onChange={e => setBeatSection(e.target.value as Section)} className="w-full bg-[#111] border border-[#222] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#8BFF00]">
                    <option value="beats_for_sale">Beats for Sale</option>
                    <option value="free">Free Section</option>
                    <option value="in_the_lab">In The Lab</option>
                    <option value="produced_by">Produced By</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase mb-1 block">License</label>
                  <select value={licenseType} onChange={e => setLicenseType(e.target.value as any)} className="w-full bg-[#111] border border-[#222] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#8BFF00]">
                    <option value="mp3_lease">MP3 Lease — $25</option>
                    <option value="mp3_wav_lease">MP3 + WAV — $75</option>
                    <option value="free">Free</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'MP3 File *', accept: '.mp3,audio/*', set: setMp3File, file: mp3File },
                  { label: 'WAV File', accept: '.wav,audio/*', set: setWavFile, file: wavFile },
                  { label: 'Cover Art', accept: 'image/*', set: setCoverFile, file: coverFile },
                ].map(({ label, accept, set, file }) => (
                  <div key={label}>
                    <label className="text-[10px] text-gray-500 uppercase mb-1 block">{label}</label>
                    <label className={`flex flex-col items-center justify-center h-20 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${file ? 'border-[#8BFF00] bg-[#8BFF0011]' : 'border-[#222] hover:border-[#444]'}`}>
                      <input type="file" accept={accept} className="hidden" onChange={e => set(e.target.files?.[0] || null)} />
                      <div className="text-center">
                        {file ? (
                          <span className="text-[9px] text-[#8BFF00] font-bold px-1 break-all line-clamp-2">{file.name}</span>
                        ) : (
                          <span className="text-[10px] text-gray-600">Drop / click</span>
                        )}
                      </div>
                    </label>
                  </div>
                ))}
              </div>

              <button
                onClick={handleUploadBeat}
                disabled={uploading}
                className="w-full btn-banana py-3 rounded-xl font-black uppercase tracking-widest disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Upload Beat'}
              </button>
            </>
          ) : (
            <>
              <div>
                <label className="text-[10px] text-gray-500 uppercase mb-1 block">Tape Title *</label>
                <input value={tapeTitle} onChange={e => setTapeTitle(e.target.value)} className="w-full bg-[#111] border border-[#222] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#8BFF00]" />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase mb-1 block">Description</label>
                <textarea value={tapeDesc} onChange={e => setTapeDesc(e.target.value)} rows={2} className="w-full bg-[#111] border border-[#222] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#8BFF00] resize-none" />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={tapeFree} onChange={e => setTapeFree(e.target.checked)} className="accent-[#8BFF00]" />
                  <span className="text-xs text-gray-400">Free tape</span>
                </label>
                {!tapeFree && (
                  <div className="flex-1">
                    <input value={tapePrice} onChange={e => setTapePrice(e.target.value)} type="number" placeholder="Price" className="w-full bg-[#111] border border-[#222] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#8BFF00]" />
                  </div>
                )}
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase mb-1 block">Cover Art</label>
                <label className={`flex items-center justify-center h-20 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${tapeCover ? 'border-[#8BFF00] bg-[#8BFF0011]' : 'border-[#222] hover:border-[#444]'}`}>
                  <input type="file" accept="image/*" className="hidden" onChange={e => setTapeCover(e.target.files?.[0] || null)} />
                  <span className="text-xs text-gray-600">{tapeCover ? tapeCover.name : 'Upload cover'}</span>
                </label>
              </div>
              <button
                onClick={handleUploadTape}
                disabled={uploadingTape}
                className="w-full btn-banana py-3 rounded-xl font-black uppercase tracking-widest disabled:opacity-50"
              >
                {uploadingTape ? 'Creating...' : 'Create Beat Tape'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Beat list */}
      <div>
        <h2 className="font-black text-sm text-white mb-3">All Beats ({beats.length})</h2>
        <div className="space-y-2">
          {beats.map(beat => (
            <div key={beat.id} className="flex items-center justify-between bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-3 py-2">
              <div className="min-w-0">
                <div className="text-sm font-bold text-white truncate">{beat.title}</div>
                <div className="text-[10px] text-gray-500">
                  {beat.section} · {beat.purchase_count} sold · ${beat.mp3_price}
                </div>
              </div>
              <button
                onClick={() => handleDeleteBeat(beat)}
                className="shrink-0 ml-3 text-[10px] px-2 py-1 rounded bg-[#1a1a1a] text-gray-500 hover:text-red-400 hover:bg-red-900/20 transition"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
