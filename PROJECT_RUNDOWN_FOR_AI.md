# UNIUYO Event Finder — Complete Project Rundown and AI Handoff

## 1. Purpose of this document

This document is a technical and historical handoff for the `uniuyo-event-finder` project. It is intended to give another AI enough verified context to generate full project documentation, a report, defence material, diagrams, test plans, or improvement proposals without having to guess how the system works.

The most important distinction is that the repository contains two generations of the project:

1. The committed `Initial commit` is a browser-only academic prototype using HTML, CSS, vanilla JavaScript, and `localStorage`.
2. The current working tree is a much larger, presently uncommitted upgrade using Supabase Authentication, PostgreSQL, Row Level Security, a Supabase Edge Function, Paystack test payments, public event links, guest registration, and real server-issued tickets.

Only one Git commit exists (`0e2e311`, message: `Initial commit`). Therefore, the broad transition from the original prototype to the current application can be proven from the Git diff, but the exact order in which every uncommitted edit was made cannot be reconstructed. Any future documentation must not invent dates, conversations, error logs, or a commit-by-commit sequence that the repository does not contain.

## 2. Product summary

UNIUYO Events is a responsive campus event discovery and ticketing website designed around the University of Uyo's three campus locations:

- Permanent Site
- Town Campus
- Annex

The system serves three practical roles:

- Students and visitors can discover, search, filter, save, and inspect events.
- Signed-in organizers can publish free or paid community events and view basic performance summaries.
- Guests can open a public event link, register without creating an account, pay through Paystack for paid events, and receive a digital ticket after server-side verification.

It is an academic prototype, not an official University of Uyo service. The twelve built-in sample events are fictional, and community events are not university-approved announcements.

## 3. Problem being solved

Campus event information is often fragmented across physical noticeboards, class groups, social media, and word of mouth. This creates two related problems:

- Students may not discover useful academic, career, social, cultural, religious, sporting, or entrepreneurial events in time.
- Organizers lack a simple central place to publish an event, share one registration link, accept payment, and see basic attendance/revenue information.

The project centralizes discovery across the three campuses and demonstrates a lightweight end-to-end publishing and ticketing flow.

## 4. Scope and non-goals

### Implemented scope

- Animated public landing page
- Light and dark themes
- Signup, sign-in, password recovery, and password update screens
- Supabase-managed user sessions
- Twelve fictional sample events
- Shared PostgreSQL-backed community events
- Keyword search and campus/category/date filtering
- Event detail modal
- Saved/bookmarked events
- Calendar view
- Campus Pulse activity summary
- Rule-based Smart Match recommendations
- Browser-based event reminders
- Authenticated organizer publishing
- Free and paid event prices
- Event capacity
- Nigerian bank listing and account resolution through Paystack
- Paystack subaccount creation for direct organizer settlement
- Public share links
- Guest registration without an account
- Free server-issued tickets
- Paid tickets issued after server verification
- Printable pass/ticket
- Organizer event, ticket, registration, and revenue overview

### Explicitly out of scope

- University moderation or official verification
- Automated refunds
- Coupons and discounts
- Allocated seating or seat maps
- Advanced KYC
- Ticket delivery by email or SMS
- QR-code generation and scanning
- Background reminder delivery when the page is closed
- A dedicated Node/Express application server
- Production-grade monitoring, audit logs, fraud controls, or rate limiting
- Machine-learning recommendations

## 5. Technology choices and reasons

### Frontend

- Semantic HTML5 provides the complete single-page document structure.
- CSS3 provides tokens, responsive layouts, component styling, animations, print rules, and reduced-motion behavior.
- Vanilla JavaScript provides routing, rendering, form handling, application state, and API calls.

There is no frontend framework, package manager, bundler, or compilation step. This keeps the academic project small and explainable from browser input through database output.

### Backend platform

Supabase was added because the original `localStorage` prototype could not support shared multi-user data. Supabase provides:

- Authentication and session management
- PostgreSQL tables and relationships
- Row Level Security policies
- PostgreSQL functions
- Edge Functions for trusted server-side operations

### Payments

Paystack test mode is used because it supports Nigerian banks, account resolution, transaction initialization and verification, and subaccounts. Secret-key operations run in the Edge Function, never in browser JavaScript.

### Local browser storage

`localStorage` remains appropriate for device-specific, lower-risk data:

