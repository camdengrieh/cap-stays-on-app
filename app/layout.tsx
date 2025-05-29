import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Cap Stays On - Add the Iconic Teal Cap to Any Image",
  description:
    "Upload any image and add the iconic teal cap. Resize, rotate, flip, and position the cap perfectly, then download your creation. Share with #capstayson!",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Cap Stays On - Add the Iconic Teal Cap to Any Image",
    description: "Create and share cap masterpieces with #capstayson",
    images: ["/cap.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cap Stays On",
    description: "Create and share cap masterpieces with #capstayson",
    images: ["/cap.png"],
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
