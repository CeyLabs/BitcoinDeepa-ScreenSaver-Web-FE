import type React from "react"
import type { Metadata } from "next"
import { Exo } from "next/font/google"
import "./globals.css"

const exo = Exo({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-exo",
})

export const metadata: Metadata = {
  title: "Bitcoin Deepa - Live Dashboard",
  description: "Real-time Bitcoin metrics in LKR",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${exo.variable} dark`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
