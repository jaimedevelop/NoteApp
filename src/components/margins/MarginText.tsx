import styled from 'styled-components';

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Rule = styled.hr<{ $double?: boolean }>`
  border: none;
  border-top: 1px solid ${p => p.theme.colors.inkPrimary};
  width: 100%;
  ${p => p.$double && `box-shadow: 0 3px 0 ${p.theme.colors.inkPrimary}; margin-bottom: 2px;`}
`;

const Head = styled.div`
  font-family: ${p => p.theme.fonts.serif};
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: ${p => p.theme.colors.inkSecondary};
  text-align: center;
`;

const Body = styled.p<{ $dropCap?: boolean }>`
  font-family: ${p => p.theme.fonts.serif};
  font-size: 12.5px;
  line-height: 1.65;
  color: ${p => p.theme.colors.inkSecondary};
  text-align: justify;
  hyphens: auto;

  ${p => p.$dropCap && `
    &::first-letter {
      float: left;
      font-size: 2.8em;
      line-height: 0.78;
      margin: 4px 4px 0 0;
      font-weight: 700;
      color: ${p.theme.colors.inkPrimary};
    }
  `}
`;

const Footer = styled.div<{ $italic?: boolean }>`
  font-family: ${p => p.theme.fonts.serif};
  font-size: 11px;
  font-style: ${p => p.$italic ? 'italic' : 'normal'};
  color: ${p => p.theme.colors.inkMuted};
  text-align: center;
`;

interface Props {
    head: string;
    body: string;
    dropCap?: boolean;
    footer?: string;
    footerItalic?: boolean;
}

export default function MarginText({ head, body, dropCap, footer, footerItalic }: Props) {
    return (
        <Section>
            <Rule $double />
            <Head>{head}</Head>
            <Rule />
            <Body $dropCap={dropCap}>{body}</Body>
            {footer && <Rule />}
            {footer && <Footer $italic={footerItalic}>{footer}</Footer>}
        </Section>
    );
}