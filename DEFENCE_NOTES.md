# DEFENCE NOTES
## UNIUYO Campus Event Finder – Academic Project Defence Preparation

**Project Title:** Design and Implementation of a Campus Event Finder Website: A Case Study of the University of Uyo

---

## 1. The Problem the Project Addresses

**Q: What problem does this project solve?**

A: Students at the University of Uyo have no single centralized place to find out about events happening across the three campuses — Permanent Site, Town Campus, and Annex. Events may be announced through scattered notice boards, social media messages, or word of mouth, which means students miss events they would have attended.

This project demonstrates what a centralized Campus Event Finder could look like: a website where all campus events are listed in one place, can be searched and filtered, and where students can save events they are interested in, register to attend, and even submit events for other students to see.

---

## 2. The Project Aim and Objectives

**Q: What is the aim of the project?**

A: The aim is to design and implement a centralized, responsive website that helps students discover, organize, and explore campus-related events at the University of Uyo.

**Q: List the objectives of the project.**

A:
1. Display events for the three campuses.
2. Enable event searching and filtering.
3. Show full event details.
4. Allow users to save favourite events.
5. Demonstrate event submission.
6. Demonstrate event registration.
7. Provide personalized event suggestions.
8. Show upcoming event countdowns.
9. Provide a Campus Pulse dashboard.
10. Offer a calendar view.
11. Generate a printable demonstration event pass.
12. Allow users to set and manage event reminders.
13. Document the implementation and its limitations honestly.

---

## 3. Why HTML, CSS, and JavaScript Were Selected

**Q: Why did you use HTML, CSS, and JavaScript instead of a framework like React?**

A: The project specifications required a front-end-only prototype that anyone could open in a browser without installing any software or framework. HTML5, CSS3, and Vanilla JavaScript are the native languages of the web — any browser understands them without extra tools. Using a framework like React would have required Node.js, npm, and a build process, making the project harder to run and adding unnecessary complexity for a demonstration prototype.

These three technologies are also fundamental to front-end web development. Demonstrating proficiency in them without relying on a framework shows a stronger grasp of how the web actually works.

---

## 4. Purpose of Each Project File

| File | Purpose |
|---|---|
| `index.html` | The entire page structure. All sections (Home, Events, Campus Pulse, Calendar, Saved Events, Smart Match, Submit Event, About) are inside this one file and shown or hidden by JavaScript. |
| `css/style.css` | All visual styling: colours, fonts, layout, responsive breakpoints, animations, and print styles. |
| `js/events.js` | The central data file. Contains the `CONFIG` object (campuses, categories, interests), the 12 sample events, and date utility functions used across the whole application. |
| `js/storage.js` | A safe wrapper around `localStorage`. All reading and writing of saved events, registrations, submitted events, and user interests goes through this module. |
| `js/recommendations.js` | The Smart Event Match logic. Compares selected interest keywords against event data and returns scored results. |
| `js/calendar.js` | Generates the monthly calendar grid, handles navigation, and shows events for a selected date. |
| `js/registration.js` | Handles the event registration form, generates the unique registration reference, and renders the Digital Event Pass. |
| `js/reminders.js` | Manages the logic for setting, checking, and deleting event reminders, including generating in-app toasts and browser notifications. |
| `js/app.js` | The main application file. Controls navigation between sections, renders event cards, manages filters, handles the event details modal, submission form, saved events, Campus Pulse, and global click events. |
| `README.md` | Full project documentation for technical readers. |
| `DEFENCE_NOTES.md` | This file – preparation notes for the academic defence. |

---

## 5. How the Event Data is Structured

**Q: How is event data organized in your project?**

A: Each event is a JavaScript object with these fields:

```javascript
{
  id: "evt-001",            // Unique identifier
  title: "Event Title",
  category: "Workshop",
  date: "2026-10-15",       // YYYY-MM-DD format
  time: "10:00",            // 24-hour HH:MM format
  venue: "Room Name",
  campus: "Permanent Site",
  shortDescription: "...",  // Short summary for cards
  fullDescription: "...",   // Full text for the details modal
  tags: ["keyword1"],       // Keywords for Smart Event Match
  source: "sample"          // "sample" or "community"
}
```

Sample events are stored in the `SAMPLE_EVENTS` array in `events.js`. User-submitted events are stored separately in `localStorage` and combined at runtime using the `getAllEvents()` function.

