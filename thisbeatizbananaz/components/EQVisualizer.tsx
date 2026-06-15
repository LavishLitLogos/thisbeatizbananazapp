'use client'
import { useEffect, useState } from 'react'
import { usePlayerStore } from '@/lib/playerStore'

interface EQVisualizerProps {
  size?: 'sm' | 'md'
  color?: string
}

export default function EQVisualizer({ size = 'sm', color = '#8BFF00' }: EQVisualizerProps) {
  const { eqActive } = usePlayerStore()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (eqActive) {
      setVisible(true)
    } else {
      const t = setTimeout(() => setVisible(false), 800)
      return () => clearTimeout(t)
    }
  }, [eqActive])

  if (!visible) return null

  const barH = size === 'sm' ? 'max-h-[22px]' : 'max-h-[32px]'
  const barW = size === 'sm' ? 'w-[3px]' : 'w-[4px]'
  const gap = size === 'sm' ? 'gap-[2px]' : 'gap-[3px]'

  return (
    <div
      className={`flex items-end ${gap} transition-opacity duration-700 ${eqActive ? 'opacity-100' : 'opacity-0'}`}
      style={{ height: size === 'sm' ? 22 : 32 }}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={`${barW} ${barH} rounded-sm eq-bar-${i}`}
          style={{
            background: color,
            boxShadow: `0 0 4px ${color}`,
            minHeight: 4,
          }}
        />
      ))}
    </div>
  )
}
