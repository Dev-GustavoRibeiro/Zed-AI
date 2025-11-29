import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import '@/shared/styles/globals.css'

export const metadata: Metadata = {
  title: 'ZED - Seu Assistente Virtual Inteligente',
  description: 'ZED é seu assistente virtual pessoal com IA avançada. Organize sua vida, rotina, finanças e agenda com inteligência artificial.',
  keywords: ['assistente virtual', 'IA', 'inteligência artificial', 'produtividade', 'organização pessoal'],
  authors: [{ name: 'ZED Team' }],
  openGraph: {
    title: 'ZED - Seu Assistente Virtual Inteligente',
    description: 'Organize sua vida com inteligência artificial',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body 
        className="min-h-screen bg-[hsl(222,47%,6%)] text-slate-100 antialiased"
        style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
      >
        {children}
        <Toaster 
          position="top-right"
          toastOptions={{
            className: 'bg-slate-800 text-white border border-white/10',
            duration: 4000,
          }}
        />
      </body>
    </html>
  )
}

