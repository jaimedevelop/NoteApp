import React from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import MarginText from './MarginText';
import { NOTEBOOK_WIDTH } from '../notebook/Notebook';

// Illustrations
import GasLamp from './GasLamp';
import Ship from './Ship';
import NewEnglandStreet from './NewEnglandStreet';
import PrintingPress from './PrintingPress';
import PocketWatch from './PocketWatch';
import WritingDesk from './WritingDesk';
import Orrery from './Orrery';
import Lighthouse from './LightHouse';

// ── Layout ──────────────────────────────────────────────────────────────────

const MARGIN_COL = 200;

const Wrap = styled.div`
  display: flex;
  align-items: flex-start;
  width: 100%;
  min-height: 100vh;
`;

const MarginCol = styled.aside<{ $side: 'left' | 'right'; $notebookOpen: boolean }>`
  width: ${MARGIN_COL}px;
  flex-shrink: 0;
  position: sticky;
  top: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: ${({ $side }) => $side === 'left' ? '0 16px 0 24px' : '0 24px 0 16px'};
  transition: margin-right 0.35s ease;
  margin-right: ${({ $side, $notebookOpen }) =>
        $side === 'right' && $notebookOpen ? `${NOTEBOOK_WIDTH}px` : '0'};

  @media (max-width: 1200px) { display: none; }
`;

const Main = styled.div`
  flex: 1;
  min-width: 0;
`;

// ── Page configs ─────────────────────────────────────────────────────────────

type PageKey = 'summary' | 'tasks' | 'calendar';

interface MarginConfig {
    left: React.ReactNode;
    right: React.ReactNode;
}

function SummaryLeft() {
    return (
        <>
            <PrintingPress />
            <MarginText
                head="This Morning's Edition"
                dropCap
                body="The compositors worked through the night to bring forth this day's account. Ink was set by lamplight, and the first sheets pulled before the cocks had crowed. What follows represents the fullest intelligence available at the hour of going to press."
                footer="Continued on Page 2."
            />
            <MarginText
                head="From the Editor's Desk"
                body="Readers are reminded that correspondence intended for publication must arrive no later than the Wednesday post. Anonymous letters, though received in good faith, shall not be entered into the record without a countersigning party known to this office."
            />
        </>
    );
}

function SummaryRight() {
    return (
        <>
            <PocketWatch />
            <MarginText
                head="Dispatch & Intelligence"
                dropCap
                body="By telegraph from the northern counties: conditions reported fair, with moderate winds from the south-west. Commerce moves briskly along the post roads. Several conveyances delayed at the ford near Ashwick, but passage is expected to resume by mid-morning."
                footer="— By Electric Telegraph"
                footerItalic
            />
            <WritingDesk />
            <MarginText
                head="A Word to Subscribers"
                body="This journal is published each morning save Sunday and the principal feast days. Annual subscriptions may be arranged through any licensed stationer. Back issues are held at the offices on Threadneedle-street for a period of six months."
            />
        </>
    );
}

function TasksLeft() {
    return (
        <>
            <GasLamp />
            <MarginText
                head="From Our Correspondent"
                dropCap
                body="The lamplighter made his customary rounds at dusk, his pole casting small coronas upon the wet cobblestones. Residents of the lower ward report an uncommon stillness in the air preceding his passage, as though the city itself held its breath in anticipation of the flame."
                footer="Continued on Page 4."
            />
            <MarginText
                head="Notices & Announcements"
                body="The Merchants' Assembly convenes Thursday next at the Customs House. All parties holding outstanding warrants of lading are urged to present their documents before the close of business on Wednesday. Failure to appear shall be entered into the public record."
            />
        </>
    );
}

function TasksRight() {
    return (
        <>
            <Ship />
            <MarginText
                head="Shipping Intelligence"
                dropCap
                body="The barque Elinor Graves cleared the harbour bar on the evening tide, bound for the Azores with a full complement of dry goods and correspondence. Her captain, a Mr. Aldous Finch, reports the sea running high but the vessel in excellent trim."
                footer="— By Special Correspondent"
                footerItalic
            />
            <NewEnglandStreet />
            <MarginText
                head="Weather & Tides"
                body="Skies overcast; wind NNE at moderate strength. High water at the inner wharf expected at half past six in the morning. Frost anticipated in the inland parishes. Citizens are advised to secure their shutters against the coming gale."
            />
        </>
    );
}

function CalendarLeft() {
    return (
        <>
            <Orrery />
            <MarginText
                head="The Celestial Record"
                dropCap
                body="Jupiter stands in opposition this fortnight, rising at dusk and setting at dawn, and may be observed with the naked eye in the south-eastern quarter of the sky. Saturn's rings remain visible through even a modest instrument of two-inch aperture."
                footer="— From the Almanack"
                footerItalic
            />
            <MarginText
                head="Moon & Tidal Tables"
                body="New moon on the 14th. First quarter on the 21st. High spring tides expected on the 15th and 16th; mariners are cautioned against the harbour bar at these times. The river authority has issued advisements to the lower parishes."
            />
        </>
    );
}

function CalendarRight() {
    return (
        <>
            <Lighthouse />
            <MarginText
                head="The Keeper's Log"
                dropCap
                body="Light exhibited without interruption throughout the preceding week. Visibility poor on the nights of the 9th and 10th on account of sea-mist; the fog signal was operated continuously for fourteen hours. No vessels reported in distress."
                footer="— Trinity House, Eastern District"
                footerItalic
            />
            <MarginText
                head="Seasonal Observations"
                body="The first frosts of the season have now reached the coastal parishes. Market gardeners report the harvest of root vegetables proceeding in good order. Wildfowl observed moving southward in considerable numbers over the estuary this past week."
            />
        </>
    );
}

const PAGE_CONFIGS: Record<PageKey, MarginConfig> = {
    summary: { left: <SummaryLeft />, right: <SummaryRight /> },
    tasks: { left: <TasksLeft />, right: <TasksRight /> },
    calendar: { left: <CalendarLeft />, right: <CalendarRight /> },
};

function routeToPage(pathname: string): PageKey {
    if (pathname.startsWith('/tasks')) return 'tasks';
    if (pathname.startsWith('/calendar')) return 'calendar';
    return 'summary';
}

// ── Component ────────────────────────────────────────────────────────────────

interface Props {
    notebookOpen: boolean;
    children: React.ReactNode;
}

export default function MarginLayout({ notebookOpen, children }: Props) {
    const { pathname } = useLocation();
    const page = routeToPage(pathname);
    const config = PAGE_CONFIGS[page];

    return (
        <Wrap>
            <MarginCol $side="left" $notebookOpen={false}>
                {config.left}
            </MarginCol>

            <Main>{children}</Main>

            <MarginCol $side="right" $notebookOpen={notebookOpen}>
                {config.right}
            </MarginCol>
        </Wrap>
    );
}