- Theme preference
- Saved event IDs
- Reminder settings
- Smart Match interests
- Legacy/sample-event demonstration registrations
- Legacy submitted events, retained for backward compatibility

`sessionStorage` temporarily retains the event ID and guest email while the browser leaves for Paystack and returns to the callback page.

## 6. Reconstructed development phases

### Phase 1 — Original browser-only prototype

The committed initial version delivered a fully client-side single-page application. It had twelve fictional events and modules for event filtering, calendar navigation, recommendations, reminders, local event submission, local registration, and printable demonstration passes.

All user-created data was stored on one device in `localStorage`. This was useful for a self-contained demonstration but meant different browsers could not see the same event, registrations were not authoritative, anyone could edit stored data in developer tools, and real payment processing was impossible.

### Phase 2 — Experience and identity redesign

The current working tree adds a separate public experience layer:

- `css/experience.css` defines the new visual system.
- `js/public-views.js` produces landing and authentication templates.
- `js/shell.js` manages public/private views, hash routes, session-aware entry, theme switching, authentication forms, and landing animation.
- `js/auth.js` wraps Supabase Auth.
- `js/supabase.js` creates the public browser client.

The visual identity is called “Campus Pulse.” It uses editorial typography, poster-like event compositions, expressive category colors, layered motion, theme tokens, pointer parallax, scroll reveals, and reduced-motion support.

### Phase 3 — Shared database migration

`supabase/schema.sql` introduces five relational entities:

1. `event_profiles` — organizer identity and payout metadata.
2. `campus_events` — shared organizer-owned events.
3. `registrations` — guest details, quantity, total, and payment status.
4. `payments` — payment reference, amount, status, and payment time.
5. `tickets` — one unique ticket record per successful registration.

`js/data.js` maps database rows into the event object shape already expected by the original UI. This adapter allowed the calendar, filters, event cards, Campus Pulse, and recommendations to continue working without a framework rewrite.

`getAllEvents()` now merges three sources:

- Fixed `SAMPLE_EVENTS`
- Cached Supabase events
- Legacy locally submitted events that do not duplicate a remote event ID

### Phase 4 — Organizer publishing and payout setup

The event submission form gained price and capacity. Publishing now requires a Supabase session and writes to `campus_events` rather than only to `localStorage`.

When the price is above zero, the organizer must have a verified payout profile. The frontend:

1. Loads Nigerian banks from the payment Edge Function.
2. Accepts a bank and a ten-digit account number.
3. Requests server-side account resolution.
4. Displays the returned account name for confirmation.
5. Requests creation of a Paystack subaccount.
6. Retrieves the updated organizer profile.

Only the Paystack subaccount code, bank code/name, account name, last four account digits, and verification flag are persisted. The full bank account number is not stored in the project database.

### Phase 5 — Public sharing and guest ticketing

Organizer events get URLs in the form:

`<origin>/<path>?event=<slug-or-id>`

The Web Share API is used where available; otherwise the URL is copied with the Clipboard API. A guest opening the URL is shown the application event view and detail modal without being required to sign in.

Community events use two ticket paths:

- Free events call a protected PostgreSQL function that checks capacity and creates the registration and ticket in one server-side operation.
- Paid events call the Edge Function to initialize Paystack, leave the site for checkout, return with a reference, and call the Edge Function again to verify payment and issue the ticket.

Built-in fictional sample events retain the original local demonstration-pass behavior.

## 7. Current project structure

### Root documents

- `index.html` — full private application markup, modals, forms, footer, empty public root, stylesheet links, Supabase CDN, and script loading order.
- `README.md` — concise setup, architecture, flow, and limitations.
- `DEFENCE_NOTES.md` — short academic-defence explanation and likely questions.
- `PROJECT_RUNDOWN_FOR_AI.md` — this evidence-based implementation handoff.

### CSS

- `css/style.css` — original app styles: navigation, cards, filters, calendar, forms, modals, passes, responsiveness, and print behavior.
- `css/experience.css` — landing/auth design system, theme overrides, poster compositions, visual motion, payout controls, organizer screens, and newer experience components.

### JavaScript