---

## 6. How the Search Function Works

**Q: Explain how the search feature works.**

A: When the user types in the search box, the `applyFilters()` function in `app.js` is called. It calls `filterEvents()`, which loops through every event and checks whether the search query (converted to lowercase) appears anywhere in the event's title, short description, full description, venue, campus name, category, or tags. Only events that match are returned. The matching is case-insensitive. The event grid is then re-rendered with only the matching events.

---

## 7. How Campus, Category, and Date Filters Work

**Q: How do the filters work?**

A: All filters are stored in the `AppState` object. When any filter changes, `applyFilters()` is called, which passes the current filter values to `filterEvents()`.

- **Campus filter:** Checks `event.campus === selectedCampus`. If "All Campuses" is selected, this check is skipped.
- **Category filter:** Checks `event.category === selectedCategory`. If "All Categories", skipped.
- **Date filter:** Uses the `isWithinDays(event.date, n)` function, which compares the event's date to today's date using JavaScript's `Date` object. "Today" means within 0 days (today only), "Next 7 Days" within 7 days, "Next 30 Days" within 30 days.

All active filters are applied together — the event must pass all checks to appear in the results.

---

## 8. How localStorage Is Used

**Q: What is localStorage and how does your project use it?**

A: `localStorage` is a built-in feature of web browsers that allows a website to save small amounts of data on the user's device. The data stays there even after the browser is closed, until the user clears their browser data.

In this project, `localStorage` stores five types of data:
- **`uniuyo_saved_events`** – the IDs of events the user has bookmarked.
- **`uniuyo_submitted_events`** – event objects submitted by the user.
- **`uniuyo_reminders`** – reminder objects (event ID, trigger time, notification status).
- **`uniuyo_registrations`** – registration records including the user's name, email, event ID, and reference number.
- **`uniuyo_user_interests`** – the interest IDs selected in Smart Event Match.

All reading and writing is handled by the `Storage` module in `storage.js`, which uses `try/catch` to handle errors safely.

---

## 9. How Event Submission Works

**Q: Walk me through what happens when a user submits an event.**

A:
1. The user fills in the Submit an Event form with the event title, category, date, time, venue, campus, and description.
2. When they click Submit Event, JavaScript intercepts the form's submit event.
3. Each required field is validated. If any field is empty or invalid, an error message appears beside it.
4. If all fields are valid, a new event object is created with a unique ID generated from the current timestamp.
5. The event is saved to `localStorage` using `Storage.saveSubmittedEvent()`.
6. The page immediately updates: `applyFilters()` re-renders the events grid (the new event appears there), `renderCampusPulse()` updates the statistics, and `Calendar.refreshCalendar()` adds it to the calendar.
7. A success message and a toast notification confirm the action.
8. The form is reset.

---

## 10. How Registration Works

**Q: Explain the registration process.**

A:
1. Clicking Register on any event card opens the Registration Modal.
2. The modal shows the event title (pre-filled, read-only).
3. The user enters their full name and email address.
4. JavaScript validates both fields: name cannot be empty, and the email must match the format `something@something.something`.
5. The system checks whether the user has already registered for this event (by searching `localStorage` for the event ID). If they have, their existing pass is displayed instead.
6. If the registration is new, a unique reference number is generated in the format `UNIUYO-YYYYMMDD-XXXXXX`.
7. The registration object is saved to `localStorage`.
8. The Digital Event Pass is rendered and displayed.

---

## 11. How the Digital Event Pass Is Generated

**Q: How is the Digital Event Pass created and printed?**

A: The pass is created entirely in JavaScript using the `populatePass()` function in `registration.js`. It uses `innerHTML` to build a styled HTML element containing the event's details and the registrant's name and reference number. The pass includes a clear prototype notice to prevent anyone from mistaking it for a real ticket.

Printing works by calling `window.print()`, which is a built-in browser function. The CSS file contains `@media print` rules that hide everything on the page except the pass section, so when the browser's print dialog opens, only the pass is visible and printable.

---

## 12. How Campus Pulse Calculates Event Counts

**Q: How does Campus Pulse calculate the number of events for each campus?**

