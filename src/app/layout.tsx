import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HiLink Adventure - Platform Open Trip & Sewa Peralatan Outdoor",
  description: "Platform terpercaya untuk open trip dan sewa peralatan outdoor. Bergabunglah dengan ribuan petualang dan rasakan pengalaman outdoor yang tak terlupakan.",
  icons: {
    icon: '/camp.svg',
    shortcut: '/camp.svg',
    apple: '/camp.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Midtrans Snap Script */}
        <Script
          src={process.env.MIDTRANS_IS_PRODUCTION === 'true' 
            ? 'https://app.midtrans.com/snap/snap.js' 
            : 'https://app.sandbox.midtrans.com/snap/snap.js'
          }
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
          strategy="beforeInteractive"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster 
          position="top-center"
          richColors
          closeButton
          duration={3000}
        />
      </body>
    </html>
  );
}
