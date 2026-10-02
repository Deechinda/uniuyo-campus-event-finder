# UNIUYO Campus Event Finder

## 1. Project Title

**Design and Implementation of a Campus Event Finder Website: A Case Study of the University of Uyo**

---

## 2. Project Overview

UNIUYO Campus Event Finder is a front-end web prototype that provides a centralized platform for students at the University of Uyo to discover, explore, and organize campus-related events across all three campuses: **Permanent Site**, **Town Campus**, and **Annex**.

This is a student academic project demonstrating front-end development skills, responsive design, JavaScript interactivity, and local data handling. It has no backend server and is not officially affiliated with the University of Uyo administration.

> ⚠ **All events listed are fictional demonstration data.** They are not official university announcements.

---

## 3. Aim and Objectives

**Aim:** To design and implement a centralized, responsive website that helps students discover, organize, and explore campus-related events.

**Objectives:**

1. Display events associated with the three campuses (Permanent Site, Town Campus, Annex)
2. Enable event searching and filtering by title, campus, category, and date
3. Display complete event information in a detailed modal
4. Allow users to save favourite events using browser localStorage
5. Demonstrate event submission with form validation
6. Demonstrate event registration with a unique reference number
7. Provide personalized event suggestions using rule-based Smart Event Match
8. Display upcoming events with countdowns
9. Provide a Campus Pulse comparison dashboard
10. Offer a monthly calendar view
11. Generate a printable demonstration Digital Event Pass after registration
12. Allow users to set client-side event reminders
13. Document the implementation and its limitations

---

## 4. Technologies Used

| Technology | Purpose |
|---|---|
| HTML5 | Page structure and semantic markup |
| CSS3 | Styling, layout (Grid/Flexbox), animations, responsive design |
| Vanilla JavaScript | All interactivity, data handling, filtering, and DOM manipulation |
| Browser localStorage | Persisting saved events, submitted events, registrations, and user interests |
| Native browser print API | Printing the Digital Event Pass |

**No frameworks, no libraries, no build tools, no backend, no database.**

---

## 5. Project Structure

```
uniuyo-event-finder/
├── index.html              # Complete HTML structure (single-page app)
├── css/
│   └── style.css           # All styles (design tokens, layout, components, print, responsive)
├── js/
│   ├── events.js           # Configuration, sample event data, and date utility functions
│   ├── storage.js          # localStorage helper module (safe read/write)
│   ├── recommendations.js  # Smart Event Match – rule-based keyword matching
│   ├── calendar.js         # Monthly calendar view with campus filtering
│   ├── registration.js     # Event registration and Digital Event Pass generation
│   ├── reminders.js        # Event reminders and notifications
│   └── app.js              # Main application: navigation, filters, cards, modals, submission
├── assets/
│   ├── images/             # (Reserved for future images)
│   └── icons/              # (Reserved for future icons)
├── README.md               # This file
└── DEFENCE_NOTES.md        # Academic defence preparation notes
```

---

## 6. Features

| Feature | Description |
|---|---|
| **Event Discovery** | Browse 12 sample events across 3 campuses |
| **Search & Filters** | Filter by keyword, campus, category, and date range; results update live |
| **Event Details Modal** | Full event information, countdown, save/register actions |
| **Campus Pulse** | Dashboard showing upcoming event counts and next event per campus |
| **Smart Event Match** | Keyword-based personalized recommendations – no AI required |
| **Event Countdown** | Dynamically calculated "Starts in X days" labels |
| **Saved Events** | Bookmark events; stored in localStorage |
| **Event Reminders** | Set reminders (15m, 1h, 1d) before an event, stored locally, with in-app notifications |
| **Event Submission** | Submit new events via validated form; stored locally |
| **Event Registration** | Register for any event; duplicate detection; unique reference generated |
| **Digital Event Pass** | Styled printable pass with event and registrant details |
| **Calendar View** | Monthly calendar with event dots, campus filter, and date selection |
| **Trust Labels** | Sample Event / Community Submitted labels to distinguish data sources |
| **Responsive Design** | Works on desktop, tablet, and mobile |
| **Accessibility** | Semantic HTML, ARIA labels, keyboard navigation, focus management |

---

## 7. Campus Configuration

The three campuses are defined in `CONFIG.campuses` inside `js/events.js`:

```javascript
campuses: ["Permanent Site", "Town Campus", "Annex"]
```

These names are used consistently across all filters, forms, cards, Campus Pulse, and the calendar. To rename a campus, update this array only.

---

## 8. How to Run the Website

### Method 1: Open Directly (simplest)
1. Navigate to the `uniuyo-event-finder/` folder.
2. Double-click `index.html` to open it in your default browser.

