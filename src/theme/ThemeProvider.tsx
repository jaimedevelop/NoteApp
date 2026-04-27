import React, { createContext, useContext, useState } from 'react'
import { ThemeProvider as StyledThemeProvider } from 'styled-components'
import { broadsheetTheme } from './tokens'
import type { Theme } from '../types/theme'

// ─── Context ────────────────────────────────────────────────────────────────

interface ThemeContextValue {
    theme: Theme
    themeName: string
    setThemeName: (name: string) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

// ─── Theme Registry ─────────────────────────────────────────────────────────
// Add new themes here as they are created in tokens.ts

const themeRegistry: Record<string, Theme> = {
    broadsheet: broadsheetTheme,
    // modern: modernTheme,
}

// ─── Provider ────────────────────────────────────────────────────────────────

interface ThemeProviderProps {
    children: React.ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const [themeName, setThemeName] = useState<string>('broadsheet')

    const theme = themeRegistry[themeName] ?? broadsheetTheme

    return (
        <ThemeContext.Provider value= {{ theme, themeName, setThemeName }
}>
    <StyledThemeProvider theme={ theme }>
        { children }
        </StyledThemeProvider>
        </ThemeContext.Provider>
  )
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export const useTheme = (): ThemeContextValue => {
    const ctx = useContext(ThemeContext)
    if (!ctx) throw new Error('useTheme must be used within a ThemeProvider')
    return ctx
}