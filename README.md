# UNIUYO Events

UNIUYO Events is a lightweight campus event discovery and ticketing project for the University of Uyo. It combines a distinctive animated landing experience with authenticated event discovery, organizer publishing, public share links, guest registration, direct organizer settlement and digital tickets.

This is an IT defence project. It deliberately uses a small stack that can be explained from end to end.

## Stack

- Semantic HTML5
- CSS3 with custom properties, responsive layouts and lightweight animations
- Vanilla JavaScript
- Supabase Authentication and PostgreSQL
- One Supabase Edge Function for secret Paystack operations
- Paystack test mode for account resolution, subaccounts and payment verification

There is no frontend framework, Node application server, package manager or build step.

## User flow

```text
Landing page → Sign up/sign in → Event homepage

Shared event link → Public event details → Guest registration → Payment → Ticket
```

Organizers need accounts. Guests opening a shared event do not need accounts to register.

## Features

- Original animated landing page in light and dark modes
- Dedicated signup, signin, password recovery and email-confirmation states
- Supabase-managed sessions and unique email accounts
- Twelve clearly labelled fictional sample events
- Shared community events stored in PostgreSQL
- Search, campus/category/date filters, calendar and Campus Pulse
- Saved events, reminders and rule-based Smart Match
- Organizer event creation with free/paid price and capacity
- Reusable verified organizer payout account
- Paystack subaccount for direct organizer settlement
- Native device share or clipboard event link
- Guest registration and server-verified paid tickets
- Free ticket issuance with capacity checking
- Printable digital ticket
- Simple organizer events, ticket count and revenue overview

## Project structure

```text
index.html                    Public/authenticated document structure
css/style.css                 Original application components
css/experience.css            Landing, auth, theme and premium design system
js/public-views.js            Landing and authentication templates
js/shell.js                   Routing, sessions, themes and landing motion
js/auth.js                    Supabase authentication wrapper
js/data.js                    Supabase events, profiles and ticket data
js/app.js                     Existing SPA plus organizer workflows
js/events.js                  Configuration and fictional sample events
js/registration.js            Local sample passes and shared-event tickets
supabase/schema.sql            Five-table PostgreSQL schema and RLS
supabase/functions/
  event-payments/index.ts      Paystack account/payment operations
```

## Supabase setup

1. Create or select a Supabase project.
2. Run `supabase/schema.sql` in the SQL Editor.
3. Put the public project URL and anon key in `js/supabase.js`.
4. Add the local and deployed URLs under Authentication → URL Configuration.
5. Keep email confirmation enabled if it will be demonstrated.

Supabase Auth prevents one email from creating multiple accounts. The UI also normalizes emails to lowercase and handles duplicate-account responses safely.

## Paystack setup

Use a Paystack test secret for the defence:

```bash
supabase secrets set PAYSTACK_SECRET_KEY=sk_test_your_key
supabase functions deploy event-payments
```

The secret key exists only inside the Edge Function. Never add it to browser JavaScript.

The payment flow is intentionally small:

1. Resolve the organizer bank account.
2. Create and save their Paystack subaccount.
3. Initialize guest payment using that subaccount.
4. Verify the reference and exact amount on the server.
5. Issue a ticket only after successful verification.

The organizer receives the settlement directly through the subaccount and bears Paystack’s processing charge. The project takes no platform commission.

## Local development

Authentication redirects and payment callbacks require HTTP:

```bash
python -m http.server 8080
```

Open `http://localhost:8080` and add it to the Supabase allowed redirect URLs.

## Important limitations

- Sample events are fictional.
- Community events are not official University announcements.
- Paystack should remain in test mode for the academic demonstration.
- No refund automation, seat map, coupon system, complex KYC or QR scanner is included.
- Browser reminders work only while the application is open.
- Email ticket delivery is not included; tickets are displayed and printable.