- `js/supabase.js` — public project URL, anon key, and Supabase browser client initialization.
- `js/auth.js` — session lookup, signup, sign-in, sign-out, reset email, password update, and auth-state subscription.
- `js/public-views.js` — HTML template functions for the public landing page and authentication routes.
- `js/shell.js` — public hash routing, theme persistence, session switching, auth validation/error handling, landing animation, and sign-out.
- `js/data.js` — database row mapping, published event loading, event creation, profile loading, organizer event summaries, free-ticket RPC, and Edge Function invocation.
- `js/events.js` — campus/category/interest configuration, twelve sample events, date helpers, ID generation, and merged event access.
- `js/storage.js` — defensive `localStorage` wrapper and operations for saved events, legacy submissions/registrations, interests, and reminders.
- `js/recommendations.js` — deterministic interest keyword scoring and result rendering.
- `js/calendar.js` — month calculations, campus-filtered event days, keyboard-accessible dates, and selected-day results.
- `js/registration.js` — sample registration, community free/paid registration, payment redirection, and pass rendering.
- `js/reminders.js` — reminder persistence, periodic due checks, in-app toast, optional browser notification, and reminder management.
- `js/app.js` — central private SPA controller: navigation, filters, cards, modals, details, saved events, Campus Pulse, submission, organizer payout, sharing, dashboard, startup loading, guest links, and payment callback.

### Supabase

- `supabase/schema.sql` — tables, constraints, indexes, triggers, RLS, and free-ticket RPC.
- `supabase/config.toml` — disables automatic JWT enforcement for the guest-facing payment function; individual protected actions authenticate explicitly.
- `supabase/functions/event-payments/index.ts` — bank lookup, account resolution, subaccount creation, payment initialization, verification, and paid ticket issuance.

## 8. Frontend boot and routing sequence

Scripts are classic browser scripts and depend on their order in `index.html`. The Supabase CDN loads first, followed by configuration and service modules, then feature modules, `app.js`, and finally `shell.js`.

On `DOMContentLoaded`, two initializers run:

- `app.js` initializes the original application controls and renders local/sample data immediately.
- `ExperienceShell.init()` restores theme/session and decides whether to show the public experience or private app.

The shell uses URL hashes for public/authentication routes:

- `#landing`
- `#signup`
- `#signin`
- `#forgot`
- `#reset-password`
- `#home` after authenticated entry

The original app uses internal section IDs such as `home`, `events`, `pulse`, `calendar`, `saved`, `recommendations`, `reminders`, `submit`, `my-events`, and `about`.

Query parameters are used for cross-site flows:

- `?event=<slug>` opens a guest-accessible shared event.
- `?payment=callback&reference=<paystack-reference>` triggers server-side payment verification after checkout.

## 9. Event data model in the browser

The UI expects normalized event objects similar to:

```javascript
{
  id,
  slug,
  title,
  category,
  date,
  time,
  venue,
  campus,
  shortDescription,
  fullDescription,
  tags,
  source,
  organizerId,
  organizerName,
  price,
  capacity,
  coverUrl,
  status
}
```

Database columns use snake case, while the original UI uses camel case. `DataService.mapEvent()` is the translation boundary. A remote event is recognizable by `organizerId`; this distinction decides whether registration stays local as a fictional demonstration or becomes a server-backed community ticket.

## 10. Feature implementation details

### Search and filters

`AppState` stores the active search text, campus, category, and date range. The filtering function builds a lowercase searchable string from event title, descriptions, venue, campus, category, and tags. All selected filters are applied together. Rendering is repeated after input/change events and after remote data arrives.

### Event cards and details

Cards are produced dynamically and contain trust/source labels, campus/category information, date/countdown data, and action buttons. The detail modal renders longer content and exposes save, reminder, registration, and share actions as applicable. Dynamic text originating from users or the database is generally passed through `escapeHTML()` before insertion into template strings.

### Saved events

Only event IDs are saved locally. The UI cross-references those IDs against the current merged event list. Save/unsave actions update every matching button and the navigation badge.

### Campus Pulse

For every configured campus, upcoming events are filtered and counted. Events are sorted to find the next one. These are demonstration/community counts, not official statistics.

### Calendar

The calendar computes the first weekday and number of days for the active month. A `Set` of matching event day numbers drives event-dot indicators. Date cells support clicks and keyboard activation. A separate campus filter limits the visible event dates.

### Smart Match

This feature is deliberately not AI. Each selectable interest maps to keywords. An event's title, category, descriptions, and tags are combined and searched. Matching events receive scores, are sorted, and show which interests caused the match. Selected interests persist locally.

### Reminders