> **Browser restriction:** When opened as a local file (`file://`), the site works fully because it uses no fetch requests or modules. All JavaScript files are loaded as standard `<script>` tags.

### Method 2: Local HTTP Server (recommended for best compatibility)
If you have Python installed:
```bash
cd uniuyo-event-finder
python -m http.server 8080
```
Then open `http://localhost:8080` in your browser.

If you have Node.js:
```bash
npx serve .
```

### Method 3: VS Code Live Server
If using Visual Studio Code, right-click `index.html` and select **Open with Live Server**.

---

## 9. How to Add Sample Events

Open `js/events.js` and add a new object to the `SAMPLE_EVENTS` array following this structure:

```javascript
{
  id: "evt-013",                   // Must be unique
  title: "Your Event Title",
  category: "Academic",            // Must match a value in CONFIG.categories
  date: getRelativeDate(10),       // 10 days from now; or a fixed "YYYY-MM-DD" string
  time: "10:00",                   // 24-hour HH:MM format
  venue: "Faculty Hall, Block A",
  campus: "Permanent Site",        // Must exactly match a value in CONFIG.campuses
  shortDescription: "A brief description (max ~150 characters).",
  fullDescription: "The full detailed description shown in the event details modal.",
  tags: ["keyword1", "keyword2"],  // Used for Smart Event Match keyword matching
  source: "sample",                // "sample" for pre-loaded events
}
```

---

## 10. How Event Submission Works

1. The user fills in the Submit an Event form.
2. JavaScript validates all required fields (title, category, date, time, venue, campus, description).
3. On valid submission:
   - A unique ID is generated (e.g. `sub-1727000000000-abc123`).
   - The event object is saved to `localStorage` under the key `uniuyo_submitted_events`.
   - The event is immediately included in all listings, searches, filters, and Campus Pulse counts.
4. Submitted events display a **Community Submitted** trust label.
5. Submitted events are not verified by anyone and are not sent to a server.
6. If `localStorage` is unavailable, the submission fails with an honest error message.

---

## 11. How Registration Works

1. Clicking **Register** on any event card or in the event details modal opens the registration form.
2. The event is pre-selected and displayed (cannot be changed by the user).
3. The user fills in their full name and email address.
4. JavaScript validates both fields and checks for a properly formatted email.
5. If the user has already registered for this event (detected by event ID in localStorage), their existing pass is shown instead.
6. On successful submission:
   - A unique reference is generated (e.g. `UNIUYO-20261001-XK7F2A`).
   - The registration object is saved to localStorage.
   - The Digital Event Pass is displayed immediately.
7. The name and email are stored locally in the browser only. They are never sent to a server.

---

## 12. How the Digital Event Pass Works

- The pass is generated in JavaScript and displayed as a styled HTML element inside the registration modal.
- It contains: the site name, event title, date, time, venue, campus, registrant name, and the unique registration reference.
- A prominent **Prototype Notice** is included on every pass stating it is not an official university ticket.
- The **Print Event Pass** button calls `window.print()`.
- Print-specific CSS (`@media print`) hides all page content except the pass section, so only the pass prints.
- The pass is not a real ticket and does not grant entry to any event.

---

## 13. How Recommendations Work

Smart Event Match uses simple JavaScript keyword matching:

1. The user selects one or more interests (e.g. Technology, Sports, Arts & Culture).
2. Each interest has an associated list of keywords (e.g. Technology → ["technology", "digital", "tech", "innovation"]).
3. For each event, the system searches the event's title, category, description, and tags for those keywords.
4. Events that match at least one interest keyword are scored and sorted by relevance.
5. The matching interests are displayed below each result as the reason for the recommendation.

**This is not AI-generated.** No machine learning, no external APIs. The logic is entirely in `js/recommendations.js`.

User-selected interests are saved to `localStorage` under `uniuyo_user_interests`.

---

## 14. How Campus Pulse Works

Campus Pulse is calculated dynamically every time the section is loaded:

1. `getAllEvents()` returns all sample and submitted events.
2. For each campus, events are filtered by `event.campus === campus` and `isUpcoming(event.date)`.
3. The count of those events is displayed on the campus card.
4. The earliest upcoming event (sorted by date) is shown as the "Next Event".
5. If a campus has no upcoming events, a message is shown instead of a count.

The **Explore [Campus]** button sets the campus filter in the Events section and navigates there.

> Note: Counts reflect demonstration data only and are not official university statistics.

---

## 15. How the Calendar Works

1. `Calendar.init()` initialises the calendar to the current month and year.
2. The calendar grid is calculated using JavaScript's `Date` object: `new Date(year, month, 1).getDay()` gives the starting column, and `new Date(year, month+1, 0).getDate()` gives the number of days.
3. Events matching the current month and the selected campus filter are identified, and their dates receive a gold dot indicator.
4. Clicking a date shows the events for that date in the adjacent panel.
5. Prev/Next Month buttons adjust the month and regenerate the grid.
6. Community-submitted events appear in the calendar immediately after submission.

