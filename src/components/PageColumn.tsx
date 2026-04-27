import styled from 'styled-components'

// A constrained-width editorial column — all pages compose inside this.
// max-width keeps the line length readable without going wall-to-wall.

const PageColumn = styled.main`
  width:      100%;
  max-width:  780px;
  margin:     0 auto;
  padding:    ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.lg};

  @media (max-width: 600px) {
    padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.md};
  }
`

export default PageColumn