import React from 'react'
import styled from 'styled-components'

interface SectionHeaderProps {
    title: string
    byline?: string        // optional italic sub-line beneath the title
    ruled?: boolean        // flanking horizontal rules (default true)
    size?: 'lg' | 'sm'
}

const Wrapper = styled.div`
  display:        flex;
  flex-direction: column;
  align-items:    center;
  text-align:     center;
  width:          100%;
`

const RuleRow = styled.div`
  display:     flex;
  align-items: center;
  width:       100%;
  gap:         ${({ theme }) => theme.spacing.md};
`

const Rule = styled.span`
  flex:             1;
  height:           1px;
  background-color: ${({ theme }) => theme.colors.ruleMid};
`

const Title = styled.h2<{ $size: 'lg' | 'sm' }>`
  font-family:    ${({ theme }) => theme.fonts.serif};
  font-weight:    ${({ theme }) => theme.fontWeights.black};
  font-size:      ${({ theme, $size }) =>
        $size === 'lg' ? theme.fontSizes.headline : theme.fontSizes.subhead};
  color:          ${({ theme }) => theme.colors.inkPrimary};
  letter-spacing: 0.1em;
  text-transform: uppercase;
  white-space:    nowrap;
  line-height:    1.1;
`

const Byline = styled.p`
  font-family:  ${({ theme }) => theme.fonts.sansSerif};
  font-size:    ${({ theme }) => theme.fontSizes.byline};
  font-style:   italic;
  color:        ${({ theme }) => theme.colors.inkMuted};
  margin-top:   ${({ theme }) => theme.spacing.xs};
  letter-spacing: 0.05em;
`

const SectionHeader: React.FC<SectionHeaderProps> = ({
    title,
    byline,
    ruled = true,
    size = 'lg',
}) => (
    <Wrapper>
        {ruled ? (
            <RuleRow>
                <Rule />
                <Title $size={size}>{title}</Title>
                <Rule />
            </RuleRow>
        ) : (
            <Title $size={size}>{title}</Title>
        )}
        {byline && <Byline>{byline}</Byline>}
    </Wrapper>
)

export default SectionHeader