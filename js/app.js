// ============================================================
// app.js – Main application logic
// UNIUYO Campus Event Finder
// ============================================================

// ----------------------------------------------------------------
// 1. GLOBAL STATE
// ----------------------------------------------------------------
const AppState = {
  searchQuery: "",
  campusFilter: "all",
  categoryFilter: "all",
  dateFilter: "all",
  activeSection: "home",
};

const OrganizerState = { profile: null, banks: [], resolvedAccount: null };

// ----------------------------------------------------------------
// 2. UTILITIES
// ----------------------------------------------------------------

/** Escapes HTML special characters to prevent XSS when using innerHTML. */
function escapeHTML(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/** Shows a temporary toast notification. */
function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");
  toast.textContent = message;
  container.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => toast.classList.add("toast-visible"));

  setTimeout(() => {
    toast.classList.remove("toast-visible");
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/** Validates an email address format. */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Displays a field-level validation error. */
function showFieldError(fieldId, message) {
  const field = document.getElementById(fieldId);
  if (!field) return;
  field.classList.add("input-error");
  const errId = `${fieldId}-error`;
  let errEl = document.getElementById(errId);
  if (!errEl) {
    errEl = document.createElement("span");
    errEl.id = errId;
    errEl.className = "field-error";
    errEl.setAttribute("role", "alert");
    field.parentNode.appendChild(errEl);
  }
  errEl.textContent = message;
  field.setAttribute("aria-describedby", errId);
}

/** Clears all field errors from a form. */
function clearFormErrors(formId) {
  const form = document.getElementById(formId);
  if (!form) return;
  form.querySelectorAll(".input-error").forEach((el) => el.classList.remove("input-error"));
  form.querySelectorAll(".field-error").forEach((el) => el.remove());
}

// ----------------------------------------------------------------
// 3. MODAL SYSTEM
// ----------------------------------------------------------------
let activeModal = null;

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  modal.removeAttribute("hidden");
  modal.setAttribute("aria-modal", "true");
  modal.classList.add("modal-open");
  document.body.classList.add("modal-active");
  activeModal = modal;

  // Focus the first focusable element
  const focusable = modal.querySelector(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  if (focusable) setTimeout(() => focusable.focus(), 50);
}

function closeModal(modalId) {
  const modal = modalId
    ? document.getElementById(modalId)
    : activeModal;
  if (!modal) return;

  modal.classList.remove("modal-open");
  document.body.classList.remove("modal-active");
  modal.setAttribute("hidden", "");
  activeModal = null;
}

function closeAllModals() {
  document.querySelectorAll(".modal.modal-open").forEach((m) => {
    m.classList.remove("modal-open");
    m.setAttribute("hidden", "");
  });
  document.body.classList.remove("modal-active");
  activeModal = null;
}

// Escape key closes modal
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && activeModal) closeAllModals();
});

// ----------------------------------------------------------------
// 4. NAVIGATION
// ----------------------------------------------------------------

function initNavigation() {
  // Mobile hamburger toggle
  const hamburger = document.getElementById("nav-hamburger");
  const navMenu = document.getElementById("nav-menu");
  if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
      const open = navMenu.classList.toggle("nav-open");
      hamburger.setAttribute("aria-expanded", open ? "true" : "false");
      hamburger.innerHTML = open ? "✕" : "☰";
    });
  }

  // Nav links
  document.querySelectorAll("[data-nav]").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const target = link.dataset.nav;
      navigateTo(target);
      // Close mobile menu
      if (navMenu) navMenu.classList.remove("nav-open");
      if (hamburger) {
        hamburger.setAttribute("aria-expanded", "false");
        hamburger.innerHTML = "☰";
      }
    });
  });

  // Explore Events button in hero
  const exploreBtn = document.getElementById("btn-explore-events");
  if (exploreBtn) {
    exploreBtn.addEventListener("click", () => navigateTo("events"));
  }

  // Hero search
  const heroSearchBtn = document.getElementById("hero-search-btn");
  const heroSearchInput = document.getElementById("hero-search");
  if (heroSearchBtn && heroSearchInput) {
    heroSearchBtn.addEventListener("click", () => {
      const query = heroSearchInput.value.trim();
      if (query) {
        AppState.searchQuery = query;
        navigateTo("events");
        document.getElementById("search-input").value = query;
        applyFilters();
      } else {
        navigateTo("events");
      }
    });
    heroSearchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") heroSearchBtn.click();
    });
  }
}

