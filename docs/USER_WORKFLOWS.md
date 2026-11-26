# End-to-end user workflows

## Onboarding
Sign in → server establishes personal workspace → integrations show disconnected → choose Gmail/Calendar and grant permissions using supported Corsair flow → verify account belongs to workspace → initial bounded refresh → home. Handle declined consent, expired grant, missing scope, reconnect and disconnect. Local CLI test tenant only for private spike; never public demo with global tenant.

## Gmail
Inbox → list/filter/search → select thread → read sanitized content → compose/reply → edit recipient/body → send or save draft → show real result → invalidate cache/refresh. Archive/star/read changes P1. Missing or stale cache shows refresh status. Manual send uses explicit user click and duplicate-submission guard.

## Calendar
Week view → choose time slot → fill title/date/time/timezone/attendees → check fresh availability → save or send invite → display provider-confirmed result. Editing and deletion show attendee notification choice and cancellation confirmation. All-day events preserve dates. Conflict/unknown availability: do not imply free time; let user choose alternatives or explicitly override a known conflict.

## Flagship AI workflow
Open meeting request → ask to check availability, schedule, reply → resolve selected thread and user timezone → extract proposed time/recipient with provenance; clarify ambiguous details → live availability → propose event and reply with separate editable cards → approve exact revision → check connection and availability again → create event → record result → only then send reply → display independent statuses and external references.

If original email already includes a calendar invite, check existing event/RSVP workflow rather than creating a duplicate; RSVP is optional and may require separate supported operation. If attendee address absent, ask instead of guessing. If event creation fails, skip reply. If event succeeds and reply fails, show partial success; retry only safe failed step. If send result unknown, reconcile before retry. If user cancels, nothing is written remotely. If another event appears after review, request fresh confirmation.

## Search and home (P1)
Global search → select email or event result; preserve query and scope. Home shows latest cache freshness, upcoming schedule and important unread messages. AI briefing opt-in and data-minimized; no implied autonomous actions. Keyboard shortcuts cannot trigger send without explicit action intent.
