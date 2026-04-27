import React from 'react'
import styled from 'styled-components'

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    label: string       // required for accessibility (aria-label)
    size?: 'sm' | 'md'
}

const Btn = styled.button<{ $size: 'sm' | 'md' }>`
  display:         inline-flex;
  align-items:     center;
  justify-content: center;
  width:  ${({ $size }) => ($size === 'sm' ? '28px' : '36px')};
  height: ${({ $size }) => ($size === 'sm' ? '28px' : '36px')};
  border-radius: ${({ theme }) => theme.radii.sm};
  color:      ${({ theme }) => theme.colors.inkSecondary};
  background: transparent;
  transition: color      ${({ theme }) => theme.transitions.fast},
              background ${({ theme }) => theme.transitions.fast};

  svg {
    width:  ${({ $size }) => ($size === 'sm' ? '14px' : '18px')};
    height: ${({ $size }) => ($size === 'sm' ? '14px' : '18px')};
    stroke-width: 1.75;
  }

  &:hover:not(:disabled) {
    color:      ${({ theme }) => theme.colors.inkPrimary};
    background: ${({ theme }) => theme.colors.surfaceAlt};
  }

  &:disabled {
    opacity: 0.35;
    cursor:  not-allowed;
  }
`

const IconButton: React.FC<IconButtonProps> = ({
    label,
    size = 'md',
    children,
    ...rest
}) => (
    <Btn aria-label={label} $size={size} {...rest}>
        {children}
    </Btn>
)

export default IconButton