// src/app/layout.tsx
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import LeavesClient from "@/components/LeavesClient";
import ThemeRegistry from "@/components/ThemeRegistry";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LuxeRoe — премиальні морепродукти та ікра",
  description:
    "LuxeRoe — інтернет-магазин преміальної ікри та морепродуктів. Свіжа червона й чорна ікра, креветки, устриці, краби. Доставка по всій Україні.",
  keywords: [
    "ікра",
    "чорна ікра",
    "червона ікра",
    "морепродукти",
    "креветки",
    "устриці",
    "краби",
    "морські делікатеси",
    "купити ікру онлайн",
    "доставка морепродуктів",
    "IKRA.store",
    "ікра Україна",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const autumn = true;

  return (
    <html lang="ru">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
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
