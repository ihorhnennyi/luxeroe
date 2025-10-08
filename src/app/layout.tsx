// src/app/layout.tsx
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import LeavesClient from "@/components/LeavesClient";
import ThemeRegistry from "@/components/ThemeRegistry";
import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "LuxeRoe — преміальні морепродукти та ікра",
  description:
    "LuxeRoe — інтернет-магазин преміальної ікри та морепродуктів. Свіжа червона й чорна ікра, креветки, устриці, краби. Доставка по всій Україні.",
  keywords: [
    "ікра","чорна ікра","червона ікра","морепродукти","креветки","устриці",
    "краби","морські делікатеси","купити ікру онлайн","доставка морепродуктів",
    "IKRA.store","ікра Україна",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const autumn = true;
  const FB_PIXEL_ID = "1176533047701366";
  const GA_ID = "G-KTCXBPPH1T";

  return (
    <html lang="uk">
      <head>
        <link rel="icon" href="/favicon.ico" />

        {/* ---------- Google Analytics ---------- */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `}
        </Script>

        {/* ---------- Meta Pixel (Facebook Pixel) ---------- */}
        <Script
          id="fb-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s){
                if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)
              }(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${FB_PIXEL_ID}');
              fbq('track', 'PageView');
            `,
          }}
        />

        <meta name="google-site-verification" content="CXlHRnnNQzYZm6fOmKU4iBqWVmIqsdGBXMuIoIfNW8I" />
      </head>

      <body>
        {/* Noscript Meta Pixel */}
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" } as any}
            src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>

        <ThemeRegistry>
          <div className="app-shell">
            <Header />
            <LeavesClient autumn={autumn} />
            <main>{children}</main>
            <Footer />
          </div>
        </ThemeRegistry>
      </body>
    </html>
  );
}
