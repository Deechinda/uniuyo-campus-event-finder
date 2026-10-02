// ============================================================
// registration.js – Event registration and Digital Event Pass
// UNIUYO Campus Event Finder
// ============================================================
// IMPORTANT: This is a front-end demonstration only.
// No data is sent to a server. No email confirmation is sent.
// Registrations are stored locally in browser localStorage only.

const Registration = (() => {
  let currentEventId = null;

  // ----------------------------------------------------------------
  // Open Registration Modal pre-filled with an event
  // ----------------------------------------------------------------
  function openForEvent(eventId) {
    const event = getAllEvents().find((e) => e.id === eventId);
    if (!event) {
      showToast("Event not found. Please try again.", "error");
      return;
    }

    currentEventId = eventId;

    // Populate event selector / display
    const eventDisplay = document.getElementById("reg-event-display");
    const eventIdInput = document.getElementById("reg-event-id");
    if (eventDisplay) eventDisplay.textContent = event.title;
    if (eventIdInput) eventIdInput.value = eventId;

    // Check if already registered
    if (Storage.isAlreadyRegistered(eventId)) {
      const existing = Storage.getRegistrationForEvent(eventId);
      if (existing) {
        showPassDirectly(existing, event);
        return;
      }
    }

    // Clear form
    const form = document.getElementById("registration-form");
    if (form) form.reset();
    if (eventIdInput) eventIdInput.value = eventId;
    if (eventDisplay) eventDisplay.textContent = event.title;

    // Hide pass, show form
    togglePassView(false);
    clearFormErrors("registration-form");

    // Open modal
    openModal("registration-modal");
  }

  // ----------------------------------------------------------------
  // Handle form submission
  // ----------------------------------------------------------------
  function handleSubmit(e) {
    e.preventDefault();
    clearFormErrors("registration-form");

    const form = e.target;
    const name = form.querySelector("#reg-name").value.trim();
    const email = form.querySelector("#reg-email").value.trim();
    const eventId = form.querySelector("#reg-event-id").value;

    let valid = true;

    if (!name) {
      showFieldError("reg-name", "Please enter your full name.");
      valid = false;
    }

    if (!email) {
      showFieldError("reg-email", "Please enter your email address.");
      valid = false;
    } else if (!isValidEmail(email)) {
      showFieldError("reg-email", "Please enter a valid email address.");
      valid = false;
    }

    if (!valid) return;

    // Duplicate check
    if (Storage.isAlreadyRegistered(eventId)) {
      const existing = Storage.getRegistrationForEvent(eventId);
      const event = getAllEvents().find((ev) => ev.id === eventId);
      if (existing && event) {
        showPassDirectly(existing, event);
        return;
      }
    }

    const event = getAllEvents().find((ev) => ev.id === eventId);
    if (!event) {
      showFieldError("reg-email", "Event not found. Please close and try again.");
      return;
    }

    const ref = generateRegistrationRef();
    const registration = {
      ref,
      eventId,
      name,
      email,
      registeredAt: new Date().toISOString(),
    };

    const saved = Storage.saveRegistration(registration);
    if (!saved) {
      showToast("Could not save registration. Your browser storage may be unavailable.", "error");
      return;
    }

    showEventPass(registration, event);
  }

  // ----------------------------------------------------------------
  // Generate unique registration reference
  // ----------------------------------------------------------------
  function generateRegistrationRef() {
    const now = new Date();
    const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
    const rand = Math.random().toString(36).substr(2, 6).toUpperCase();
    return `UNIUYO-${stamp}-${rand}`;
  }

  // ----------------------------------------------------------------
  // Display the Digital Event Pass
  // ----------------------------------------------------------------
  function showEventPass(registration, event) {
    togglePassView(true);
    populatePass(registration, event);
  }

  function showPassDirectly(registration, event) {
    clearFormErrors("registration-form");
    togglePassView(true);
    populatePass(registration, event);
    openModal("registration-modal");

    // Show already-registered notice
    const notice = document.getElementById("reg-duplicate-notice");
    if (notice) notice.style.display = "block";
  }

  function populatePass(registration, event) {
    const pass = document.getElementById("event-pass");
    if (!pass) return;

    const notice = document.getElementById("reg-duplicate-notice");
    if (notice) notice.style.display = "none";

    pass.innerHTML = `
      <div class="pass-watermark" aria-hidden="true">DEMONSTRATION PASS</div>
      <div class="pass-header">
        <div class="pass-logo">🎓</div>
        <div>
          <h3 class="pass-site-name">${escapeHTML(CONFIG.siteName)}</h3>
          <p class="pass-university">${escapeHTML(CONFIG.university)}</p>
        </div>
      </div>

      <div class="pass-divider"></div>

      <div class="pass-title-section">
        <p class="pass-label">EVENT</p>
        <h2 class="pass-event-title">${escapeHTML(event.title)}</h2>
      </div>

      <div class="pass-details-grid">
        <div class="pass-detail">
          <span class="pass-label">DATE</span>
          <span class="pass-value">${formatDate(event.date)}</span>
        </div>
        <div class="pass-detail">
          <span class="pass-label">TIME</span>
          <span class="pass-value">${formatTime(event.time)}</span>
        </div>
        <div class="pass-detail">
          <span class="pass-label">VENUE</span>
          <span class="pass-value">${escapeHTML(event.venue)}</span>
        </div>
        <div class="pass-detail">
          <span class="pass-label">CAMPUS</span>
          <span class="pass-value">${escapeHTML(event.campus)}</span>
        </div>
        <div class="pass-detail">
          <span class="pass-label">REGISTRANT</span>
          <span class="pass-value">${escapeHTML(registration.name)}</span>
        </div>
        <div class="pass-detail">
          <span class="pass-label">REFERENCE</span>
          <span class="pass-value pass-ref">${escapeHTML(registration.ref)}</span>
        </div>
      </div>

      <div class="pass-divider"></div>

      <div class="pass-notice">
        <strong>⚠ Prototype Notice:</strong> This is a demonstration event pass generated for a front-end academic project.
        It is not an official University of Uyo ticket and does not grant real access to any event.
        This pass is stored locally in your browser only.
      </div>`;
  }

  function togglePassView(showPass) {
    const formSection = document.getElementById("reg-form-section");
    const passSection = document.getElementById("reg-pass-section");
    if (formSection) formSection.style.display = showPass ? "none" : "block";
    if (passSection) passSection.style.display = showPass ? "block" : "none";
  }

  // ----------------------------------------------------------------
  // Print the pass
  // ----------------------------------------------------------------
  function printPass() {
    window.print();
  }

  // ----------------------------------------------------------------
  // Register again (reset form)
  // ----------------------------------------------------------------
  function registerAnother() {
    togglePassView(false);
    const form = document.getElementById("registration-form");
    if (form) form.reset();
    clearFormErrors("registration-form");
    currentEventId = null;
  }

  // ----------------------------------------------------------------
  // Public API
  // ----------------------------------------------------------------
  return { openForEvent, handleSubmit, printPass, registerAnother };
})();
