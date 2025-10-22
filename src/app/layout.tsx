// src/app/layout.tsx
import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'

import AddToCartAlertHost from '@/components/cart/AddToCartAlertHost'
import FacebookPixelTracker from '@/components/FacebookPixelTracker'
import FbFlagsCleaner from '@/components/FbFlagsCleaner'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import ThemeRegistry from '@/components/ThemeRegistry'

const FB_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID

export const metadata: Metadata = {
  title: 'LuxeRoe — преміальні морепродукти та ікра',
  description:
    'LuxeRoe — інтернет-магазин преміальної ікри. Свіжа червона й чорна ікра. Доставка по всій Україні.'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        {/* Meta Pixel: инициализация один раз, уже после интерактива */}
        {FB_ID && (
          <>
            <Script id="fb-pixel" strategy="afterInteractive">
              {`
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${FB_ID}');
fbq('track', 'PageView');
              `}
            </Script>

            {/* noscript-пиксель для пользователей без JS */}
            <noscript>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                height="1"
                width="1"
                style={{ display: 'none' }}
                src={`https://www.facebook.com/tr?id=${FB_ID}&ev=PageView&noscript=1`}
                alt=""
              />
            </noscript>
          </>
        )}

        <ThemeRegistry>
          <div className="app-shell">
            <Header />
            <AddToCartAlertHost />

            <FbFlagsCleaner />

            {FB_ID && <FacebookPixelTracker />}

            <main>{children}</main>
            <Footer />
          </div>
        </ThemeRegistry>
      </body>
    </html>
  )
}