function navigateTo(sectionId) {
  // Hide all sections
  document.querySelectorAll(".page-section").forEach((s) => s.classList.remove("active-section"));

  // Show target section
  const target = document.getElementById(`section-${sectionId}`);
  if (target) {
    target.classList.add("active-section");
    AppState.activeSection = sectionId;
  }

  // Update nav active state
  document.querySelectorAll("[data-nav]").forEach((link) => {
    link.classList.toggle("nav-active", link.dataset.nav === sectionId);
  });

  // Update saved badge
  updateSavedBadge();

  // Section-specific init
  if (sectionId === "saved") renderSavedEvents();
  if (sectionId === "reminders") Reminders.renderMyReminders();
  if (sectionId === "pulse") renderCampusPulse();
  if (sectionId === "calendar") Calendar.refreshCalendar();
  if (sectionId === "recommendations") {
    Recommendations.renderInterestSelector("interest-selector");
    Recommendations.renderRecommendations("recommendations-list");
  }
  if (sectionId === "my-events") renderOrganizerEvents();
  if (sectionId === "submit") prepareOrganizerForm();

  // Scroll to top
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ----------------------------------------------------------------
// 5. EVENT FILTERING AND SEARCH
// ----------------------------------------------------------------

function initFilters() {
  const searchInput = document.getElementById("search-input");
  const searchBtn = document.getElementById("search-btn");
  const campusFilter = document.getElementById("filter-campus");
  const categoryFilter = document.getElementById("filter-category");
  const dateFilter = document.getElementById("filter-date");
  const resetBtn = document.getElementById("btn-reset-filters");

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      AppState.searchQuery = searchInput.value.trim();
      applyFilters();
    });
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") applyFilters();
    });
  }
  if (searchBtn) searchBtn.addEventListener("click", applyFilters);

  if (campusFilter) {
    campusFilter.addEventListener("change", () => {
      AppState.campusFilter = campusFilter.value;
      applyFilters();
    });
  }
  if (categoryFilter) {
    categoryFilter.addEventListener("change", () => {
      AppState.categoryFilter = categoryFilter.value;
      applyFilters();
    });
  }
  if (dateFilter) {
    dateFilter.addEventListener("change", () => {
      AppState.dateFilter = dateFilter.value;
      applyFilters();
    });
  }
  if (resetBtn) {
    resetBtn.addEventListener("click", resetFilters);
  }
}

function resetFilters() {
  AppState.searchQuery = "";
  AppState.campusFilter = "all";
  AppState.categoryFilter = "all";
  AppState.dateFilter = "all";

  const searchInput = document.getElementById("search-input");
  const campusFilter = document.getElementById("filter-campus");
  const categoryFilter = document.getElementById("filter-category");
  const dateFilter = document.getElementById("filter-date");
  if (searchInput) searchInput.value = "";
  if (campusFilter) campusFilter.value = "all";
  if (categoryFilter) categoryFilter.value = "all";
  if (dateFilter) dateFilter.value = "all";

  applyFilters();
}

