import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Sidebar } from "@/components/sidebar"
import { AuthProvider } from "@/lib/auth"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { ThemeProvider } from "@/lib/theme"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Valvoline Admin Dashboard",
  description: "Admin dashboard for Valvoline engine oil company",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
      <ThemeProvider defaultTheme="system" storageKey="valvoline-ui-theme">
          <AuthProvider>
            <ProtectedRoute>
              <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
                <Sidebar />
                <main className="flex-1 overflow-y-auto">
                  <div className="p-6">{children}</div>
                </main>
              </div>
            </ProtectedRoute>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
