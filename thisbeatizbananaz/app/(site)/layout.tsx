import Nav from '@/components/Nav'
import PlayerBar from '@/components/PlayerBar'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Nav />
      <main className="flex-1 pb-24">
        {children}
      </main>
      <PlayerBar />
    </div>
  )
}