A: The `renderCampusPulse()` function in `app.js` calls `getAllEvents()`, which combines the fixed sample events with any events submitted by users. For each campus, it uses `Array.filter()` to count events where:
- `event.campus === campus` (matches the campus name exactly), and
- `isUpcoming(event.date)` returns `true` (the event date is today or in the future).

The count is displayed on the campus card. The next upcoming event is found by sorting the filtered list by date and taking the first item.

These counts are never hardcoded. If a new event is submitted, the count updates automatically when Campus Pulse is next rendered.

---

## 13. How Smart Event Match Recommends Events

**Q: How does Smart Event Match work? Is it AI?**

A: No, Smart Event Match is not AI. It uses a simple rule-based approach:

1. Each interest (e.g. "Technology") has a pre-defined list of keywords (e.g. "technology, digital, tech, innovation, software, computer").
2. When the user selects interests and clicks Find Matching Events, the `getRecommendedEvents()` function in `recommendations.js` loops through every event.
3. For each event, it combines the title, category, descriptions, and tags into one text string and searches it for each keyword from the selected interests.
4. Events that contain at least one matching keyword receive a score. Events with more matches score higher.
5. Matching events are sorted by score and displayed with a note explaining which interest triggered the recommendation.

The whole process is transparent and explainable — no hidden model, no data sent anywhere.

---

## 14. How the Calendar Is Populated

**Q: How does the calendar know which dates have events?**

A:
1. `calendar.js` stores the current year and month.
2. When rendering, it calls `getAllEvents()` to get all events.
3. It filters events to those whose `date` starts with the current year-month prefix (e.g. "2026-10") and match the campus filter.
4. The day numbers from those dates are collected into a JavaScript `Set`.
5. When the calendar grid cells are created, any cell whose day number is in that Set receives a gold dot indicator.
6. When a user clicks a date cell, `getEventsForDate()` finds all events for that exact date and displays them in the side panel.

---

## 15. How the Event Reminders Work

**Q: How did you implement the Event Reminders without a backend?**

A: The Reminders feature uses `localStorage` and JavaScript's `setInterval`.
1. When a user sets a reminder, the trigger time is calculated based on the event's date and the user's chosen offset (e.g., 1 hour before).
2. The reminder is saved in `localStorage`.
3. An interval timer (`setInterval`) checks the stored reminders every minute to see if `triggerTime` has passed.
4. If a reminder is due, it triggers a toast notification in the application. If the user granted browser notification permissions, it also triggers a native browser notification.
5. Reminders only work while the website tab is open. We do not use Service Workers or background sync, which is clearly communicated in the app's disclaimer.

---

## 16. The Difference Between a Front End and a Backend

**Q: Explain the difference between a front end and a backend. Which does this project use?**

A:
- The **front end** is everything the user sees and interacts with in the browser: the HTML structure, CSS styles, and JavaScript that runs in the browser.
- The **backend** is a server that runs somewhere on the internet, handles business logic, stores data in a real database, and sends information to the browser on request.

This project is **front-end only**. There is no server. All data is stored in the user's own browser using `localStorage`. This means:
- Different users cannot see each other's submissions.
- Data is lost if the user clears their browser.
- There is no central record of registrations.

A production version of this system would need a backend to solve these problems.

---

## 17. Limitations of localStorage

**Q: What are the limitations of localStorage?**

A:
1. **Not shared** – Each browser on each device has its own separate localStorage. Data submitted on one computer is invisible to other users.
2. **Not permanent** – Users can clear localStorage through browser settings. Incognito/private mode may restrict it.
3. **Not secure** – Data is stored in plain text. Anyone with access to the device can view or edit it through browser developer tools. It must never be used for passwords or sensitive information in production.
4. **Limited size** – Typically 5 MB per origin. A large number of events or registrations could fill this.
5. **Not a real database** – There are no queries, relationships, backups, or access controls.

---

## 18. Security and Privacy Limitations

**Q: Is this website secure?**

A: As a front-end-only prototype, it has important security limitations that must be acknowledged:

1. **Client-side validation only** – All form validation happens in the user's browser. A technically skilled user could bypass it.
2. **localStorage is readable** – Anyone with access to the browser's developer tools can read, edit, or delete all stored data.
3. **No authentication** – There is no login system. Any duplicate-registration prevention is trivially bypassed by using another browser or clearing storage.
4. **No encryption** – Data stored in localStorage is plain text.
5. **XSS prevention** – User-submitted text is handled using `escapeHTML()` and `textContent` where possible to prevent cross-site scripting, but this is not a production-grade protection.

