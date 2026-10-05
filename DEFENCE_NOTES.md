# Defence Notes — UNIUYO Events

## Project title

Design and Implementation of a Campus Event Discovery and Ticketing Website: A Case Study of the University of Uyo.

## Problem

Campus event information is often scattered across noticeboards, social messages and word of mouth. Students may miss useful academic, social, cultural or career events. Organizers also lack one simple place to publish an event, share registration and receive ticket payments.

## Solution

UNIUYO Events provides one responsive website where students discover events across Permanent Site, Town Campus and Annex. Authenticated organizers can publish and share events. Guests can open a shared link, register, pay in Paystack test mode and receive a digital ticket.

## Why the stack is lightweight

The frontend uses only HTML, CSS and vanilla JavaScript. Supabase provides authentication and PostgreSQL as a managed backend. One Edge Function protects the Paystack secret key. This avoids maintaining a separate Node server while still demonstrating a real multi-user database and secure server-side payment verification.

## Authentication explanation

Supabase Auth stores passwords and manages sessions. The application never stores passwords itself. Signup emails are trimmed and converted to lowercase. Supabase prevents duplicate accounts for the same email, while the interface returns a safe “account may already exist” message.

## Database entities

1. `event_profiles` — organizer identity and masked payout information.
2. `campus_events` — organizer-owned event details.
3. `registrations` — guest and ticket quantity information.
4. `payments` — Paystack reference, amount and payment state.
5. `tickets` — the unique code issued after a free registration or verified payment.

These tables demonstrate primary keys, foreign keys, validation constraints, indexes and one-to-one/one-to-many relationships.

## Row Level Security

RLS is the database security boundary. Organizers can create their own events and see registrations belonging to those events. Public users can read published events but cannot edit them. Payment and ticket writes are performed by controlled database functions or the Edge Function.

## Direct organizer settlement

For a paid event, an organizer supplies a bank and account number. The Edge Function sends these details to Paystack’s account-resolution endpoint. After the organizer confirms the returned name, Paystack creates a subaccount. The application stores the subaccount code and only masked bank information.

At checkout, the event organizer’s subaccount code is included in transaction initialization. No platform commission is taken, and the organizer bears the provider fee.

## Why guests do not need accounts

Shared event links should convert quickly. Requiring signup before checkout adds friction and is unnecessary because a registration can be associated with the guest’s email and payment reference. Organizer accounts remain mandatory because events and payout settings require ownership.

## Payment security

- The Paystack secret key is never placed in frontend code.
- The frontend cannot choose the final price; the server reads it from the event record.
- The server verifies transaction status and exact amount.
- A paid ticket is issued only after verification.
- Paystack test mode is used for demonstration.

## Recommendation logic

Smart Match is rule-based rather than AI. It compares selected interests with event titles, categories, descriptions and tags. This is deterministic, lightweight and easy to explain.

## Design explanation

The visual identity is called “Campus Pulse.” It uses event-poster compositions, oversized editorial typography, expressive category colors and animated layers. Light and dark themes share semantic design tokens. Animations use CSS and `IntersectionObserver`, with reduced-motion support for accessibility.

## Main demonstration sequence

1. Open the animated landing page and switch themes.
2. Create an account and demonstrate duplicate-email protection.
3. Sign in and browse/search events.
4. Create a free event and share its public link.
5. Open that link as a guest and generate a free ticket.
6. In Paystack test mode, verify an organizer payout account.
7. Publish a paid event and complete a test payment.
8. Show that the ticket appears only after verification.
9. Open My Events to show registrations and revenue.

## Limitations

- This is an academic prototype, not an official University service.
- Built-in sample events are fictional.
- Community content is not moderated by University management.
- Automated refunds, advanced KYC, ticket email, seating and QR scanning are outside the project scope.
- A production release would add rate limiting, moderation, audit logging and stronger organizer verification.

## Likely defence questions

### Why Supabase?

It combines authentication, PostgreSQL, RLS and serverless functions. This keeps the project small while demonstrating a real shared backend.

### Why not store everything in localStorage?

LocalStorage is tied to one browser and cannot support shared events, organizer ownership or reliable payment records. It remains only for low-risk preferences such as theme, bookmarks and reminders.

### Why is an Edge Function necessary?

Paystack account resolution, subaccount creation and verification require a secret key. Browser code is visible to users, so those operations must run server-side.

### How do you stop duplicate accounts?

Supabase Auth enforces unique account emails. The application normalizes the address before signup and handles an existing-account response without revealing unnecessary authentication details.

### Is this AI?

No. Recommendations are transparent keyword matching. No model or external AI API is used.
