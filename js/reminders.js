// ============================================================
// reminders.js – Event Reminder Feature
// UNIUYO Campus Event Finder
// ============================================================

const Reminders = (() => {
  let reminderCheckInterval = null;

  // ----------------------------------------------------------------
  // Initialize and check pending reminders
  // ----------------------------------------------------------------
  function init() {
    if ("Notification" in window && Notification.permission === "default") {
      // Provide a way to request permission if needed, but don't ask on load
      // The user will be asked when they set their first reminder.
    }
    
    // Check reminders every minute
    if (reminderCheckInterval) clearInterval(reminderCheckInterval);
    reminderCheckInterval = setInterval(checkReminders, 60000);
    // Also check immediately
    checkReminders();
  }

  function checkReminders() {
    const now = new Date().getTime();
    const reminders = Storage.getReminders();
    let updated = false;

    reminders.forEach(reminder => {
      if (!reminder.notified && now >= reminder.triggerTime) {
        // Time to notify
        triggerNotification(reminder);
        reminder.notified = true;
        Storage.saveReminder(reminder); // Update status
        updated = true;
      }
    });

    if (updated) {
      renderMyReminders();
    }
  }

  function triggerNotification(reminder) {
    const event = getAllEvents().find(e => e.id === reminder.eventId);
    if (!event) return;

    const message = `Reminder: "${event.title}" is starting soon at ${event.venue} (${event.campus}).`;
    
    // In-app notification
    showToast(message, "success");

    // Browser notification (if permitted)
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("UNIUYO Event Reminder", {
        body: message,
        icon: "🎓"
      });
    }
  }

  // ----------------------------------------------------------------
  // Open "Set Reminder" Modal
  // ----------------------------------------------------------------
  function openReminderModal(eventId) {
    const event = getAllEvents().find(e => e.id === eventId);
    if (!event) return;

    // Check if event is in the past
    const eventDate = parseEventDateTime(event.date, event.time);
    if (!eventDate || eventDate.getTime() < new Date().getTime()) {
      showToast("Cannot set a reminder for a past event.", "error");
      return;
    }

    document.getElementById("reminder-event-id").value = eventId;
    document.getElementById("reminder-event-title").textContent = event.title;
    
    // Pre-select if existing
    const existing = Storage.getReminderForEvent(eventId);
    const timeSelect = document.getElementById("reminder-time-select");
    if (existing && !existing.notified) {
      timeSelect.value = existing.offsetMinutes.toString();
    } else {
      timeSelect.value = "60"; // Default 1 hour
    }

    closeAllModals();
    openModal("reminder-modal");
  }

  // ----------------------------------------------------------------
  // Save Reminder
  // ----------------------------------------------------------------
  function saveReminder(e) {
    e.preventDefault();
    const eventId = document.getElementById("reminder-event-id").value;
    const offsetMinutes = parseInt(document.getElementById("reminder-time-select").value, 10);
    
    const event = getAllEvents().find(ev => ev.id === eventId);
    if (!event) return;

    const eventDate = parseEventDateTime(event.date, event.time);
    if (!eventDate) return;

    const triggerTime = eventDate.getTime() - (offsetMinutes * 60000);
    
    if (triggerTime < new Date().getTime()) {
      showToast("This reminder time has already passed. Please choose a different time.", "error");
      return;
    }

    Storage.saveReminder({
      eventId,
      offsetMinutes,
      triggerTime,
      notified: false
    });

    closeModal("reminder-modal");
    showToast("Reminder set successfully.", "success");
    
    refreshReminderButtons(eventId);
    
    // Request notification permission if they haven't denied it
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
    
    if (AppState.activeSection === "reminders") {
      renderMyReminders();
    }
  }

  // ----------------------------------------------------------------
  // Remove Reminder
  // ----------------------------------------------------------------
  function removeReminder(eventId) {
    Storage.removeReminder(eventId);
    showToast("Reminder removed.", "success");
    refreshReminderButtons(eventId);
    if (AppState.activeSection === "reminders") {
      renderMyReminders();
    }
  }

  // ----------------------------------------------------------------
  // Render "My Reminders" Section
  // ----------------------------------------------------------------
  function renderMyReminders() {
    const list = document.getElementById("reminders-list");
    if (!list) return;

    const reminders = Storage.getReminders();
    if (reminders.length === 0) {
      list.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon" aria-hidden="true">⏰</div>
          <h3>No Reminders Set</h3>
          <p>You haven't set any event reminders yet.</p>
          <button class="btn btn-primary" onclick="navigateTo('events')">Browse Events</button>
        </div>
      `;
      return;
    }

    let html = '<div class="events-grid">';
    
    reminders.sort((a, b) => a.triggerTime - b.triggerTime).forEach(r => {
      const event = getAllEvents().find(e => e.id === r.eventId);
      if (!event) return;

      const offsetText = r.offsetMinutes === 15 ? "15 minutes" : r.offsetMinutes === 60 ? "1 hour" : "1 day";
      const statusText = r.notified ? '<span style="color:var(--text-muted)">(Notified)</span>' : '';
      
      html += `
        <article class="event-card">
          <div class="event-card-body">
            <h3 class="event-card-title">${escapeHTML(event.title)}</h3>
            <p class="event-card-meta">📅 ${formatDate(event.date)} at ${formatTime(event.time)}</p>
            <p class="event-card-meta">📍 ${escapeHTML(event.campus)}</p>
            <p style="margin-top:0.5rem; font-size:0.9rem; font-weight:600;">
              ⏰ Reminder set for ${offsetText} before ${statusText}
            </p>
          </div>
          <div class="event-card-footer">
            <button class="btn btn-outline btn-sm" data-action="view-details" data-id="${event.id}">View Details</button>
            <button class="btn btn-outline btn-sm" onclick="Reminders.removeReminder('${event.id}')">Remove</button>
          </div>
        </article>
      `;
    });
    
    html += '</div>';
    list.innerHTML = html;
  }

  // ----------------------------------------------------------------
  // Helpers
  // ----------------------------------------------------------------
  function parseEventDateTime(dateStr, timeStr) {
    if (!dateStr || !timeStr) return null;
    const parts = dateStr.split("-");
    const timeParts = timeStr.split(":");
    if (parts.length !== 3 || timeParts.length !== 2) return null;
    
    return new Date(
      parseInt(parts[0], 10),
      parseInt(parts[1], 10) - 1,
      parseInt(parts[2], 10),
      parseInt(timeParts[0], 10),
      parseInt(timeParts[1], 10)
    );
  }

  function refreshReminderButtons(eventId) {
    const existing = Storage.getReminderForEvent(eventId);
    const hasActiveReminder = existing && !existing.notified;
    
    document.querySelectorAll(`[data-reminder-btn="${eventId}"]`).forEach(btn => {
      if (hasActiveReminder) {
        btn.textContent = "Remove Reminder";
        btn.classList.add("btn-saved");
        btn.onclick = (e) => { e.stopPropagation(); removeReminder(eventId); };
      } else {
        btn.textContent = "Set Reminder";
        btn.classList.remove("btn-saved");
        btn.onclick = (e) => { e.stopPropagation(); openReminderModal(eventId); };
      }
    });
  }

  return {
    init,
    openReminderModal,
    saveReminder,
    removeReminder,
    renderMyReminders,
    refreshReminderButtons,
    parseEventDateTime
  };
})();