Reminder offsets are converted into an absolute trigger time based on the event's local date/time. Reminders persist in `localStorage`. A periodic interval checks for due reminders while the page is open. Due reminders create an in-app toast and, with permission and browser support, a native notification. There is no service worker, so closing the page stops checks.

### Authentication

Signup normalizes the email to lowercase and trims user fields. Passwords go directly to Supabase Auth and are never stored by application code. Signup metadata includes the organizer/student full name. Email confirmation can be retained for the demonstration.

The UI handles Supabase's privacy-preserving duplicate-signup behavior: when signup returns a user with an empty `identities` array, it shows a generic “account may already exist” response instead of falsely reporting success.

Password recovery requests an email with a redirect to `#reset-password`; password update uses the recovered session in the URL. Auth forms also validate name length, email shape, minimum eight-character passwords, and password confirmation.

### Event publishing

The form validates title, category, date, time, venue, campus, description, non-negative price, and positive integer capacity. A signed-in user is required. `DataService.createEvent()` creates a slug from the title plus a short random suffix and inserts a published event with organizer ownership derived from the authenticated user.

The newly returned row is normalized and added to the in-memory cache, after which filters, Campus Pulse, the calendar, and relevant recommendations are refreshed.

### Sharing

The system constructs a same-origin URL with a stable slug where available. Native sharing is attempted first. Clipboard copying is the fallback. User cancellation of the native share sheet is not treated as an error.

### Free community registration

The public `issue_free_event_ticket` PostgreSQL function:

1. Validates basic name, email, and quantity input.
2. Selects and locks the published event row.
3. Rejects missing or paid events.
4. Sums already issued paid/free ticket quantities.
5. Rejects a request exceeding capacity.
6. Inserts a `free` registration.
7. Generates a random `UYO-...` ticket code.
8. Inserts the ticket.
9. Returns safe ticket information to the browser.

Locking the event row serializes free-ticket capacity checks for that event, reducing free-ticket overselling races.

### Paid community registration

Initialization performs these operations in the Edge Function:

1. Load the published event from the database using the service role.
2. Refuse free events.
3. Clamp quantity to the range 1–10.
4. Recalculate total from the database price, not the browser price.
5. Sum issued `paid` and `free` quantities and compare with capacity.
6. Create a pending registration and unique payment reference.
7. Create a pending payment record.
8. Load the organizer's verified Paystack subaccount.
9. Initialize Paystack in NGN using amount in kobo.
10. Set `bearer: "subaccount"` and `percentage_charge: 0` so the organizer receives settlement and bears provider fees.
11. Return Paystack's authorization URL.

After Paystack redirects back, verification:

1. Calls Paystack's verification endpoint using the returned reference.
2. Requires status `success`.
3. Loads the corresponding registration.
4. Compares Paystack's paid amount in kobo with the server-stored total.
5. Reuses an existing ticket if verification was already performed.
6. Otherwise generates and inserts a unique ticket.
7. Marks registration and payment paid.
8. Returns ticket details for display.

### Organizer dashboard

RLS allows an organizer to read registrations only for their own events. The browser loads owned events with nested registration summaries and calculates:

- Number of events
- Sum of quantities in paid/free registrations as tickets
- Sum of `total_amount` for paid registrations as revenue
- Per-event registration count and price

This is a lightweight overview, not a full analytics system.

## 11. Database design and relationships

### `event_profiles`

- Primary key and foreign key: `id -> auth.users(id)`
- Unique normalized email
- Name and phone
- Paystack subaccount code
- Masked payout fields
- Verification flag
- Deleted automatically when the auth user is deleted

A trigger creates a profile after a new auth user is inserted. Existing auth users are backfilled when the schema initially runs.

### `campus_events`

- UUID primary key
- Organizer foreign key to `auth.users`
- Unique slug
- Validated title length
- Campus check constraint for the three configured campuses
- Date, time, venue, descriptions, tags, optional cover URL
- Non-negative price
- Positive capacity
- Status constrained to draft/published/cancelled

### `registrations`

- UUID primary key
- Event foreign key
- Guest identity/contact data
- Quantity constrained to 1–10
- Non-negative server-stored total
- Status constrained to pending/paid/free/failed
- Unique optional payment reference

### `payments`

- One-to-one registration relationship through a unique foreign key
- Unique provider reference
- Amount, status, paid time, creation time

### `tickets`

- One-to-one registration relationship through a unique foreign key
- Event foreign key
- Unique human-presentable ticket code