These limitations are acceptable for a front-end prototype and are clearly documented. A production system would require a secure server, HTTPS, authentication, and server-side validation.

---

## 19. Possible Future Improvements

**Q: How could this project be improved in the future?**

A:
1. **Backend and database** – A server (e.g. Node.js or Python Flask) and database (e.g. PostgreSQL or MongoDB) would allow data to be shared between users and stored permanently.
2. **University email verification** – Restrict registration to `@uniuyo.edu.ng` email addresses.
3. **Administrator dashboard** – Allow university staff to review, approve, or reject submitted events.
4. **Email confirmations** – Send a real email receipt when a user registers.
5. **Real QR codes** – Generate scannable QR codes tied to registration records that can be verified at event entry.
6. **Push notifications** – Notify users about upcoming saved events.
7. **Event organizer accounts** – Allow registered organizers to manage their own events.
8. **Integration with official UNIUYO calendar** – Sync with an official academic calendar API.
9. **Offline support** – Use Service Workers to make the site work without an internet connection.
10. **Multi-language support** – Add support for Ibibio or other local languages.

---

## Likely Defence Questions and Model Answers

---

**Q: What is the project about?**

A: It is a front-end web prototype for a Campus Event Finder at the University of Uyo. It allows students to discover events across the three campuses, search and filter them, save events, register for them, and get a demonstration event pass. It also includes unique features like Campus Pulse, Smart Event Match, and a calendar view.

---

**Q: Why did you choose this topic?**

A: Students often miss campus events because there is no single place to find them. This project demonstrates how a centralized, user-friendly website could solve that problem using only front-end technologies.

---

**Q: Is this website connected to the internet?**

A: No. The website is a front-end prototype that runs entirely in the browser. It has no server, makes no internet requests, and requires only the local files to run.

---

**Q: How do you store data without a database?**

A: The project uses `localStorage`, which is built into every modern web browser. It allows small amounts of data to be saved on the user's own device.

---

**Q: What makes this project different from a basic HTML page?**

A: The project is a fully interactive single-page application. It uses JavaScript for dynamic rendering, real-time filtering, form validation, localStorage data management, and multiple distinct features including a calendar, countdowns, personalized recommendations, and a printable event pass — all without a backend or framework.

---

**Q: What is the `CONFIG` object?**

A: `CONFIG` is a central JavaScript object in `events.js` that stores all application-wide constants: the campus names, event categories, interest definitions with their keywords, and localStorage keys. Storing these in one place means that to add a new campus or category, you only need to change one file.

---

**Q: What happens if localStorage is not available?**

A: The `Storage.isAvailable()` function tests localStorage before any write operation. If it is not available (e.g. in certain private browsing modes), a warning banner is shown at the top of the page, and operations that require storage fail with a clear error message rather than silently pretending to succeed.

---

**Q: How are the events displayed on the page?**

A: Events are not written directly in the HTML. Instead, the `createEventCard()` function in `app.js` creates a new HTML `<article>` element for each event using JavaScript and appends it to the events grid. This allows the displayed events to be easily changed by the filtering functions without reloading the page.

---

**Q: How does the countdown work?**

A: The `getCountdown(dateStr)` function in `events.js` compares the event's date to today's date using JavaScript's `Date` object. It calculates the difference in days and returns a human-readable string like "Starts in 5 days" or "Event has passed". The calculation uses calendar dates (not timestamps) to avoid timezone-related errors.

---

**Q: What is the difference between a sample event and a community submitted event?**

A: Sample events are pre-loaded fictional events written by the developer and stored in the `SAMPLE_EVENTS` array in `events.js`. Community submitted events are added by the user through the Submit an Event form and stored in `localStorage`. Both types have a visible trust label on their card so users can see the source. Neither type is verified by the University of Uyo.

---

**Q: Why is the event pass called a "demonstration" pass?**

A: Because this is a prototype with no real event management system behind it. The pass cannot grant access to any real event and is not verified by anyone. A clear prototype notice is included on every pass to make this plain. In a real system, the pass would be linked to a server-side database and could be verified by scanning a QR code at the event.

---

*End of Defence Notes*

*UNIUYO Campus Event Finder – Student Academic Project – University of Uyo*
