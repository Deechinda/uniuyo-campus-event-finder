// ============================================================
// storage.js – localStorage helper functions
// UNIUYO Campus Event Finder
// ============================================================
// NOTE: localStorage is browser-specific and not a shared database.
// Data stored here is only accessible in the current browser on
// the current device. It can be cleared by the user at any time.

const Storage = (() => {
  // ----------------------------------------------------------------
  // Internal helpers
  // ----------------------------------------------------------------

  /** Safely reads and parses a JSON value from localStorage. */
  function read(key) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return null;
      return JSON.parse(raw);
    } catch (err) {
      console.warn(`[Storage] Failed to read key "${key}":`, err);
      return null;
    }
  }

  /** Safely serializes and writes a value to localStorage.
   *  Returns true on success, false on failure (e.g. storage quota exceeded). */
  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err) {
      console.error(`[Storage] Failed to write key "${key}":`, err);
      return false;
    }
  }

  /** Checks whether localStorage is available in this browser session. */
  function isAvailable() {
    try {
      const test = "__uniuyo_test__";
      localStorage.setItem(test, "1");
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  // ----------------------------------------------------------------
  // Submitted Events
  // ----------------------------------------------------------------

  function getSubmittedEvents() {
    const data = read(CONFIG.storageKeys.submittedEvents);
    if (!Array.isArray(data)) return [];
    // Filter out any malformed entries
    return data.filter(
      (e) => e && typeof e === "object" && e.id && e.title && e.date
    );
  }

  function saveSubmittedEvent(eventObj) {
    if (!isAvailable()) return false;
    const events = getSubmittedEvents();
    events.push(eventObj);
    return write(CONFIG.storageKeys.submittedEvents, events);
  }

  // ----------------------------------------------------------------
  // Saved (Bookmarked) Events
  // ----------------------------------------------------------------

  function getSavedEventIds() {
    const data = read(CONFIG.storageKeys.savedEvents);
    if (!Array.isArray(data)) return [];
    return data.filter((id) => typeof id === "string");
  }

  function isEventSaved(eventId) {
    return getSavedEventIds().includes(eventId);
  }

  function saveEvent(eventId) {
    if (!isAvailable()) return false;
    const ids = getSavedEventIds();
    if (!ids.includes(eventId)) {
      ids.push(eventId);
      return write(CONFIG.storageKeys.savedEvents, ids);
    }
    return true; // Already saved
  }

  function unsaveEvent(eventId) {
    if (!isAvailable()) return false;
    const ids = getSavedEventIds().filter((id) => id !== eventId);
    return write(CONFIG.storageKeys.savedEvents, ids);
  }

  // ----------------------------------------------------------------
  // Registrations
  // ----------------------------------------------------------------

  function getRegistrations() {
    const data = read(CONFIG.storageKeys.registrations);
    if (!Array.isArray(data)) return [];
    return data.filter(
      (r) => r && typeof r === "object" && r.ref && r.eventId
    );
  }

  function isAlreadyRegistered(eventId) {
    return getRegistrations().some((r) => r.eventId === eventId);
  }

  function saveRegistration(registration) {
    if (!isAvailable()) return false;
    const registrations = getRegistrations();
    registrations.push(registration);
    return write(CONFIG.storageKeys.registrations, registrations);
  }

  function getRegistrationForEvent(eventId) {
    return getRegistrations().find((r) => r.eventId === eventId) || null;
  }

  // ----------------------------------------------------------------
  // User Interests (Smart Event Match)
  // ----------------------------------------------------------------

  function getUserInterests() {
    const data = read(CONFIG.storageKeys.userInterests);
    if (!Array.isArray(data)) return [];
    return data.filter((id) => typeof id === "string");
  }

  function saveUserInterests(interestIds) {
    if (!isAvailable()) return false;
    return write(CONFIG.storageKeys.userInterests, interestIds);
  }

  // ----------------------------------------------------------------
  // Reminders
  // ----------------------------------------------------------------

  function getReminders() {
    const data = read(CONFIG.storageKeys.reminders);
    if (!Array.isArray(data)) return [];
    return data.filter((r) => r && typeof r === "object" && r.eventId && r.triggerTime);
  }

  function getReminderForEvent(eventId) {
    return getReminders().find((r) => r.eventId === eventId) || null;
  }

  function saveReminder(reminder) {
    if (!isAvailable()) return false;
    let reminders = getReminders();
    reminders = reminders.filter((r) => r.eventId !== reminder.eventId);
    reminders.push(reminder);
    return write(CONFIG.storageKeys.reminders, reminders);
  }

  function removeReminder(eventId) {
    if (!isAvailable()) return false;
    let reminders = getReminders();
    reminders = reminders.filter((r) => r.eventId !== eventId);
    return write(CONFIG.storageKeys.reminders, reminders);
  }

  // ----------------------------------------------------------------
  // Public API
  // ----------------------------------------------------------------
  return {
    isAvailable,
    getSubmittedEvents,
    saveSubmittedEvent,
    getSavedEventIds,
    isEventSaved,
    saveEvent,
    unsaveEvent,
    getRegistrations,
    isAlreadyRegistered,
    saveRegistration,
    getRegistrationForEvent,
    getUserInterests,
    saveUserInterests,
    getReminders,
    getReminderForEvent,
    saveReminder,
    removeReminder,
  };
})();
