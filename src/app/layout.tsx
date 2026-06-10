import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "届く · Todoku",
  description: "How much Japanese can you understand? Comprehension scoring for anime and J-pop.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
