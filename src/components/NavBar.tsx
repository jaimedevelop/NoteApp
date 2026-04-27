import React from 'react'
import { NavLink } from 'react-router-dom'
import styled, { keyframes } from 'styled-components'
import RuleDivider from './RuleDivider'
import { signOut } from '../firebase/auth'

const routes = [
  { path: '/summary', label: 'Daily Dispatch' },
  { path: '/tasks', label: 'The Ledger' },
  { path: '/calendar', label: 'The Chronicle' },
]

// ─── Styled ───────────────────────────────────────────────────────────────────

const Header = styled.header`
  width:            100%;
  background-color: ${({ theme }) => theme.colors.pageBg};
  padding-top:      ${({ theme }) => theme.spacing.lg};
`

const Inner = styled.div`
  max-width: 780px;
  margin:    0 auto;
  padding:   0 ${({ theme }) => theme.spacing.lg};
  position:  relative;
`

const Masthead = styled.div`
  text-align:    center;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  /* leave room on the right so the seal doesn't overlap the title */
  padding-right: 72px;
  padding-left:  72px;
`

const PaperName = styled.h1`
  font-family:    ${({ theme }) => theme.fonts.serif};
  font-weight:    ${({ theme }) => theme.fontWeights.black};
  font-size:      clamp(2rem, 5vw, ${({ theme }) => theme.fontSizes.masthead});
  color:          ${({ theme }) => theme.colors.inkPrimary};
  letter-spacing: 0.06em;
  text-transform: uppercase;
  line-height:    1;
`

const Edition = styled.p`
  font-family:    ${({ theme }) => theme.fonts.mono};
  font-size:      ${({ theme }) => theme.fontSizes.caption};
  color:          ${({ theme }) => theme.colors.inkMuted};
  letter-spacing: 0.08em;
  margin-top:     ${({ theme }) => theme.spacing.xs};
`

const Nav = styled.nav`
  display:         flex;
  justify-content: center;
  gap:             0;
  margin-top:      ${({ theme }) => theme.spacing.sm};
`

const StyledNavLink = styled(NavLink)`
  font-family:     ${({ theme }) => theme.fonts.serif};
  font-size:       ${({ theme }) => theme.fontSizes.byline};
  font-weight:     ${({ theme }) => theme.fontWeights.bold};
  letter-spacing:  0.1em;
  text-transform:  uppercase;
  text-decoration: none;
  color:           ${({ theme }) => theme.colors.inkSecondary};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  border-left: 1px solid ${({ theme }) => theme.colors.ruleLight};
  transition: color      ${({ theme }) => theme.transitions.fast},
              background ${({ theme }) => theme.transitions.fast};

  &:first-child { border-left: none; }

  &:hover {
    color:      ${({ theme }) => theme.colors.inkPrimary};
    background: ${({ theme }) => theme.colors.surfaceAlt};
  }

  &.active {
    color:                 ${({ theme }) => theme.colors.inkPrimary};
    text-decoration:       underline;
    text-underline-offset: 4px;
  }
`

// ─── Wax Seal ─────────────────────────────────────────────────────────────────

const rock = keyframes`
  0%   { transform: rotate(-4deg) scale(1.08); }
  50%  { transform: rotate(4deg)  scale(1.08); }
  100% { transform: rotate(-4deg) scale(1.08); }
`

const SealButton = styled.button`
  position:   absolute;
  /* sit at the top of Inner, above the masthead rule — tooltip goes below the seal */
  top:        0;
  right:      ${({ theme }) => theme.spacing.lg};
  width:      64px;
  /* extra bottom space so the tooltip never overlaps the rule divider */
  padding-bottom: 28px;
  background: none;
  border:     none;
  cursor:     pointer;

  &::after {
    content:        'Seal & Retire';
    position:       absolute;
    bottom:         6px;          /* sits inside the padding-bottom gap */
    left:           50%;
    transform:      translateX(-50%);
    font-family:    ${({ theme }) => theme.fonts.mono};
    font-size:      9px;
    letter-spacing: 0.08em;
    color:          ${({ theme }) => theme.colors.inkMuted};
    white-space:    nowrap;
    opacity:        0;
    transition:     opacity 0.2s;
    pointer-events: none;
  }

  &:hover::after { opacity: 1; }
  &:hover svg    { animation: ${rock} 0.5s ease-in-out infinite; }
  &:focus-visible {
    outline:        2px dashed #8b1a1a;
    outline-offset: 3px;
    border-radius:  50%;
  }
`

const WaxSeal: React.FC = () => (
  <svg
    viewBox="0 0 64 64"
    width="64"
    height="64"
    aria-hidden="true"
    style={{ display: 'block', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.35))' }}
  >
    <ellipse cx="32" cy="33" rx="26" ry="25" fill="#6b0f0f" />
    <ellipse cx="10" cy="46" rx="4" ry="5" fill="#6b0f0f" />
    <ellipse cx="54" cy="44" rx="3" ry="4" fill="#6b0f0f" />
    <ellipse cx="32" cy="57" rx="3" ry="4" fill="#6b0f0f" />
    <ellipse cx="20" cy="54" rx="2.5" ry="3" fill="#6b0f0f" />
    <circle cx="32" cy="32" r="24" fill="#8b1a1a" />
    <circle cx="32" cy="32" r="24" fill="url(#sealGrad)" />
    <circle cx="32" cy="32" r="21" fill="none" stroke="#6b0f0f" strokeWidth="1.2" />
    <defs>
      <radialGradient id="sealGrad" cx="40%" cy="35%">
        <stop offset="0%" stopColor="#c0392b" stopOpacity="0.5" />
        <stop offset="100%" stopColor="#6b0f0f" stopOpacity="0" />
      </radialGradient>
      <path id="mottoPath" d="M 32,32 m -17,0 a 17,17 0 1,1 34,0 a 17,17 0 1,1 -34,0" />
    </defs>
    <text fontFamily="Georgia, serif" fontSize="5" letterSpacing="2" fill="#f5e6c8" opacity="0.85">
      <textPath href="#mottoPath" startOffset="5%">FINIS · DIEI · SIGILLUM ·</textPath>
    </text>
    <text
      x="32" y="38"
      textAnchor="middle"
      fontFamily="Georgia, serif"
      fontSize="22"
      fontWeight="bold"
      fill="#f5e6c8"
      opacity="0.9"
    >
      D
    </text>
  </svg>
)

// ─── Component ────────────────────────────────────────────────────────────────

const NavBar: React.FC = () => {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  const handleSignOut = async () => { await signOut() }

  return (
    <Header>
      <Inner>
        <SealButton onClick={handleSignOut} aria-label="Sign out — Seal & Retire">
          <WaxSeal />
        </SealButton>

        <Masthead>
          <PaperName>The Daily Planner</PaperName>
          <Edition>{today} · Personal Edition</Edition>
        </Masthead>

        <RuleDivider variant="masthead" spacing="sm" />

        <Nav>
          {routes.map(r => (
            <StyledNavLink key={r.path} to={r.path}>{r.label}</StyledNavLink>
          ))}
        </Nav>

        <RuleDivider variant="mid" spacing="sm" />
      </Inner>
    </Header>
  )
}

export default NavBar