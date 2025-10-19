import type { Metadata } from 'next'
import './globals.css'

import Footer from '@/components/Footer'
import Header from '@/components/Header'
import ThemeRegistry from '@/components/ThemeRegistry'
import AddToCartAlertHost from '@/components/cart/AddToCartAlertHost'

export const metadata: Metadata = {
  title: 'LuxeRoe — преміальні морепродукти та ікра',
  description:
    'LuxeRoe — інтернет-магазин преміальної ікри. Свіжа червона й чорна ікра. Доставка по всій Україні.',
  keywords: [
    'ікра',
    'чорна ікра',
    'червона ікра',
    'купити ікру онлайн',
    'доставка морепродуктів',
    'LUXEROE',
    'ікра Україна'
  ]
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <ThemeRegistry>
          <div className="app-shell">
            <Header />
            <AddToCartAlertHost />
            <main>{children}</main>
            <Footer />
          </div>
        </ThemeRegistry>
      </body>
    </html>
  )
}