---

## 16. Local Storage Explanation

| Key | What is stored |
|---|---|
| `uniuyo_submitted_events` | Array of user-submitted event objects |
| `uniuyo_saved_events` | Array of saved event ID strings |
| `uniuyo_reminders` | Array of reminder objects |
| `uniuyo_registrations` | Array of registration objects |
| `uniuyo_user_interests` | Array of selected interest ID strings |

**Important limitations:**
- Data is stored per browser per device. It is not shared between computers or browsers.
- Data can be cleared by the user at any time via browser settings.
- localStorage is not encrypted. Do not store sensitive personal information.
- If storage is full or blocked (e.g. in private/incognito mode with certain browser settings), operations fail gracefully with an honest error message.

---

## 17. Testing Results

The following tests were verified during development:

| Test | Result |
|---|---|
| Homepage loads without errors | ✓ Pass |
| Navigation links switch sections correctly | ✓ Pass |
| Mobile hamburger menu opens and closes | ✓ Pass |
| Events grid renders all 12 sample events | ✓ Pass |
| Search by title (case-insensitive) | ✓ Pass |
| Search by venue text | ✓ Pass |
| Search by campus name | ✓ Pass |
| Campus filter – Permanent Site | ✓ Pass |
| Campus filter – Town Campus | ✓ Pass |
| Campus filter – Annex | ✓ Pass |
| Category filter | ✓ Pass |
| Date filter – Next 7 Days | ✓ Pass |
| Combined search + campus filter | ✓ Pass |
| Reset Filters clears all filters | ✓ Pass |
| Event details modal opens with correct data | ✓ Pass |
| Modal closes with Escape key | ✓ Pass |
| Modal closes via close button | ✓ Pass |
| Modal closes via backdrop click | ✓ Pass |
| Save event updates button and badge | ✓ Pass |
| Unsave event updates all buttons | ✓ Pass |
| Saved Events section shows bookmarks | ✓ Pass |
| Set reminder saves to localStorage | ✓ Pass |
| Remove reminder deletes from localStorage | ✓ Pass |
| My Reminders section shows active reminders | ✓ Pass |
| Submit form validates required fields | ✓ Pass |
| Submit form rejects whitespace-only values | ✓ Pass |
| Submitted event appears in listings immediately | ✓ Pass |
| Submitted event appears in Campus Pulse | ✓ Pass |
| Submitted event appears in calendar | ✓ Pass |
| Registration validates name and email | ✓ Pass |
| Registration rejects invalid email format | ✓ Pass |
| Registration generates unique reference | ✓ Pass |
| Duplicate registration shows existing pass | ✓ Pass |
| Digital Event Pass renders with correct data | ✓ Pass |
| Campus Pulse counts match event data | ✓ Pass |
| Explore Campus button applies correct filter | ✓ Pass |
| Smart Event Match returns results for interests | ✓ Pass |
| Countdown labels reflect actual dates | ✓ Pass |
| Calendar renders correct month | ✓ Pass |
| Calendar prev/next navigation | ✓ Pass |
| Calendar shows events on selected date | ✓ Pass |
| Trust labels correctly distinguish event sources | ✓ Pass |

---

## 18. Known Limitations

1. **No backend or database** – All data is temporary and browser-specific.
2. **localStorage security** – Not encrypted; not suitable for sensitive data in production.
3. **No real email verification** – Registration accepts any validly formatted email string.
4. **No server-side validation** – All validation is client-side only; not a security boundary.
5. **No multi-device sync** – Data does not sync between browsers or devices.
6. **No offline mode** – The website requires the local file system or a server to load.
7. **Sample events are not real** – All event data is fictional.
8. **Print layout** – Tested in Chrome/Edge; print output may vary in other browsers.
9. **localStorage quota** – Typically 5 MB per domain; large numbers of submissions could fill it.
10. **No QR code** – A QR code was not implemented as no reliable dependency-free library was available without risking a fake verification appearance.

---

## 19. Future Improvements

These are documented as potential future work and are **not implemented**:

- Secure backend server and central database (e.g., Node.js + PostgreSQL)
- University email verification (e.g., `@uniuyo.edu.ng` domain checking)
- Administrator dashboard for approving/rejecting submitted events
- Official event approval workflow
- Real push/email notifications for upcoming events
- Cloud synchronization of saved events and registrations
- Attendance verification system
- Real QR code generation with server-side validation
- Event organizer accounts with login
- Integration with an official UNIUYO academic calendar
- Multi-language support

---

*UNIUYO Campus Event Finder – Student Academic Project – University of Uyo*
