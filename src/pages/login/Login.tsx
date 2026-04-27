import React, { useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { signIn } from '../../firebase/auth'

// ─── Animations ───────────────────────────────────────────────────────────────

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(18px) rotate(-1.5deg); }
  to   { opacity: 1; transform: translateY(0)    rotate(-1.5deg); }
`

const fadeUpFlat = keyframes`
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0);    }
`

// ─── Page ─────────────────────────────────────────────────────────────────────

const Page = styled.div`
  min-height:      100vh;
  background-color: ${({ theme }) => theme.colors.surfaceAlt};
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23noise)' opacity='0.06'/%3E%3C/svg%3E");
  display:         flex;
  flex-direction:  column;
  align-items:     center;
  justify-content: center;
  gap:             ${({ theme }) => theme.spacing.xl};
  padding:         ${({ theme }) => theme.spacing.xl};
`

// ─── Envelope backdrop ────────────────────────────────────────────────────────

const Envelope = styled.div`
  position:      relative;
  width:         100%;
  max-width:     480px;
  background:    #c8b99a;
  padding:       ${({ theme }) => theme.spacing.xl};
  box-shadow:    4px 6px 24px rgba(26, 20, 8, 0.28);
  animation:     ${fadeUpFlat} 600ms ease both;

  /* V-flap at the top via clip-path on a pseudo-element */
  &::before {
    content:    '';
    position:   absolute;
    top:        0; left: 0; right: 0;
    height:     56px;
    background: #b8a88a;
    clip-path:  polygon(0 0, 100% 0, 50% 100%);
  }

  /* Bottom flap line */
  &::after {
    content:    '';
    position:   absolute;
    bottom:     0; left: 0; right: 0;
    height:     1px;
    background: ${({ theme }) => theme.colors.ruleMid};
  }
`

// ─── The letter / card inside ─────────────────────────────────────────────────

const Card = styled.div`
  position:         relative;
  background-color: ${({ theme }) => theme.colors.pageBg};
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23noise)' opacity='0.045'/%3E%3C/svg%3E");
  border:           1px solid ${({ theme }) => theme.colors.ruleLight};
  padding:          ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.xl};
  margin-top:       ${({ theme }) => theme.spacing.lg};
  transform:        rotate(-1.5deg);
  transform-origin: center top;
  box-shadow:       2px 4px 14px rgba(26, 20, 8, 0.15);
  animation:        ${fadeUp} 700ms 100ms ease both;
`

// ─── Postmark circle (top-right corner) ──────────────────────────────────────

const Postmark = styled.div`
  position:  absolute;
  top:       ${({ theme }) => theme.spacing.md};
  right:     ${({ theme }) => theme.spacing.md};
  width:     64px;
  height:    64px;
  border:    2px solid ${({ theme }) => theme.colors.ruleMid};
  border-radius: 50%;
  display:   flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity:   0.55;
`

const PostmarkLine = styled.span`
  font-family:    ${({ theme }) => theme.fonts.mono};
  font-size:      7px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color:          ${({ theme }) => theme.colors.inkSecondary};
  line-height:    1.4;
  text-align:     center;
`

// ─── Stamp (top-right, offset from postmark) ─────────────────────────────────

const Stamp = styled.div`
  position:      absolute;
  top:           ${({ theme }) => theme.spacing.md};
  right:         86px;
  width:         44px;
  height:        54px;
  border:        2px solid ${({ theme }) => theme.colors.ruleMid};
  background:    ${({ theme }) => theme.colors.surfaceAlt};
  display:       flex;
  align-items:   center;
  justify-content: center;
  font-size:     22px;
  opacity:       0.7;

  /* Perforated edge effect */
  outline:        3px dashed ${({ theme }) => theme.colors.ruleLight};
  outline-offset: -6px;
`

// ─── Letter content ───────────────────────────────────────────────────────────

const AddressBlock = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  padding-right: 80px; /* clear the stamp/postmark */
`

const ToLine = styled.p`
  font-family:    ${({ theme }) => theme.fonts.mono};
  font-size:      ${({ theme }) => theme.fontSizes.caption};
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color:          ${({ theme }) => theme.colors.inkMuted};
  margin-bottom:  ${({ theme }) => theme.spacing.xs};
`

const Recipient = styled.h1`
  font-family:    ${({ theme }) => theme.fonts.serif};
  font-size:      ${({ theme }) => theme.fontSizes.headline};
  font-weight:    ${({ theme }) => theme.fontWeights.black};
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color:          ${({ theme }) => theme.colors.inkPrimary};
  line-height:    1.1;
`

const SubRecipient = styled.p`
  font-family: ${({ theme }) => theme.fonts.sansSerif};
  font-size:   ${({ theme }) => theme.fontSizes.byline};
  font-style:  italic;
  color:       ${({ theme }) => theme.colors.inkMuted};
  margin-top:  ${({ theme }) => theme.spacing.xs};
`

const Salutation = styled.p`
  font-family:   ${({ theme }) => theme.fonts.sansSerif};
  font-size:     ${({ theme }) => theme.fontSizes.body};
  font-style:    italic;
  color:         ${({ theme }) => theme.colors.inkSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  border-top:    1px solid ${({ theme }) => theme.colors.ruleLight};
  padding-top:   ${({ theme }) => theme.spacing.md};
`

// ─── Form fields ──────────────────────────────────────────────────────────────

const FieldGroup = styled.div`
  display:        flex;
  flex-direction: column;
  gap:            ${({ theme }) => theme.spacing.md};
  margin-bottom:  ${({ theme }) => theme.spacing.lg};
`

const FieldWrapper = styled.div`
  display:        flex;
  flex-direction: column;
  gap:            4px;
`

