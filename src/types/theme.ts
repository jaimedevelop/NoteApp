// ─── Theme Type ───────────────────────────────────────────────────────────────
// Describes the full shape of a theme token set.
// Every theme exported from tokens.ts must satisfy this interface.

export interface Theme {
    name: string

    colors: {
        pageBg: string
        surfaceBg: string
        surfaceAlt: string

        inkPrimary: string
        inkSecondary: string
        inkMuted: string

        ruleHeavy: string
        ruleMid: string
        ruleLight: string

        statusComplete: string
        statusInProgress: string
        statusIncomplete: string
        statusCompleteBg: string
        statusInProgressBg: string
        statusIncompleteBg: string

        priorityHigh: string
        priorityMedium: string
        priorityLow: string

        accent: string
        accentHover: string

        white: string
        overlay: string
    }

    fonts: {
        serif: string
        sansSerif: string
        mono: string
    }

    fontSizes: {
        masthead: string
        headline: string
        subhead: string
        body: string
        byline: string
        caption: string
    }

    fontWeights: {
        black: number
        bold: number
        regular: number
        light: number
    }

    spacing: {
        xs: string
        sm: string
        md: string
        lg: string
        xl: string
        xxl: string
    }

    radii: {
        none: string
        sm: string
        md: string
    }

    borders: {
        heavy: string
        mid: string
        light: string
        dashed: string
    }

    shadows: {
        card: string
        inset: string
    }

    transitions: {
        fast: string
        normal: string
    }
}