### Indexes

- Published/status event lookup by date
- Organizer event lookup by creation time
- Registration lookup by event and payment status

## 12. Row Level Security model

- A signed-in user can select and update only their own profile.
- Anyone can select published events; organizers can also select their own non-published events.
- An authenticated organizer can insert only an event whose `organizer_id` equals `auth.uid()`.
- An organizer can update only their own event.
- An organizer can read registrations only where the related event belongs to them.
- No direct browser policies allow arbitrary payment or ticket writes.
- Free tickets are written by the controlled `security definer` function.
- Paid registrations/payments/tickets are written by the Edge Function's service-role client.

The browser anon key is intentionally public and safe only because RLS is the database boundary. The service-role key and Paystack secret must remain server-side secrets.

## 13. Confirmed problems encountered and how they were fixed

The following fixes are directly evidenced by the working-tree diff or current defensive code.

### 13.1 `localStorage` could not support a real shared platform

**Problem:** Events and registrations existed only on one browser. Other users could not see them, clearing browser data removed them, and values could be edited freely.

**Fix:** Shared events, profiles, registrations, payments, and tickets moved to Supabase PostgreSQL. `localStorage` was retained only for preferences and fictional/legacy demonstration behavior. A mapping/cache layer lets the original UI consume remote rows.

### 13.2 Secret payment operations could not safely run in the browser

**Problem:** Paystack account resolution, subaccount creation, payment initialization, and verification require a secret key. Any key embedded in frontend code would be visible to users.

**Fix:** A Supabase Edge Function now reads `PAYSTACK_SECRET_KEY` from server environment secrets and performs privileged calls. The frontend contains only the Supabase anon key.

### 13.3 Browser-controlled price would permit payment tampering

**Problem:** If the browser supplied the trusted event price, a user could edit the request and pay less.

**Fix:** The Edge Function loads the event from PostgreSQL and calculates `event.price * quantity`. Verification compares the exact provider amount against the stored server total.

### 13.4 Tickets could be forged before payment confirmation

**Problem:** The original pass was generated entirely in the browser and therefore was only a demonstration artifact.

**Fix:** Community tickets are now inserted server-side. Paid tickets are created only after Paystack reports success and the exact amount matches. Free tickets are created by a database function after checking event type and capacity.

### 13.5 Unique-email signup can return a privacy-preserving ambiguous response

**Problem:** Supabase may return an obfuscated signup result for an email that already exists rather than a simple duplicate-email error. Treating it as a new account would mislead the user.

**Fix:** The frontend checks whether the returned user's `identities` array is empty and displays a generic account-may-exist message. Emails are also trimmed and normalized to lowercase.

### 13.6 UTC date conversion could shift sample dates

**Problem:** `toISOString().split("T")[0]` converts local time to UTC. Around timezone boundaries this can produce the previous or next calendar date relative to the user.

**Fix:** `getRelativeDate()` now builds `YYYY-MM-DD` from local `getFullYear()`, `getMonth()`, and `getDate()` values.

### 13.7 Unsupported Notification API could throw a reference error

**Problem:** Code such as `if (Notification && ...)` still references an undeclared global on browsers without the API and can throw before the condition is evaluated.

**Fix:** All notification checks now use `"Notification" in window` before accessing `Notification.permission` or constructing a notification.

### 13.8 Saved-button CSS state could become inconsistent

**Problem:** Manipulating class strings can produce duplicated, partial, or stale save-state classes across cards and modals.

**Fix:** The code now explicitly removes both `btn-save` and `btn-saved`, then adds the one correct class with `classList` and updates the button text.

### 13.9 Community and sample tickets require different trust semantics

**Problem:** Treating every event like the old local prototype would either make community tickets untrustworthy or force fictional sample events through real payment/database flows.

**Fix:** The presence of `organizerId` routes community events through server-backed registration. Sample events retain clearly labeled demonstration passes and duplicate detection in local storage.

### 13.10 Paid organizers need settlement without the platform holding money

**Problem:** A simple platform checkout would not automatically route proceeds to each organizer and might imply that the academic project holds organizer funds.

**Fix:** Organizers create Paystack subaccounts. Initialization includes the organizer subaccount, uses zero platform percentage charge, and assigns transaction charges to the subaccount.

### 13.11 Shared links should not force guest account creation

