"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

interface ThemeProviderProps {
    children: React.ReactNode
    defaultTheme?: Theme
    storageKey?: string
}

interface ThemeProviderState {
    theme: Theme
    setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
    theme: "system",
    setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
    children,
    defaultTheme = "system",
    storageKey = "valvoline-ui-theme",
    ...props
}: ThemeProviderProps) {
    // ✅ 1. Safe SSR: start with default
    const [theme, setThemeState] = useState<Theme>(defaultTheme)

    // ✅ 2. On mount, read from localStorage
    useEffect(() => {
        const storedTheme = window.localStorage.getItem(storageKey) as Theme | null
        if (storedTheme) {
            setThemeState(storedTheme)
        }
    }, [storageKey])

    // ✅ 3. Apply to <html>
    useEffect(() => {
        const root = window.document.documentElement

        root.classList.remove("light", "dark")

        const effectiveTheme =
            theme === "system"
                ? window.matchMedia("(prefers-color-scheme: dark)").matches
                    ? "dark"
                    : "light"
                : theme

        root.classList.add(effectiveTheme)
    }, [theme])

    // ✅ 4. Save and update
    const setTheme = (newTheme: Theme) => {
        window.localStorage.setItem(storageKey, newTheme)
        setThemeState(newTheme)
    }

    return (
        <ThemeProviderContext.Provider {...props} value={{ theme, setTheme }}>
            {children}
        </ThemeProviderContext.Provider>
    )
}

export const useTheme = () => {
    const context = useContext(ThemeProviderContext)
    if (context === undefined)
        throw new Error("useTheme must be used within a ThemeProvider")
    return context
}
