import styled, { keyframes } from 'styled-components';

const peekIn = keyframes`
  from { transform: translateY(-50%) translateX(8px); }
  to   { transform: translateY(-50%) translateX(0); }
`;

// Drive the tab's right-position off `$open` (not `$mounted`).
// `$open` flips to false immediately when close is triggered, so the
// tab slides back to the right edge in sync with the panel's slide-out.
const Tab = styled.button<{ $open: boolean }>`
  position: fixed;
  right: ${p => p.$open ? 'calc(420px - 2px)' : '0'};
  top: 50%;
  transform: translateY(-50%);
  z-index: 300;
  transition: right 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 28px;
  padding: 18px 0;
  background: ${p => p.theme.colors.inkPrimary};
  border: none;
  border-radius: 6px 0 0 6px;
  cursor: pointer;
  box-shadow: -2px 2px 8px rgba(0,0,0,0.25);
  animation: ${peekIn} 0.4s ease;

  &:hover {
    background: ${p => p.theme.colors.inkSecondary};
  }
`;

const Label = styled.span`
  writing-mode: vertical-rl;
  text-orientation: mixed;
  transform: rotate(180deg);
  font-family: ${p => p.theme.fonts.serif};
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: ${p => p.theme.colors.pageBg};
  white-space: nowrap;
  user-select: none;
`;

const Chevron = styled.span<{ $open: boolean }>`
  font-size: 10px;
  color: ${p => p.theme.colors.pageBg};
  opacity: 0.6;
  transform: rotate(${p => p.$open ? '0deg' : '180deg'});
  transition: transform 0.3s ease;
`;

interface Props {
  open: boolean;
  onToggle: () => void;
}

export default function NotebookToggle({ open, onToggle }: Props) {
  // The tab is always rendered (mounted is handled by App.tsx for the panel,
  // but the toggle itself is always visible).
  // `$open={open}` makes the right-position animate in sync with open/close.
  // Previously `$open={mounted}` kept it docked during the slide-out but
  // then snapped to 0 only after the 350ms timeout — causing the lag.
  return (
    <Tab $open={open} onClick={onToggle} aria-label={open ? 'Close notebook' : 'Open notebook'}>
      <Chevron $open={open}>›</Chevron>
      <Label>Field Notes</Label>
      <Chevron $open={open}>›</Chevron>
    </Tab>
  );
}