**Problem:** Requiring a guest to register an application account adds conversion friction and is unnecessary for a ticket identified by contact details and payment reference.

**Fix:** The event query route reveals a restricted guest event experience. Organizer publishing still requires authentication, but ticket buyers do not.

### 13.12 Duplicate payment callbacks must not create duplicate tickets

**Problem:** Refreshing a callback URL or verifying the same successful transaction twice could attempt multiple ticket creation.

**Fix:** Verification first looks for a ticket with the registration ID and reuses its code. Database uniqueness also enforces one ticket per registration.

### 13.13 Account details should not be retained unnecessarily

**Problem:** Storing full payout account numbers increases exposure and is unnecessary after Paystack creates a subaccount.

**Fix:** The database stores the provider subaccount code and only the final four digits plus display metadata.

### 13.14 Static-file opening is no longer enough

**Problem:** The original project could be opened as `file://`, but authentication redirects, query callbacks, origin construction, and remote APIs require a real HTTP origin.

**Fix:** Documentation now instructs developers to run an HTTP server and configure the local/deployed URLs in Supabase Authentication.

## 14. Known current defects, risks, and incomplete areas

These are findings from the present source audit. They are not all historical errors that were already encountered; they are unresolved issues that future work and documentation must state honestly.

### Critical/high priority

#### 14.1 Paid-event capacity has a concurrency race

Payment initialization reads sold quantities and then inserts a pending registration without locking the event or reserving capacity. Pending registrations are excluded from the sold count. Two or more guests can initialize the last seats simultaneously and later all pay successfully. Verification does not repeat an atomic capacity check.

**Recommended fix:** Implement a database transaction/RPC that locks the event, creates an expiring reservation, and counts active reservations plus issued tickets; or perform an atomic capacity check during verification with a defined oversubscription/refund policy.

#### 14.2 Failed initialization creates orphaned pending rows

The Edge Function inserts a registration and payment before checking whether the organizer payout profile is ready and before Paystack initialization succeeds. A missing payout account or provider failure leaves pending database rows.

**Recommended fix:** Validate payout readiness before inserts. Use a transactional database function for pending records, mark failed attempts explicitly on provider failure, and periodically expire/clean abandoned records.

#### 14.3 Several database write errors are ignored during payment processing

The code does not consistently inspect errors when inserting the initial payment, inserting a verified ticket, or updating registration/payment status. It can potentially return success even if part of the persistence sequence failed.

**Recommended fix:** Check every Supabase response, fail safely, and move finalization into one idempotent PostgreSQL transaction/RPC.

#### 14.4 Public Edge Function actions lack rate limiting and strong input validation

JWT verification is disabled so guests can initialize and verify payments. The same endpoint also exposes bank lookup and account resolution without action-specific throttling. Names, emails, phone numbers, reference length, and callback URLs receive limited validation.

**Recommended fix:** Add per-IP/reference rate limits, schema validation, request-size limits, allowed callback origins, bot protection where appropriate, and action-specific authentication/authorization.

### Medium priority

#### 14.5 The SQL setup is not fully rerunnable

Tables, trigger removal, functions, and indexes are mostly idempotent, but `create policy` statements have no preceding `drop policy if exists`. Running the entire schema a second time can stop with “policy already exists.”

**Recommended fix:** Drop named policies before recreation or place schema evolution in versioned migrations.

#### 14.6 Payment callback depends on a browser session-storage hint for email display

Server verification returns ticket details but not the guest email. If checkout returns in another tab/device or session storage is cleared, the pass renders without the email even though verification can still succeed.

**Recommended fix:** Return a safely scoped email value from the verified registration if desired, or intentionally remove email from the ticket UI.

#### 14.7 No production webhook finalization

Ticket finalization depends on the browser returning to the callback URL. If the user pays but closes the tab before returning, the registration remains pending until verification is called manually.

**Recommended fix:** Add a verified Paystack webhook with signature validation and use the same idempotent server-side finalization routine as callback verification.

#### 14.8 Paystack subaccount changes may create unused duplicates

Selecting “Change” and saving another payout account creates a new subaccount rather than updating or deactivating the existing one.

**Recommended fix:** Store provider identifiers and use the appropriate update flow, with audit history and clear confirmation.

#### 14.9 Callback URL is supplied by the browser

The initialization endpoint forwards `body.callbackUrl` to Paystack. A malicious caller can choose another callback location.

