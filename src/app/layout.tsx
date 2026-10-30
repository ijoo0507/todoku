import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import FeedbackButton from "@/components/FeedbackButton";
import Footer from "@/components/Footer";
import { Analytics } from "@vercel/analytics/next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "届く · Todoku",
  description: "How much Japanese can you understand? Comprehension scoring for anime and J-pop.",
  icons: {
    icon: '/favicon.svg',
    apple: '/logo.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Providers>
          {children}
          <Footer />
          <FeedbackButton />
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
