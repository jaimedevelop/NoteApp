import React from 'react'
import styled, { keyframes } from 'styled-components'

export type SyncStatus = 'idle' | 'saving' | 'saved'

interface Props { status: SyncStatus }

const fadeIn = keyframes`from { opacity: 0 } to { opacity: 1 }`
const spin = keyframes`from { transform: rotate(0deg) } to { transform: rotate(360deg) }`

const Wrap = styled.div<{ $visible: boolean }>`
  display:     flex;
  align-items: center;
  gap:         6px;
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size:   ${({ theme }) => theme.fontSizes.caption};
  color:       ${({ theme }) => theme.colors.inkMuted};
  letter-spacing: 0.06em;
  opacity:     ${({ $visible }) => $visible ? 1 : 0};
  transition:  opacity 0.4s ease;
  animation:   ${fadeIn} 0.3s ease;
  user-select: none;
`

const Spinner = styled.span`
  display:        inline-block;
  width:          10px;
  height:         10px;
  border:         1.5px solid ${({ theme }) => theme.colors.inkMuted};
  border-top-color: transparent;
  border-radius:  50%;
  animation:      ${spin} 0.7s linear infinite;
`

const Dot = styled.span`
  width:         7px;
  height:        7px;
  border-radius: 50%;
  background:    ${({ theme }) => theme.colors.statusComplete ?? '#4a7c59'};
  display:       inline-block;
`

const SaveIndicator: React.FC<Props> = ({ status }) => (
    <Wrap $visible={status !== 'idle'}>
        {status === 'saving' && <><Spinner /> Dispatching to archive…</>}
        {status === 'saved' && <><Dot /> Filed.</>}
    </Wrap>
)

export default SaveIndicator