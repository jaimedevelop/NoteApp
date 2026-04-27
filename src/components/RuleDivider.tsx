import styled, { css } from 'styled-components'

type RuleVariant = 'heavy' | 'mid' | 'light' | 'masthead'

interface RuleDividerProps {
    variant?: RuleVariant
    spacing?: 'xs' | 'sm' | 'md' | 'lg'
}

// The masthead variant mirrors the thick-thin-thick triple rule seen in
// period newspaper column breaks and below the paper's title banner.
const mastheadRule = css`
  border: none;
  border-top: 3px solid ${({ theme }) => theme.colors.ruleHeavy};
  box-shadow:
    0 2px 0 0 ${({ theme }) => theme.colors.ruleHeavy},
    0 4px 0 0 ${({ theme }) => theme.colors.ruleMid};
  margin-bottom: 5px;
`

const RuleDivider = styled.hr<RuleDividerProps>`
  width: 100%;
  border: none;
  margin-top:    ${({ theme, spacing = 'md' }) => theme.spacing[spacing]};
  margin-bottom: ${({ theme, spacing = 'md' }) => theme.spacing[spacing]};

  ${({ variant = 'mid', theme }) => {
        if (variant === 'masthead') return mastheadRule
        if (variant === 'heavy')
            return `border-top: 2px solid ${theme.colors.ruleHeavy};`
        if (variant === 'light')
            return `border-top: 1px solid ${theme.colors.ruleLight};`
        return `border-top: 1px solid ${theme.colors.ruleMid};`
    }}
`

export default RuleDivider