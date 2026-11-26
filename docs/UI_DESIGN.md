# UI design specification

## Brand and visual direction

KriyZen is a calm, warm, minimal editorial SaaS product. Use the Hallmark Coral theme as visual inspiration only: [https://www.usehallmark.com/themes/coral/](https://www.usehallmark.com/themes/coral/). The reference demonstrates a product-led story with clear examples and interactive demonstrations. KriyZen keeps its own name, voice, layouts, visual assets, product functionality, and Gmail/Calendar workflows. Do not buy the theme, reuse its source code, or copy its branding or content.

- **Color:** off-white and ivory surfaces with muted coral accents. Use restrained borders and soft, low-contrast shadows to separate layers. Avoid using coral for large areas or every call to action.
- **Type:** elegant serif headings on public/marketing pages; clean sans-serif typography throughout the application workspace and dense data views.
- **Layout:** generous whitespace on public pages; workspace remains efficient and scannable for mail, calendar, and review tasks. Keep core actions easy to find.
- **Imagery:** use original product-focused illustrations and interactive demonstrations based on KriyZen's own email, calendar, and approval workflows. Never imply a feature works before it does.
- **Motion:** minimal, purposeful transitions for navigation, panels, and feedback. Respect `prefers-reduced-motion`; never rely on motion alone to communicate state.
- **Themes:** provide consistent, accessible light and dark themes. Keep semantic color roles consistent across themes and maintain visible focus, error, success, warning, and disabled states.

### Draft semantic color tokens

These values are starting points for implementation, not a finished brand palette. Recheck text, control, focus, chart, and status contrast in context before release.

| Role | Light theme | Dark theme |
|---|---|---|
| Page background | `#F7F4EF` | `#201C1A` |
| Surface | `#FFFCF8` | `#2A2522` |
| Primary text | `#292522` | `#F5F0EB` |
| Secondary text | `#625A55` | `#C4B9B1` |
| Border | `#DED6CF` | `#49413C` |
| Accent / action | `#A8433B` | `#F29A86` |
| Accent soft surface | `#F3E0DA` | `#49312D` |

Use semantic tokens through Tailwind and shadcn/ui rather than scattering raw color values. For filled accent controls, choose foreground text that meets contrast requirements in each theme. Do not use color as the only status cue.

## Application experience

Keep the product centered on real, user-controlled Gmail and Calendar work. Public pages may tell the product story; the workspace should prioritize task completion, clear connection and freshness status, and safe review of proposed actions. Demonstrations and sample content must be labeled and must not look like live account results.

| Screen | Essential UI states |
|---|---|
| Public landing | Product-focused story, original illustration/demo, clear path to sign-in; no unimplemented feature claims |
| Sign-in/onboarding | Disconnected, consent pending, connected, retry, sync |
| Workspace shell | Navigation for Gmail, Calendar, Assistant, Integrations, and settings; responsive and keyboard accessible |
| Mail | List, reader, search, compose, draft, sent, loading/empty/error, stale cache |
| Calendar | Week view, create/edit modal, details, attendees, conflict, all-day, timezone |
| Assistant | Contextual drawer and full page, chat history, read progress, editable plan, approval, success/partial/unknown |
| Integrations | Real connection statuses, reconnect/disconnect; future apps marked Coming Soon |
| Home/command palette/activity | P1; schedule, inbox, navigation, and recent results only when backed by real data |

Desktop priority is 1280–1440px. Mobile must support reading, composing, event editing, and assistant review without hiding essential actions. Use visible focus, labels, keyboard navigation, announced status changes, and clear validation errors. Confirm, edit, cancel, and retry controls must reflect server state. Render email HTML safely; remote images are disabled by default.

## Component and implementation constraints

The implementation stack remains Next.js, Tailwind CSS, shadcn/ui, Radix UI primitives, and Lucide icons. Use accessible shadcn/Radix components and Lucide icons consistently; do not add another UI framework. The P01.3 foundation may install shared primitives and theme tokens; build product screens only in their approved phase.

## Design workflow

Use the design direction above when preparing future mockups. Start with a coherent system and representative states rather than disconnected screens. Use fictional sample data for design demonstrations and label it clearly. Design the approval journey to show proposal, review, edit/cancel, and per-step outcomes without suggesting the model can execute unapproved writes.

