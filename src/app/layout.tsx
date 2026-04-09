import type { Metadata } from 'next'
import { Inter, Noto_Sans_JP } from 'next/font/google'
import './globals.css'
import ClientLayout from '../components/ClientLayout'
import { LoadingBarProvider } from '../context/LoadingBarContext'
import GlobalLoadingBar from '../components/GlobalLoadingBar'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import SessionClientProvider from '../components/SessionClientProvider'
import TrailingCursor from '../components/TrailingCursor'
import VantaGlobeBackground from '../components/VantaGlobeBackground'
import NativeAppFeatures from '../components/NativeAppFeatures'
import BottomNavigation from '../components/BottomNavigation'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
})
const notoSansJP = Noto_Sans_JP({ 
  weight: ['400', '700', '900'],
  subsets: ['latin'],
  variable: '--font-noto-sans-jp',
  display: 'swap',
  preload: true,
})

export const metadata: Metadata = {
  title: 'vena/verse',
  description: 'Personal reviews of films, music, anime, and books',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  themeColor: '#0A0A0A',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'vena/verse',
  },
  formatDetection: {
    telephone: false,
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  const showMobileCursor =
    process.env.NODE_ENV === 'development' ||
    process.env.NEXT_PUBLIC_SHOW_MOBILE_CURSOR === 'true' ||
    process.env.NEXT_PUBLIC_SHOW_MOBILE_CURSOR === '1'

  return (
    <html
      lang="en"
      className={`${showMobileCursor ? 'show-mobile-cursor ' : ''}dark`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const savedTheme = localStorage.getItem('theme');
                if (savedTheme === 'light') {
                  document.documentElement.classList.remove('dark');
                } else {
                  // Default to dark mode if no preference is saved
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className={`${inter.className} ${notoSansJP.variable} text-gray-900 min-h-screen`}>
        <VantaGlobeBackground 
          isActive={true}
        />
        <TrailingCursor />
        <NativeAppFeatures />
        <GlobalLoadingBar />
        <LoadingBarProvider>
          <SessionClientProvider session={session}>
            <ClientLayout>{children}</ClientLayout>
            <BottomNavigation />
          </SessionClientProvider>
        </LoadingBarProvider>
      </body>
    </html>
  )
} 