function filterEvents(events) {
  const q = AppState.searchQuery.toLowerCase();
  const campus = AppState.campusFilter;
  const category = AppState.categoryFilter;
  const date = AppState.dateFilter;

  return events.filter((event) => {
    // Text search
    if (q) {
      const haystack = [
        event.title,
        event.shortDescription,
        event.fullDescription,
        event.venue,
        event.campus,
        event.category,
        ...(event.tags || []),
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    // Campus filter
    if (campus !== "all" && event.campus !== campus) return false;

    // Category filter
    if (category !== "all" && event.category !== category) return false;

    // Date filter
    if (date !== "all") {
      if (date === "today" && !isWithinDays(event.date, 0)) return false;
      if (date === "week" && !isWithinDays(event.date, 7)) return false;
      if (date === "month" && !isWithinDays(event.date, 30)) return false;
    }

    return true;
  });
}

function applyFilters() {
  const allEvents = getAllEvents();
  const filtered = filterEvents(allEvents);
  renderEventCards(filtered);
  updateResultCount(filtered.length, allEvents.length);
}

function updateResultCount(shown, total) {
  const el = document.getElementById("result-count");
  if (!el) return;
  if (
    AppState.searchQuery === "" &&
    AppState.campusFilter === "all" &&
    AppState.categoryFilter === "all" &&
    AppState.dateFilter === "all"
  ) {
    el.textContent = `Showing all ${total} events`;
  } else {
    el.textContent = `${shown} event${shown !== 1 ? "s" : ""} found`;
  }
}

// ----------------------------------------------------------------
// 6. EVENT CARDS
// ----------------------------------------------------------------

function renderEventCards(events) {
  const grid = document.getElementById("events-grid");
  if (!grid) return;

  if (events.length === 0) {
    grid.innerHTML = `
      <div class="empty-state full-width">
        <div class="empty-state-icon">🔍</div>
        <h3>No events found</h3>
        <p>Try adjusting your search terms or filters. New events are added regularly.</p>
        <button class="btn btn-primary" id="empty-reset-btn">Reset Filters</button>
      </div>`;
    const emptyReset = document.getElementById("empty-reset-btn");
    if (emptyReset) emptyReset.addEventListener("click", resetFilters);
    return;
  }

  grid.innerHTML = "";
  events.forEach((event) => {
    const card = createEventCard(event);
    grid.appendChild(card);
    Reminders.refreshReminderButtons(event.id);
  });
}

function createEventCard(event) {
  const card = document.createElement("article");
  card.className = "event-card";
  card.dataset.eventId = event.id;

  const countdown = getCountdown(event.date);
  const isSaved = Storage.isEventSaved(event.id);
  const sourceLabel = event.source === "sample"
    ? '<span class="trust-label trust-sample">Sample Event</span>'
    : '<span class="trust-label trust-community">Community Submitted</span>';

  const countdownHTML = countdown
    ? `<div class="countdown-badge countdown-${countdown.type}">${escapeHTML(countdown.text)}</div>`
    : "";

  card.innerHTML = `
    <div class="event-card-header">
      <span class="event-category-badge category-${(event.category || "").toLowerCase().replace(/[^a-z0-9]/g, "-")}">${escapeHTML(event.category)}</span>
      ${sourceLabel}
    </div>
    <h3 class="event-card-title">${escapeHTML(event.title)}</h3>
    <div class="event-card-meta">
      <span class="meta-item">📅 ${escapeHTML(formatDate(event.date))}</span>
      <span class="meta-item">🕐 ${escapeHTML(formatTime(event.time))}</span>
      <span class="meta-item">📍 ${escapeHTML(event.venue)}</span>
      <span class="meta-item">🏛️ ${escapeHTML(event.campus)}</span>
    </div>
    <p class="event-card-desc">${escapeHTML(event.shortDescription)}</p>
    ${event.organizerId ? `<div class="event-ticket-price">${event.price > 0 ? `₦${event.price.toLocaleString()} <small>per ticket</small>` : "Free event"}</div>` : ""}
    ${countdownHTML}
    <div class="event-card-actions">
      <button class="btn btn-primary btn-sm" data-action="view-details" data-id="${event.id}">View Details</button>
      <button class="btn ${isSaved ? "btn-saved" : "btn-save"} btn-sm" data-action="${isSaved ? "unsave" : "save"}" data-id="${event.id}">
        ${isSaved ? "✓ Saved" : "♡ Save"}
      </button>
      <button class="btn btn-secondary btn-sm" data-action="register" data-id="${event.id}">Register</button>
      <button class="btn btn-outline btn-sm" data-action="share" data-id="${event.id}">Share</button>
      <button class="btn btn-outline btn-sm" data-reminder-btn="${event.id}">Set Reminder</button>
    </div>`;

  return card;
}

// ----------------------------------------------------------------
// 7. EVENT DETAILS MODAL
// ----------------------------------------------------------------

function openEventDetails(eventId) {
  const event = getAllEvents().find((e) => e.id === eventId);
  if (!event) return;

  const modal = document.getElementById("event-details-modal");
  if (!modal) return;

  const countdown = getCountdown(event.date);
  const isSaved = Storage.isEventSaved(event.id);
  const sourceLabel = event.source === "sample"
    ? '<span class="trust-label trust-sample">Sample Event</span>'
    : '<span class="trust-label trust-community">Community Submitted</span>';

  const body = modal.querySelector(".modal-body");
  if (!body) return;

  body.innerHTML = `
    <div class="details-header">
      <div class="details-badges">
        <span class="event-category-badge category-${(event.category || "").toLowerCase().replace(/[^a-z0-9]/g, "-")}">${escapeHTML(event.category)}</span>
        ${sourceLabel}
      </div>
      ${countdown ? `<div class="countdown-badge countdown-${countdown.type}">${escapeHTML(countdown.text)}</div>` : ""}
    </div>

    <h2 class="details-title">${escapeHTML(event.title)}</h2>

    <div class="details-meta-grid">
      <div class="detail-item"><span class="detail-icon">📅</span><div><strong>Date</strong><span>${escapeHTML(formatDate(event.date))}</span></div></div>
      <div class="detail-item"><span class="detail-icon">🕐</span><div><strong>Time</strong><span>${escapeHTML(formatTime(event.time))}</span></div></div>
      <div class="detail-item"><span class="detail-icon">📍</span><div><strong>Venue</strong><span>${escapeHTML(event.venue)}</span></div></div>
      <div class="detail-item"><span class="detail-icon">🏛️</span><div><strong>Campus</strong><span>${escapeHTML(event.campus)}</span></div></div>
    </div>

    <div class="details-description">
      <h3>About this Event</h3>
      <p>${escapeHTML(event.fullDescription || event.shortDescription)}</p>
    </div>
    ${event.organizerId ? `<div class="event-booking-facts"><div><span>Ticket</span><strong>${event.price > 0 ? `₦${event.price.toLocaleString()}` : "Free"}</strong></div><div><span>Organizer</span><strong>${escapeHTML(event.organizerName)}</strong></div><div><span>Capacity</span><strong>${event.capacity}</strong></div></div>` : ""}

    <div class="details-actions">
      <button class="btn btn-primary" data-action="register" data-id="${event.id}">Register for Event</button>
      <button class="btn ${isSaved ? "btn-saved" : "btn-save"}" data-action="${isSaved ? "unsave" : "save"}" data-id="${event.id}">
        ${isSaved ? "✓ Saved" : "♡ Save Event"}
      </button>
      <button class="btn btn-outline" data-reminder-btn="${event.id}">Set Reminder</button>
      <button class="btn btn-outline" data-action="share" data-id="${event.id}">Share Event</button>
    </div>`;

  openModal("event-details-modal");
  Reminders.refreshReminderButtons(event.id);
}

// ----------------------------------------------------------------
// 8. SAVED EVENTS
// ----------------------------------------------------------------

function renderSavedEvents() {
  const container = document.getElementById("saved-events-list");
  if (!container) return;

  const savedIds = Storage.getSavedEventIds();
  const allEvents = getAllEvents();

  // Filter out IDs that no longer correspond to valid events
  const savedEvents = savedIds
    .map((id) => allEvents.find((e) => e.id === id))
    .filter(Boolean);

  updateSavedBadge();

  if (savedEvents.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔖</div>
        <h3>No saved events yet</h3>
        <p>Browse events and click the Save button to bookmark events you're interested in. Saved events are stored in your browser and will be here when you return.</p>
        <button class="btn btn-primary" data-nav="events">Browse Events</button>
      </div>`;
    container.querySelector("[data-nav]")?.addEventListener("click", (e) => {
      e.preventDefault();
      navigateTo("events");
    });
    return;
  }

  container.innerHTML = "";
  savedEvents.forEach((event) => {
    const item = document.createElement("div");
    item.className = "saved-event-item";
    item.innerHTML = `
      <div class="saved-event-info">
        <h4>${escapeHTML(event.title)}</h4>
        <p class="saved-event-meta">
          <span>📅 ${escapeHTML(formatDate(event.date))}</span>
          <span>🏛️ ${escapeHTML(event.campus)}</span>
        </p>
        <span class="event-category-badge category-${(event.category || "").toLowerCase().replace(/[^a-z0-9]/g, "-")}">${escapeHTML(event.category)}</span>
      </div>
      <div class="saved-event-actions">
        <button class="btn btn-outline btn-sm" data-action="view-details" data-id="${event.id}">View Details</button>
        <button class="btn btn-danger btn-sm" data-action="unsave" data-id="${event.id}">Remove</button>
      </div>`;
    container.appendChild(item);
  });
}

function updateSavedBadge() {
  const badge = document.getElementById("saved-badge");
  if (!badge) return;
  const count = Storage.getSavedEventIds().length;
  badge.textContent = count > 0 ? count : "";
  badge.style.display = count > 0 ? "inline-flex" : "none";
}

// ----------------------------------------------------------------
// 9. CAMPUS PULSE
// ----------------------------------------------------------------

function renderCampusPulse() {
  const container = document.getElementById("pulse-campuses");
  if (!container) return;

  const allEvents = getAllEvents();
  const today = new Date();
  const todayNorm = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  container.innerHTML = "";

  CONFIG.campuses.forEach((campus) => {
    const campusEvents = allEvents.filter((e) => {
      if (e.campus !== campus) return false;
      return isUpcoming(e.date);
    });

    // Sort by date
    campusEvents.sort((a, b) => (a.date > b.date ? 1 : -1));

    const nextEvent = campusEvents[0] || null;
    const count = campusEvents.length;

    const card = document.createElement("div");
    card.className = "pulse-card";
    card.innerHTML = `
      <div class="pulse-card-header">
        <h3 class="pulse-campus-name">🏛️ ${escapeHTML(campus)}</h3>
        <span class="pulse-event-count">${count} upcoming event${count !== 1 ? "s" : ""}</span>
      </div>
      ${
        nextEvent
          ? `<div class="pulse-next-event">
               <p class="pulse-label">Next Event</p>
               <p class="pulse-event-title">${escapeHTML(nextEvent.title)}</p>
               <p class="pulse-event-date">📅 ${escapeHTML(formatDate(nextEvent.date))} · ${escapeHTML(formatTime(nextEvent.time))}</p>
             </div>`
          : `<div class="pulse-no-events"><p>No upcoming events currently listed for this campus.</p></div>`
      }
      <button class="btn btn-outline btn-sm pulse-explore-btn" data-campus="${escapeHTML(campus)}">Explore ${escapeHTML(campus)}</button>`;

    card.querySelector(".pulse-explore-btn").addEventListener("click", () => {
      AppState.campusFilter = campus;
      document.getElementById("filter-campus").value = campus;
      applyFilters();
      navigateTo("events");
    });

    container.appendChild(card);
  });

  // Overall summary
  const totalUpcoming = allEvents.filter((e) => isUpcoming(e.date)).length;
  const summaryEl = document.getElementById("pulse-summary");
  if (summaryEl) {
    summaryEl.innerHTML = `
      <p>There ${totalUpcoming === 1 ? "is" : "are"} currently <strong>${totalUpcoming}</strong> upcoming event${totalUpcoming !== 1 ? "s" : ""} across all campuses.</p>
      <p class="disclaimer-text">Event counts are based on demonstration sample and community-submitted data. These are not official University of Uyo figures.</p>`;
  }
}

// ----------------------------------------------------------------
// 10. EVENT SUBMISSION
// ----------------------------------------------------------------

function initSubmitForm() {
  const form = document.getElementById("submit-event-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearFormErrors("submit-event-form");

    const title = form.querySelector("#sub-title").value.trim();
    const category = form.querySelector("#sub-category").value;
    const date = form.querySelector("#sub-date").value;
    const time = form.querySelector("#sub-time").value;
    const venue = form.querySelector("#sub-venue").value.trim();
    const campus = form.querySelector("#sub-campus").value;
    const description = form.querySelector("#sub-description").value.trim();
    const price = Number(form.querySelector("#sub-price").value);
    const capacity = Number(form.querySelector("#sub-capacity").value);

    let valid = true;

    if (!title) { showFieldError("sub-title", "Event title is required."); valid = false; }
    if (!category) { showFieldError("sub-category", "Please select a category."); valid = false; }
    if (!date) { showFieldError("sub-date", "Date is required."); valid = false; }
    if (!time) { showFieldError("sub-time", "Time is required."); valid = false; }
    if (!venue) { showFieldError("sub-venue", "Venue is required."); valid = false; }
    if (!campus) { showFieldError("sub-campus", "Please select a campus."); valid = false; }
    if (!description) { showFieldError("sub-description", "Description is required."); valid = false; }
    if (!Number.isFinite(price) || price < 0) { showFieldError("sub-price", "Enter a valid price."); valid = false; }
    if (!Number.isInteger(capacity) || capacity < 1) { showFieldError("sub-capacity", "Enter a valid capacity."); valid = false; }

    if (!valid) return;

    // Validate date is valid calendar date
    const dateParts = date.split("-");
    if (dateParts.length !== 3) { showFieldError("sub-date", "Invalid date format."); return; }
    const dateObj = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
    if (isNaN(dateObj.getTime())) { showFieldError("sub-date", "Please enter a valid date."); return; }

    const session = ExperienceShell.session();
    if (!session?.user) { location.hash = "signin"; ExperienceShell.renderPublic("signin"); return; }
    if (price > 0 && !OrganizerState.profile?.payout_verified) {
      if (!OrganizerState.resolvedAccount) { showToast("Verify your payout account before publishing a paid event.", "error"); return; }
      try { await saveOrganizerPayout(session.user); } catch (error) { showToast(error.message || "Payout account could not be saved.", "error"); return; }
    }

    const newEvent = {
      id: generateId("sub"),
      title,
      category,
      date,
      time,
      venue,
      campus,
      shortDescription: description.length > 150 ? description.substring(0, 150) + "…" : description,
      fullDescription: description,
      tags: [],
      source: "community",
      price,
      capacity,
    };
    const submitButton = form.querySelector('[type="submit"]'); submitButton.disabled = true; submitButton.textContent = "Publishing…";
    let published;
    try { published = await DataService.createEvent(newEvent, session.user); }
    catch (error) { showToast(error.message || "Event could not be published.", "error"); submitButton.disabled=false; submitButton.textContent="Submit Event"; return; }

    // Show success message
    const successMsg = document.getElementById("submit-success");
    if (successMsg) {
      successMsg.style.display = "block";
      successMsg.innerHTML = `
        <strong>✓ Event submitted successfully!</strong>
        Your event "<em>${escapeHTML(title)}</em>" has been added to the event listings.
        It now has a public registration link.
        <div class="publish-actions"><button class="btn btn-primary btn-sm" data-action="share" data-id="${published.id}">Share Event</button><button class="btn btn-outline btn-sm" id="view-submitted-btn">View Events</button></div>`;
      successMsg.querySelector("#view-submitted-btn")?.addEventListener("click", () => navigateTo("events"));
    }

    form.reset();
    form.querySelector("#sub-price").value = "0";
    document.getElementById("payout-setup").hidden = true;
    submitButton.disabled=false; submitButton.textContent="Submit Event";

    // Refresh all relevant displays
    applyFilters();
    renderCampusPulse();
    Calendar.refreshCalendar();
    if (AppState.activeSection === "recommendations") {
      Recommendations.renderRecommendations("recommendations-list");
    }

    showToast(`Event "${title}" added successfully!`, "success");
  });
}

// ----------------------------------------------------------------
// 11. POPULATE DROPDOWNS FROM CONFIG
// ----------------------------------------------------------------

function populateDropdowns() {
  // Campus filter dropdown
  const campusFilter = document.getElementById("filter-campus");
  if (campusFilter) {
    CONFIG.campuses.forEach((campus) => {
      const opt = document.createElement("option");
      opt.value = campus;
      opt.textContent = campus;
      campusFilter.appendChild(opt);
    });
  }

  // Category filter dropdown
  const categoryFilter = document.getElementById("filter-category");
  if (categoryFilter) {
    CONFIG.categories.forEach((cat) => {
      const opt = document.createElement("option");
      opt.value = cat;
      opt.textContent = cat;
      categoryFilter.appendChild(opt);
    });
  }

  // Submit form campus
  const subCampus = document.getElementById("sub-campus");
  if (subCampus) {
    CONFIG.campuses.forEach((campus) => {
      const opt = document.createElement("option");
      opt.value = campus;
      opt.textContent = campus;
      subCampus.appendChild(opt);
    });
  }

  // Submit form category
  const subCategory = document.getElementById("sub-category");
  if (subCategory) {
    CONFIG.categories.forEach((cat) => {
      const opt = document.createElement("option");
      opt.value = cat;
      opt.textContent = cat;
      subCategory.appendChild(opt);
    });
  }

  // Calendar campus filter
  const calCampus = document.getElementById("cal-campus-filter");
  if (calCampus) {
    CONFIG.campuses.forEach((campus) => {
      const opt = document.createElement("option");
      opt.value = campus;
      opt.textContent = campus;
      calCampus.appendChild(opt);
    });
  }
}

// ----------------------------------------------------------------
// 12. GLOBAL CLICK DELEGATION
// ----------------------------------------------------------------

function initGlobalClickHandlers() {
  document.addEventListener("click", (e) => {
    const target = e.target.closest("[data-action]");
    if (!target) return;

    const action = target.dataset.action;
    const id = target.dataset.id;

    if (action === "view-details") {
      openEventDetails(id);
    } else if (action === "save") {
      Storage.saveEvent(id);
      target.dataset.action = "unsave";
      target.className = target.className.replace("btn-save", "btn-saved");
      target.textContent = "✓ Saved";
      updateSavedBadge();
      refreshAllSaveButtons(id, true);
      showToast("Event saved to your bookmarks.", "success");
    } else if (action === "unsave") {
      Storage.unsaveEvent(id);
      target.dataset.action = "save";
      target.className = target.className.replace("btn-saved", "btn-save");
      target.textContent = "♡ Save";
      updateSavedBadge();
      refreshAllSaveButtons(id, false);
      if (AppState.activeSection === "saved") renderSavedEvents();
      showToast("Event removed from your bookmarks.", "success");
    } else if (action === "register") {
      closeAllModals();
      Registration.openForEvent(id);
    } else if (action === "share") {
      shareEvent(id);
    }

    // Backdrop click to close modal
    if (target.classList.contains("modal-backdrop")) {
      closeAllModals();
    }
  });

  // Modal close buttons
  document.querySelectorAll("[data-close-modal]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const modalId = btn.dataset.closeModal;
      closeModal(modalId || null);
    });
  });

  // Backdrop click
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeAllModals();
    });
  });

  // Registration form
  const regForm = document.getElementById("registration-form");
  if (regForm) regForm.addEventListener("submit", Registration.handleSubmit);
  const quantityInput = document.getElementById("reg-quantity");
  if (quantityInput) quantityInput.addEventListener("input", () => {
    const event = getAllEvents().find((item) => item.id === document.getElementById("reg-event-id").value);
    const button = document.getElementById("registration-submit"); const quantity = Math.max(1, Number(quantityInput.value)||1);
    if(event?.organizerId&&button) button.textContent=event.price>0?`Pay ₦${(event.price*quantity).toLocaleString()}`:"Get free ticket";
  });

  // Reminder form
  const remForm = document.getElementById("reminder-form");
  if (remForm) remForm.addEventListener("submit", Reminders.saveReminder);

  // Print button
  const printBtn = document.getElementById("btn-print-pass");
  if (printBtn) printBtn.addEventListener("click", Registration.printPass);

  // Register another
  const regAnotherBtn = document.getElementById("btn-register-another");
  if (regAnotherBtn) regAnotherBtn.addEventListener("click", Registration.registerAnother);

  // Calendar controls
  const calPrev = document.getElementById("cal-prev");
  const calNext = document.getElementById("cal-next");
  if (calPrev) calPrev.addEventListener("click", Calendar.prevMonth);
  if (calNext) calNext.addEventListener("click", Calendar.nextMonth);

  const calCampus = document.getElementById("cal-campus-filter");
  if (calCampus) {
    calCampus.addEventListener("change", () => Calendar.setCampusFilter(calCampus.value));
  }

  // Interest selector -> refresh recommendations
  const refreshRecBtn = document.getElementById("btn-refresh-rec");
  if (refreshRecBtn) {
    refreshRecBtn.addEventListener("click", () => {
      Recommendations.renderRecommendations("recommendations-list");
    });
  }

  const priceInput=document.getElementById("sub-price");
  if(priceInput)priceInput.addEventListener("input",async()=>{const setup=document.getElementById("payout-setup");setup.hidden=!(Number(priceInput.value)>0);if(!setup.hidden){try{await loadBanks();await prepareOrganizerForm();}catch(error){showToast(error.message||"Payout setup is unavailable.","error");}}});
  document.getElementById("verify-payout")?.addEventListener("click",verifyPayoutAccount);

  // Footer year
  const yearEl = document.getElementById("footer-year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

function eventShareUrl(event) { return `${location.origin}${location.pathname}?event=${encodeURIComponent(event.slug || event.id)}`; }
async function shareEvent(id) {
  const event = getAllEvents().find((item) => item.id === id); if (!event) return;
  const payload = { title: event.title, text: `Join me at ${event.title}`, url: eventShareUrl(event) };
  try { if (navigator.share) await navigator.share(payload); else { await navigator.clipboard.writeText(payload.url); showToast("Event link copied.", "success"); } }
  catch (error) { if (error.name !== "AbortError") showToast("Could not share this link.", "error"); }
}

async function prepareOrganizerForm() {
  const session = ExperienceShell.session(); if (!session?.user) return;
  try { OrganizerState.profile = await DataService.getProfile(session.user.id); renderPayoutState(); } catch (error) { console.warn(error); }
}

function renderPayoutState() {
  const saved = document.getElementById("saved-payout"); const fields = document.getElementById("new-payout-fields");
  if (OrganizerState.profile?.payout_verified) {
    saved.hidden=false; fields.hidden=true;
    saved.innerHTML=`<span class="payout-check">✓</span><div><strong>${escapeHTML(OrganizerState.profile.payout_account_name)}</strong><p>${escapeHTML(OrganizerState.profile.payout_bank_name)} · ••••••${escapeHTML(OrganizerState.profile.payout_account_last4)}</p></div><button type="button" id="change-payout">Change</button>`;
    saved.querySelector("#change-payout").onclick=()=>{saved.hidden=true;fields.hidden=false;};
  } else { saved.hidden=true; fields.hidden=false; }
}

async function loadBanks() {
  if (OrganizerState.banks.length) return;
  const result=await DataService.invokePayment({action:"banks"}); OrganizerState.banks=result.banks||[];
  const select=document.getElementById("payout-bank"); OrganizerState.banks.forEach((bank)=>{const option=document.createElement("option");option.value=bank.code;option.textContent=bank.name;select.appendChild(option);});
}

async function verifyPayoutAccount() {
  const bankCode=document.getElementById("payout-bank").value; const accountNumber=document.getElementById("payout-account").value.trim();
  if(!bankCode||!/^[0-9]{10}$/.test(accountNumber)){showToast("Select a bank and enter a 10-digit account number.","error");return;}
  const button=document.getElementById("verify-payout");button.disabled=true;button.textContent="Verifying…";
  try{const result=await DataService.invokePayment({action:"resolve-account",bankCode,accountNumber});const bank=OrganizerState.banks.find((item)=>item.code===bankCode);OrganizerState.resolvedAccount={bankCode,bankName:bank?.name||"Bank",accountNumber,accountName:result.accountName};const box=document.getElementById("resolved-account");box.hidden=false;box.innerHTML=`<span>✓</span><div><small>ACCOUNT FOUND</small><strong>${escapeHTML(result.accountName)}</strong><p>${escapeHTML(bank?.name||"")} · ••••••${escapeHTML(accountNumber.slice(-4))}</p></div>`;}catch(error){showToast(error.message||"Account could not be verified.","error");}finally{button.disabled=false;button.textContent="Verify account";}
}

async function saveOrganizerPayout(user) {
  const account=OrganizerState.resolvedAccount;
  await DataService.invokePayment({action:"save-payout",...account,businessName:user.user_metadata?.full_name||user.email.split("@")[0]});
  OrganizerState.profile=await DataService.getProfile(user.id); renderPayoutState();
}

async function renderOrganizerEvents() {
  const session=ExperienceShell.session(); const list=document.getElementById("organizer-events-list"); const summary=document.getElementById("organizer-summary");
  if(!session?.user||!list)return;
  list.innerHTML='<div class="loading-state">Loading your events…</div>';
  try{const events=await DataService.myEvents(session.user.id);const registrations=events.flatMap((event)=>event.registrations||[]);const tickets=registrations.filter((item)=>["paid","free"].includes(item.payment_status)).reduce((sum,item)=>sum+item.quantity,0);const revenue=registrations.filter((item)=>item.payment_status==="paid").reduce((sum,item)=>sum+Number(item.total_amount),0);summary.innerHTML=`<div><span>Events</span><strong>${events.length}</strong></div><div><span>Tickets</span><strong>${tickets}</strong></div><div><span>Revenue</span><strong>₦${revenue.toLocaleString()}</strong></div>`;list.innerHTML=events.length?events.map((event)=>`<article class="organizer-event-row"><div><span>${formatDate(event.event_date)}</span><h3>${escapeHTML(event.title)}</h3><p>${event.registrations?.length||0} registrations · ${event.price>0?`₦${Number(event.price).toLocaleString()}`:"Free"}</p></div><button class="btn btn-outline btn-sm" data-action="share" data-id="${event.id}">Share</button></article>`).join(""):`<div class="empty-state"><h3>No events yet</h3><p>Create your first campus event and it will appear here.</p><button class="btn btn-primary" onclick="navigateTo('submit')">Create Event</button></div>`;}catch(error){list.innerHTML=`<div class="empty-state"><p>${escapeHTML(error.message)}</p></div>`;}
}

/** Refreshes all save/unsave buttons for a given event ID across the page. */
function refreshAllSaveButtons(eventId, isSaved) {
  document.querySelectorAll(`[data-id="${eventId}"][data-action]`).forEach((btn) => {
    const action = btn.dataset.action;
    if (action === "save" || action === "unsave") {
      btn.dataset.action = isSaved ? "unsave" : "save";
      // Use classList to avoid string manipulation bugs
      btn.classList.remove("btn-save", "btn-saved");
      btn.classList.add(isSaved ? "btn-saved" : "btn-save");
      if (btn.tagName === "BUTTON") {
        btn.textContent = isSaved ? "✓ Saved" : "♡ Save";
      }
    }
  });
}

// ----------------------------------------------------------------
// 13. STORAGE AVAILABILITY BANNER
// ----------------------------------------------------------------

function showStorageWarning() {
  if (!Storage.isAvailable()) {
    const banner = document.getElementById("storage-warning");
    if (banner) banner.style.display = "block";
  }
}

// ----------------------------------------------------------------
// 14. APP INITIALIZATION
// ----------------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
  populateDropdowns();
  initNavigation();
  initFilters();
  initSubmitForm();
  initGlobalClickHandlers();

  // Initial renders
  applyFilters();
  renderCampusPulse();
  updateSavedBadge();
  showStorageWarning();

  // Calendar init
  Calendar.init();

  // Reminders init
  Reminders.init();

  // Recommendations init (only fully loads when section is visited)
  Recommendations.renderInterestSelector("interest-selector");

  // Show home by default
  navigateTo("home");

  DataService.loadEvents().then(()=>{
    applyFilters();renderCampusPulse();Calendar.refreshCalendar();
    const query=new URLSearchParams(location.search);const shared=query.get("event");
    if(shared){const event=getAllEvents().find((item)=>item.slug===shared||item.id===shared);if(event){document.body.classList.add("guest-event-mode");document.getElementById("public-root").hidden=true;document.getElementById("private-root").hidden=false;document.getElementById("nav-menu").innerHTML='<li><button class="nav-theme-button" data-theme-toggle>◐ Theme</button></li><li><button class="btn btn-outline btn-sm" onclick="location.hash=\'signin\';location.search=\'\'">Sign in</button></li><li><button class="btn btn-primary btn-sm" onclick="location.hash=\'signup\';location.search=\'\'">Create account</button></li>';document.querySelectorAll(".page-section").forEach((section)=>section.classList.remove("active-section"));document.getElementById("section-events").classList.add("active-section");openEventDetails(event.id);}}
    const reference=query.get("reference")||query.get("trxref");
    if(query.get("payment")==="callback"&&reference){const pending=JSON.parse(sessionStorage.getItem("uniuyo_pending_booking")||"null");DataService.invokePayment({action:"verify",reference}).then((result)=>{const event=getAllEvents().find((item)=>item.id===(pending?.eventId||result.ticket.eventId));if(!event)throw new Error("Paid event could not be loaded.");document.getElementById("public-root").hidden=true;document.getElementById("private-root").hidden=false;Registration.showServerTicket(result.ticket,event,pending?.email||"");sessionStorage.removeItem("uniuyo_pending_booking");history.replaceState({},"",location.pathname);showToast("Payment confirmed. Your ticket is ready.","success");}).catch((error)=>showToast(error.message||"Payment verification failed.","error"));}
  }).catch((error)=>console.warn("Shared events unavailable",error));
});