**Recommended fix:** Construct callback URLs server-side from an allowlisted deployment origin.

#### 14.10 Organizer revenue is gross registration total, not reconciled settlement

The dashboard sums paid registration totals. It does not account for provider fees, refunds, chargebacks, partial settlements, or payout timing.

**Recommended fix:** Label it gross ticket sales or build a payment reconciliation model.

#### 14.11 No event-management lifecycle in the UI

The schema supports draft and cancelled statuses, but the interface only publishes immediately and does not offer editing, cancellation, deletion, or attendee export.

#### 14.12 Limited duplicate-registration controls

Sample events prevent a duplicate per event in the same browser. Community events allow repeated registrations for the same email, which may be valid for buying more tickets but is not explicitly defined or controlled.

### Lower priority and UX/testing gaps

- Past event dates are not explicitly rejected during publishing.
- Phone validation only checks presence for community registration.
- The quantity is clamped server-side during paid initialization instead of rejecting malformed values; `NaN` needs explicit handling.
- Clipboard fallback can fail in insecure origins or restricted browsers.
- Reminders operate only while the site is open.
- No loading/error page exists for a missing or invalid shared-event slug.
- The guest route mutates navigation HTML directly and is difficult to reverse without reload.
- There is no pagination for events or organizer registrations.
- There is no automated moderation or content reporting.
- No cover-image upload workflow is implemented even though `cover_url` exists.
- No automated tests, linter configuration, dependency lockfile, CI workflow, or browser test suite exists.
- No Node.js runtime is installed in the audited environment, so `node --check` could not be used. Source review succeeded, but executable JavaScript syntax/testing remains a verification gap.
- Live Supabase and Paystack behavior was not changed or exercised during this audit; doing so would create external state and require configured test credentials and a deliberate test plan.

## 15. Security analysis

### Existing good controls

- Paystack secret and Supabase service-role key stay in the Edge Function environment.
- Browser code uses only the public anon key.
- RLS is enabled on all five application tables.
- Event ownership is checked against `auth.uid()`.
- Price and event status are loaded server-side.
- Exact paid amount is verified server-side.
- Free-event capacity is checked under an event-row lock.
- Ticket codes use cryptographically random UUID material.
- Database uniqueness prevents duplicate payment references and more than one ticket per registration.
- Full payout account numbers are not stored in application tables.
- Most database/user text inserted into frontend templates is HTML-escaped.
- Password handling is delegated to Supabase Auth.

### Controls needed before production

- Rate limiting and abuse detection
- Paystack webhook signature verification
- Atomic payment/ticket finalization
- Atomic paid-capacity reservation
- Strict request schemas and normalized validation
- Allowed-origin callback construction and tighter CORS
- Organizer identity/KYC and moderation
- Audit logging
- Privacy/retention policy for guest contact data
- Refund, dispute, and cancellation procedures
- Error monitoring and alerting
- Backup/recovery validation
- Automated security and RLS tests

## 16. Accessibility and responsive behavior

The project uses semantic sections, labels, ARIA descriptions, live regions, modal roles, keyboard listeners, and focus handling. Calendar days are keyboard operable. Auth and app errors appear near fields or in status regions. The landing animation observes `prefers-reduced-motion`, and theme colors are tokenized.

Areas to verify manually include focus trapping in every modal, focus restoration after modal close, contrast in both themes, screen-reader meaning of poster decorations, mobile menu behavior, and print output across browsers.

## 17. Setup and deployment requirements

### Local frontend

Serve the directory over HTTP, for example:

```bash
python -m http.server 8080
```

Then open `http://localhost:8080` and add that origin/callback to Supabase Authentication URL configuration.

### Supabase

1. Create/select a Supabase project.
2. Run `supabase/schema.sql` once, or convert it into migrations before repeated environments.
3. Confirm the project URL and public anon key in `js/supabase.js`.
4. Configure allowed site and redirect URLs.
5. Decide whether email confirmation remains enabled.

### Paystack

Use test mode for the academic demonstration:

```bash
supabase secrets set PAYSTACK_SECRET_KEY=sk_test_your_key
supabase functions deploy event-payments
```

Supabase supplies its URL/service-role environment to the deployed function; the anon key is also required by the function's authenticated payout action. Never move the Paystack secret or service-role key into frontend files.

## 18. Suggested end-to-end demonstration

