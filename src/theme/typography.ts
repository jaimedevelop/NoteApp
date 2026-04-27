import type { Theme } from '../types/theme'

// Named text style presets — reference these in components rather than
// hardcoding font values. Each preset returns a CSS-in-JS style object.

export type TypographyPreset =
    | 'masthead'
    | 'headline'
    | 'subheadline'
    | 'byline'
    | 'body'
    | 'caption'
    | 'label'
    | 'tabLabel'
    | 'mono'

export const getTypographyStyles = (
    preset: TypographyPreset,
    theme: Theme
): React.CSSProperties => {
    const { fonts, fontSizes, fontWeights, colors } = theme

    const presets: Record<TypographyPreset, React.CSSProperties> = {
        // Large masthead-style page titles
        masthead: {
            fontFamily: fonts.serif,
            fontSize: fontSizes.masthead,
            fontWeight: fontWeights.black,
            color: colors.inkPrimary,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            lineHeight: 1.1,
        },

        // Section headings (e.g. category names, card titles)
        headline: {
            fontFamily: fonts.serif,
            fontSize: fontSizes.headline,
            fontWeight: fontWeights.bold,
            color: colors.inkPrimary,
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
            lineHeight: 1.25,
        },

        // Sub-section or panel headings
        subheadline: {
            fontFamily: fonts.serif,
            fontSize: fontSizes.subhead,
            fontWeight: fontWeights.bold,
            color: colors.inkSecondary,
            letterSpacing: '0.03em',
            lineHeight: 1.35,
        },

        // Author/date attribution lines
        byline: {
            fontFamily: fonts.sansSerif,
            fontSize: fontSizes.byline,
            fontWeight: fontWeights.regular,
            color: colors.inkMuted,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            fontStyle: 'italic',
            lineHeight: 1.4,
        },

        // General paragraph / task title text
        body: {
            fontFamily: fonts.sansSerif,
            fontSize: fontSizes.body,
            fontWeight: fontWeights.regular,
            color: colors.inkPrimary,
            lineHeight: 1.6,
        },

        // Supporting detail text, subtask titles
        caption: {
            fontFamily: fonts.sansSerif,
            fontSize: fontSizes.caption,
            fontWeight: fontWeights.regular,
            color: colors.inkMuted,
            lineHeight: 1.5,
        },

        // Small uppercase labels (priority badges, status chips)
        label: {
            fontFamily: fonts.serif,
            fontSize: fontSizes.caption,
            fontWeight: fontWeights.bold,
            color: colors.inkSecondary,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            lineHeight: 1,
        },

        // Navigation tab text
        tabLabel: {
            fontFamily: fonts.serif,
            fontSize: fontSizes.byline,
            fontWeight: fontWeights.bold,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            lineHeight: 1,
        },

        // Monospace — dates, timestamps, IDs
        mono: {
            fontFamily: fonts.mono,
            fontSize: fontSizes.caption,
            fontWeight: fontWeights.regular,
            color: colors.inkMuted,
            lineHeight: 1.4,
        },
    }

    return presets[preset]
}