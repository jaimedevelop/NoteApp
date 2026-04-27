import { useState, useRef } from 'react';
import styled from 'styled-components';

// ── Styled ─────────────────────────────────────────────────────────────────────

const Wrap = styled.div`
  padding: 10px 12px 12px;
  border-top: 1px solid ${p => p.theme.colors.inkMuted};
  flex-shrink: 0;
`;

const Row = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
`;

const Input = styled.input`
  flex: 1;
  font-family: ${p => p.theme.fonts.serif};
  font-size: 13px;
  background: transparent;
  border: none;
  border-bottom: 1px solid ${p => p.theme.colors.inkMuted};
  outline: none;
  color: ${p => p.theme.colors.inkPrimary};
  padding: 3px 0;

  &::placeholder { color: ${p => p.theme.colors.inkMuted}; font-style: italic; }
  &:focus { border-bottom-color: ${p => p.theme.colors.inkSecondary}; }
`;

const DateInput = styled.input`
  font-family: ${p => p.theme.fonts.sansSerif};
  font-size: 11px;
  border: 1px solid ${p => p.theme.colors.inkMuted};
  border-radius: 2px;
  padding: 3px 5px;
  background: ${p => p.theme.colors.pageBg};
  color: ${p => p.theme.colors.inkPrimary};
  outline: none;
  cursor: pointer;

  &:focus { border-color: ${p => p.theme.colors.inkSecondary}; }
`;

const SubmitBtn = styled.button`
  font-family: ${p => p.theme.fonts.serif};
  font-size: 12px;
  padding: 3px 10px;
  background: ${p => p.theme.colors.inkPrimary};
  color: ${p => p.theme.colors.pageBg};
  border: none;
  border-radius: 3px;
  cursor: pointer;
  white-space: nowrap;

  &:disabled { opacity: 0.4; cursor: default; }
`;

const Hint = styled.p`
  font-family: ${p => p.theme.fonts.serif};
  font-size: 10px;
  color: ${p => p.theme.colors.inkMuted};
  margin: 5px 0 0;
  font-style: italic;
`;

// ── Component ──────────────────────────────────────────────────────────────────

interface Props {
    onAdd: (text: string, dueDate?: string) => Promise<void>;
}

export default function NoteComposer({ onAdd }: Props) {
    const [text, setText] = useState('');
    const [due, setDue] = useState('');
    const [pending, setPending] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    async function handleSubmit(e?: React.FormEvent) {
        e?.preventDefault();
        const t = text.trim();
        if (!t || pending) return;
        setPending(true);
        await onAdd(t, due || undefined);
        setText('');
        setDue('');
        setPending(false);
        inputRef.current?.focus();
    }

    return (
        <Wrap>
            <Row>
                <Input
                    ref={inputRef}
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder="Add a new entry…"
                    onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
                    disabled={pending}
                />
                <DateInput
                    type="date"
                    value={due}
                    onChange={e => setDue(e.target.value)}
                    title="Optional due date"
                />
                <SubmitBtn onClick={() => handleSubmit()} disabled={!text.trim() || pending}>
                    File
                </SubmitBtn>
            </Row>
            <Hint>Enter to file · Double-click entry to edit · ⠿ to reorder</Hint>
        </Wrap>
    );
}