import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import '../lib/polyfill'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Système de Gestion Académique",
  description: "Plateforme de Gestion des Stages et Projets avec Outils IA et OCR",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
