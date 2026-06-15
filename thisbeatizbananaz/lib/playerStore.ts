import { create } from 'zustand'
import { Beat } from './supabase'

interface PlayerState {
  currentBeat: Beat | null
  queue: Beat[]
  isPlaying: boolean
  currentTime: number
  duration: number
  audio: HTMLAudioElement | null
  eqActive: boolean
  play: (beat: Beat, queue?: Beat[]) => void
  pause: () => void
  resume: () => void
  stop: () => void
  skip: () => void
  setCurrentTime: (t: number) => void
  setDuration: (d: number) => void
  setEqActive: (v: boolean) => void
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentBeat: null,
  queue: [],
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  audio: null,
  eqActive: false,

  play: (beat, queue = []) => {
    const { audio: existingAudio } = get()
    if (existingAudio) {
      existingAudio.pause()
      existingAudio.src = ''
    }
    const audio = typeof window !== 'undefined' ? new Audio(beat.mp3_url) : null
    if (!audio) return
    audio.addEventListener('timeupdate', () => set({ currentTime: audio.currentTime }))
    audio.addEventListener('loadedmetadata', () => set({ duration: audio.duration }))
    audio.addEventListener('ended', () => {
      const { queue: q } = get()
      if (q.length > 0) {
        const [next, ...rest] = q
        get().play(next, rest)
      } else {
        set({ isPlaying: false, eqActive: false, currentBeat: null })
      }
    })
    audio.play()
    set({ currentBeat: beat, queue, isPlaying: true, eqActive: true, audio })
  },

  pause: () => {
    const { audio } = get()
    if (audio) audio.pause()
    set({ isPlaying: false, eqActive: false })
  },

  resume: () => {
    const { audio } = get()
    if (audio) audio.play()
    set({ isPlaying: true, eqActive: true })
  },

  stop: () => {
    const { audio } = get()
    if (audio) { audio.pause(); audio.currentTime = 0 }
    set({ isPlaying: false, eqActive: false, currentBeat: null, currentTime: 0 })
  },

  skip: () => {
    const { queue } = get()
    if (queue.length > 0) {
      const [next, ...rest] = queue
      get().play(next, rest)
    } else {
      get().stop()
    }
  },

  setCurrentTime: (t) => {
    const { audio } = get()
    if (audio) audio.currentTime = t
    set({ currentTime: t })
  },

  setDuration: (d) => set({ duration: d }),
  setEqActive: (v) => set({ eqActive: v }),
}))
