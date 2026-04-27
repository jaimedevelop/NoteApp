import { createGlobalStyle } from 'styled-components'
import type { Theme } from '../types/theme'

// Augment styled-components DefaultTheme so all styled components
// get full type inference on `props.theme` with no extra imports.
declare module 'styled-components' {
    export interface DefaultTheme extends Theme { }
}

const GlobalStyles = createGlobalStyle`
  /* ── Google Fonts import ──────────────────────────────────────────────────
     Playfair Display  — serif masthead / headlines
     Crimson Text      — period-feel body copy
     Courier Prime     — monospace timestamps / IDs
     IM Fell English   — optional period italic accent
  */
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=Courier+Prime&family=IM+Fell+English:ital@0;1&display=swap');

  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    font-size: 16px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }

  body {
    background-color: ${({ theme }) => theme.colors.pageBg};
    color:            ${({ theme }) => theme.colors.inkPrimary};
    font-family:      ${({ theme }) => theme.fonts.sansSerif};
    font-size:        ${({ theme }) => theme.fontSizes.body};
    line-height:      1.6;

    /* Subtle paper grain texture using an SVG noise pattern.
       Falls back gracefully to solid parchment if unsupported. */
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23noise)' opacity='0.035'/%3E%3C/svg%3E");
    background-repeat: repeat;
  }

  /* ── Scrollbar ─────────────────────────────────────────────────────────── */
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  ::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.surfaceAlt};
  }
  ::-webkit-scrollbar-thumb {
    background:    ${({ theme }) => theme.colors.ruleMid};
    border-radius: 0px;
  }

  /* ── Selection ─────────────────────────────────────────────────────────── */
  ::selection {
    background-color: ${({ theme }) => theme.colors.statusInProgressBg};
    color:            ${({ theme }) => theme.colors.inkPrimary};
  }

  /* ── Links ─────────────────────────────────────────────────────────────── */
  a {
    color:           ${({ theme }) => theme.colors.inkSecondary};
    text-decoration: underline;
    text-underline-offset: 3px;
    transition: color ${({ theme }) => theme.transitions.fast};

    &:hover {
      color: ${({ theme }) => theme.colors.accent};
    }
  }

  /* ── Focus visible ─────────────────────────────────────────────────────── */
  :focus-visible {
    outline:        2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
  }

  /* ── Headings reset ────────────────────────────────────────────────────── */
  h1, h2, h3, h4, h5, h6 {
    font-family: ${({ theme }) => theme.fonts.serif};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    line-height: 1.2;
  }

  button {
    cursor:     pointer;
    border:     none;
    background: none;
    font-family: inherit;
  }

  input, textarea, select {
    font-family: ${({ theme }) => theme.fonts.sansSerif};
    font-size:   ${({ theme }) => theme.fontSizes.body};
    color:       ${({ theme }) => theme.colors.inkPrimary};
  }
`

export default GlobalStyles