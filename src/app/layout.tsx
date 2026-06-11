import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import FeedbackButton from "@/components/FeedbackButton";

export const metadata: Metadata = {
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
          <FeedbackButton />
        </Providers>
      </body>
    </html>
  );
}
