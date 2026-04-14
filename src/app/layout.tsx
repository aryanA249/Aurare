import type { Metadata } from "next";
import { Cormorant_Garamond, Work_Sans } from "next/font/google";
import { CartProvider } from "@/components/cart-provider";
import { FirebaseAnalyticsInit } from "@/components/firebase-analytics-init";
import { SiteContentProvider } from "@/components/site-content-provider";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const bodySans = Work_Sans({
  variable: "--font-aurare-sans",
  subsets: ["latin"],
});

const headingSerif = Cormorant_Garamond({
  variable: "--font-aurare-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Aurare | The Fabric of Quiet Luxury",
  description:
    "Aurare is an ultra-premium bedding house crafting a conscious sleep ritual through the world's finest natural fibers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bodySans.variable} ${headingSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--aurare-bg)] text-[var(--aurare-ink)]">
        <FirebaseAnalyticsInit />
        <CartProvider>
          <SiteContentProvider>
            <SiteHeader />
            {children}
          </SiteContentProvider>
        </CartProvider>
      </body>
    </html>
  );
}
