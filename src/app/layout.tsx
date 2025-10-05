// src/app/layout.tsx
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import LeavesClient from "@/components/LeavesClient";
import ThemeRegistry from "@/components/ThemeRegistry";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IKRA.store — премиальные морепродукты",
  description: "Свежая икра і морські делікатеси с доставкой по Україні",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const autumn = true;

  return (
    <html lang="ru" /* suppressHydrationWarning можно убрать, если всё чисто */>
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
