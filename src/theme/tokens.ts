import type { Theme } from '../types/theme'

// ─── Broadsheet Theme ───────────────────────────────────────────────────────
// Inspired by 1880s–1900s American newspaper print: aged parchment, iron-ink
// typography, muted period status colors, and heavy ruled dividers.

export const broadsheetTheme: Theme = {
    name: 'broadsheet',

    colors: {

        // Backgrounds
        pageBg: '#f5efe0',   // aged parchment
        surfaceBg: '#ede7d3',   // slightly darker parchment for cards/panels
        surfaceAlt: '#e4dcc5',   // inset wells, tab backgrounds

        // Typography
        inkPrimary: '#1a1408',   // near-black ink
        inkSecondary: '#4a3f2f',   // faded secondary ink
        inkMuted: '#8a7d68',   // byline / caption gray-brown

        // Borders & Rules
        borderLight: '#c8b99a',   // alias for ruleLight — used by margin illustrations
        ruleHeavy: '#2c2318',   // thick masthead rule
        ruleMid: '#6b5c48',   // section divider
        ruleLight: '#c8b99a',   // subtle row separator

        // Status — period ink tones (not neon)
        statusComplete: '#3a5c3a',  // forest ledger green
        statusInProgress: '#8c6a1a',  // amber telegraph ink
        statusIncomplete: '#7a2e2e',  // brick/rust red

        // Status backgrounds (very faint washes)
        statusCompleteBg: '#edf3ed',
        statusInProgressBg: '#faf3e0',
        statusIncompleteBg: '#f5eeee',

        // Priority
        priorityHigh: '#7a2e2e',  // same brick red — urgency
        priorityMedium: '#8c6a1a',  // amber
        priorityLow: '#4a3f2f',  // ink secondary

        // Interactive
        accent: '#3d2b0e',  // deep sepia — hover, focus rings
        accentHover: '#5c4120',

        // Utility
        white: '#fdfaf4',
        overlay: 'rgba(26, 20, 8, 0.45)',
    },

    fonts: {
        serif: '"Playfair Display", "Libre Baskerville", Georgia, serif',
        sansSerif: '"IM Fell English", "Crimson Text", Georgia, serif', // period body copy feel
        mono: '"Courier Prime", "Courier New", monospace',
    },

    fontSizes: {
        masthead: '2.8rem',
        headline: '1.6rem',
        subhead: '1.15rem',
        body: '0.975rem',
        byline: '0.8rem',
        caption: '0.72rem',
    },

    fontWeights: {
        black: 900,
        bold: 700,
        regular: 400,
        light: 300,
    },

    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '40px',
        xxl: '64px',
    },

    radii: {
        none: '0px',
        sm: '2px',   // very subtle — period aesthetic avoids heavy rounding
        md: '4px',
    },

    borders: {
        heavy: '3px solid',
        mid: '1px solid',
        light: '1px solid',
        dashed: '1px dashed',
    },

    shadows: {
        // Subtle inset and drop shadows that feel like paper depth, not CSS cards
        card: '2px 3px 8px rgba(26, 20, 8, 0.12)',
        inset: 'inset 0 1px 3px rgba(26, 20, 8, 0.08)',
    },

    transitions: {
        fast: '120ms ease',
        normal: '220ms ease',
    },
}

// ─── Future themes can be added here and exported ───────────────────────────
// export const modernTheme: Theme = { ... }