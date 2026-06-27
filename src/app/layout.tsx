import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SocialConnect — Modern social feed",
  description: "A mobile-style social feed built with Next.js, Zustand and Prisma. Post, like, comment and browse user profiles.",
  keywords: ["social", "feed", "Next.js", "Zustand", "Prisma", "shadcn/ui"],
  authors: [{ name: "SocialConnect" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "SocialConnect",
    description: "A modern social feed built with Next.js",
    siteName: "SocialConnect",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SocialConnect",
    description: "A modern social feed built with Next.js",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
