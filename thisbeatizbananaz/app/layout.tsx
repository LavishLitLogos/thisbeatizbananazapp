import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'ThisBeatIzBananaz',
  description: 'The dopest beat shop on the internet. Premium beats for serious artists.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'TBIB',
  },
  icons: {
    apple: '/logo.png',
    icon: '/logo.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#8BFF00',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="bg-black text-white min-h-screen font-sans">
        {children}
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: '#111',
              color: '#8BFF00',
              border: '1px solid #8BFF00',
              fontWeight: 700,
            },
          }}
        />
        <script dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js');
              });
            }
          `
        }} />
      </body>
    </html>
  )
}