1. Load the animated landing page.
2. Toggle light/dark theme and show responsive navigation.
3. Create an account and explain email confirmation and duplicate-account handling.
4. Sign in and browse the twelve fictional sample events.
5. Demonstrate text, campus, category, and date filtering.
6. Show event details, save an event, add a reminder, inspect the calendar, and run Smart Match.
7. Open Submit Event and create a free community event.
8. Share its public link, open it as a guest, register, and display/print the server-issued ticket.
9. In Paystack test mode, resolve an organizer payout account and publish a paid event.
10. Open the paid event link as a guest, choose quantity, complete a test transaction, return to the callback, and show the verified ticket.
11. Open My Events and explain event count, issued quantities, and gross revenue.
12. End with the prototype limitations and production-hardening roadmap.

## 19. Verification performed for this handoff

- Inspected the complete repository file list.
- Inspected Git status, history, initial tree, and the tracked working-tree diff.
- Read current README and defence notes.
- Read the Supabase schema and payment Edge Function.
- Read the new authentication, data, shell, and Supabase modules.
- Indexed JavaScript functions, listeners, HTML sections, forms, modal IDs, and script order.
- Compared the initial committed documentation with current behavior.
- Searched for TODO/FIXME markers, console error paths, and exception handlers.
- Attempted JavaScript syntax checking, but Node.js is unavailable in the current environment.

No source behavior was modified during the audit. This handoff file is the only added artifact.

## 20. Instructions for an AI generating full documentation

When using this handoff to generate a formal project document:

1. Treat the current working tree as the implemented system.
2. Clearly distinguish fictional sample events from database-backed community events.
3. Explain that the project evolved from a local prototype into a lightweight full-stack application.
4. Do not call Smart Match artificial intelligence; it is deterministic keyword scoring.
5. Do not claim the project is official, production-ready, or live unless separate evidence is supplied.
6. Do not claim Paystack live mode was used; the intended academic flow is test mode.
7. Do not state that all bugs are fixed. Include the unresolved paid-capacity, transactionality, rate-limiting, callback, and schema-rerun issues.
8. Do not invent test results. State that automated tests are absent and live external flows were not exercised in this audit.
9. Describe Supabase RLS as the access boundary, but acknowledge that the service-role Edge Function bypasses RLS and therefore must validate every privileged operation.
10. Describe organizer revenue as gross paid registration value, not confirmed net settlement.
11. Include architecture, database ERD, activity/sequence diagrams, test cases, security analysis, limitations, and future work in any full academic report.

### Recommended documentation chapters

1. Title page and declaration
2. Abstract
3. Background and problem statement
4. Aim, objectives, scope, and limitations
5. Requirements analysis
6. Review of chosen technologies
7. System architecture
8. Database design and ERD
9. User roles and use cases
10. UI/UX design system
11. Module-by-module implementation
12. Authentication and authorization
13. Free and paid ticket sequence diagrams
14. Payment threat model
15. Testing strategy and test cases
16. Problems encountered and fixes
17. Known defects and production roadmap
18. Deployment/configuration guide
19. User manual
20. Conclusion and recommendations

## 21. Concise architecture description for reuse

```text
Browser
  ├─ Public landing/auth views
  ├─ Private event-discovery SPA
  ├─ localStorage: theme, saves, interests, reminders, sample passes
  └─ Supabase JS client (public anon key)
       ├─ Supabase Auth
       ├─ PostgreSQL + RLS
       │    ├─ profiles
       │    ├─ events
       │    ├─ registrations
       │    ├─ payments
       │    └─ tickets
       ├─ Free-ticket PostgreSQL RPC
       └─ event-payments Edge Function
            ├─ service-role database access
            ├─ Paystack bank/account APIs
            ├─ subaccount creation
            ├─ transaction initialization
            └─ transaction verification/ticket finalization
```

## 22. Final project status

The project has progressed well beyond its original frontend-only brief. It now demonstrates a coherent lightweight full-stack architecture and an understandable end-to-end event lifecycle. Its strongest educational qualities are the reuse of a vanilla JavaScript UI through a data adapter, clear separation of public and privileged payment keys, real relational modeling, RLS ownership rules, and server-verified ticket issuance.

It should currently be described as a feature-rich academic prototype, not a production ticketing service. The primary work needed before production is atomic paid-capacity handling, transactional/idempotent payment finalization, webhook processing, rate limiting, stricter input/origin validation, repeatable migrations, automated testing, and operational security controls.