const FieldLabel = styled.label`
  font-family:    ${({ theme }) => theme.fonts.serif};
  font-size:      ${({ theme }) => theme.fontSizes.caption};
  font-weight:    ${({ theme }) => theme.fontWeights.bold};
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color:          ${({ theme }) => theme.colors.inkMuted};
`

const FieldInput = styled.input`
  background:    transparent;
  border:        none;
  border-bottom: 1px solid ${({ theme }) => theme.colors.ruleMid};
  padding:       ${({ theme }) => theme.spacing.xs} 0;
  font-family:   ${({ theme }) => theme.fonts.sansSerif};
  font-size:     ${({ theme }) => theme.fontSizes.body};
  color:         ${({ theme }) => theme.colors.inkPrimary};
  outline:       none;
  transition:    border-color ${({ theme }) => theme.transitions.fast};
  width:         100%;

  &::placeholder { color: ${({ theme }) => theme.colors.inkMuted}; font-style: italic; }
  &:focus        { border-color: ${({ theme }) => theme.colors.inkSecondary}; }
`

// ─── Error line ───────────────────────────────────────────────────────────────

const ErrorLine = styled.p`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size:   ${({ theme }) => theme.fontSizes.caption};
  color:       ${({ theme }) => theme.colors.statusIncomplete};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  letter-spacing: 0.04em;
`

// ─── Submit ───────────────────────────────────────────────────────────────────

const SubmitRow = styled.div`
  display:         flex;
  align-items:     center;
  justify-content: space-between;
  border-top:      1px solid ${({ theme }) => theme.colors.ruleLight};
  padding-top:     ${({ theme }) => theme.spacing.md};
`

const Closing = styled.p`
  font-family: ${({ theme }) => theme.fonts.sansSerif};
  font-size:   ${({ theme }) => theme.fontSizes.caption};
  font-style:  italic;
  color:       ${({ theme }) => theme.colors.inkMuted};
  line-height: 1.5;
`

const SubmitBtn = styled.button`
  font-family:    ${({ theme }) => theme.fonts.serif};
  font-size:      ${({ theme }) => theme.fontSizes.byline};
  font-weight:    ${({ theme }) => theme.fontWeights.bold};
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color:          ${({ theme }) => theme.colors.white};
  background:     ${({ theme }) => theme.colors.inkPrimary};
  border:         2px solid ${({ theme }) => theme.colors.inkPrimary};
  padding:        ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  border-radius:  ${({ theme }) => theme.radii.sm};
  transition:     background ${({ theme }) => theme.transitions.fast},
                  border-color ${({ theme }) => theme.transitions.fast};

  &:hover:not(:disabled) {
    background:   ${({ theme }) => theme.colors.accent};
    border-color: ${({ theme }) => theme.colors.accent};
  }

  &:disabled { opacity: 0.45; cursor: not-allowed; }
`

// ─── Footer masthead beneath envelope ────────────────────────────────────────

const FooterText = styled.p`
  font-family:    ${({ theme }) => theme.fonts.serif};
  font-size:      ${({ theme }) => theme.fontSizes.caption};
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color:          ${({ theme }) => theme.colors.inkMuted};
  opacity:        0.6;
  animation:      ${fadeUpFlat} 800ms 250ms ease both;
`

// ─── Component ────────────────────────────────────────────────────────────────

const Login: React.FC = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const today = new Date().toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric',
    })

    const handleSubmit = async () => {
        if (!email || !password) return
        setLoading(true)
        setError(null)
        try {
            await signIn(email, password)
            // App.tsx will detect the auth state change and redirect automatically
        } catch {
            setError('Credentials not recognised. Please check your dispatch and try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSubmit()
    }

    return (
        <Page>
            <Envelope>
                <Card>
                    {/* Postmark */}
                    <Postmark>
                        <PostmarkLine>Daily</PostmarkLine>
                        <PostmarkLine>Planner</PostmarkLine>
                        <PostmarkLine>{new Date().getFullYear()}</PostmarkLine>
                    </Postmark>

                    {/* Stamp */}
                    <Stamp>✉</Stamp>

                    {/* Address block */}
                    <AddressBlock>
                        <ToLine>Correspondent's Credentials —</ToLine>
                        <Recipient>The Daily Planner</Recipient>
                        <SubRecipient>Editorial Office, Personal Dispatch</SubRecipient>
                    </AddressBlock>

                    <Salutation>
                        To the Editor — kindly present your credentials to gain admittance
                        to the day's dispatches, dated {today}.
                    </Salutation>

                    {/* Form */}
                    <FieldGroup>
                        <FieldWrapper>
                            <FieldLabel htmlFor="email">Correspondent's Address</FieldLabel>
                            <FieldInput
                                id="email"
                                type="email"
                                placeholder="your@address.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                onKeyDown={handleKeyDown}
                                autoComplete="email"
                            />
                        </FieldWrapper>

                        <FieldWrapper>
                            <FieldLabel htmlFor="password">Cipher / Passphrase</FieldLabel>
                            <FieldInput
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                onKeyDown={handleKeyDown}
                                autoComplete="current-password"
                            />
                        </FieldWrapper>
                    </FieldGroup>

                    {error && <ErrorLine>⚑ {error}</ErrorLine>}

                    <SubmitRow>
                        <Closing>
                            Yours faithfully,<br />
                            <em>The Chronicle System</em>
                        </Closing>
                        <SubmitBtn onClick={handleSubmit} disabled={loading || !email || !password}>
                            {loading ? 'Verifying…' : 'Submit Dispatch'}
                        </SubmitBtn>
                    </SubmitRow>
                </Card>
            </Envelope>

            <FooterText>The Daily Planner · Personal Edition</FooterText>
        </Page>
    )
}

export default Login