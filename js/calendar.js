// ============================================================
// calendar.js – Monthly calendar view feature
// UNIUYO Campus Event Finder
// ============================================================

const Calendar = (() => {
  let currentYear;
  let currentMonth; // 0-indexed
  let activeCampusFilter = "all";

  const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // ----------------------------------------------------------------
  // Initialization
  // ----------------------------------------------------------------

  function init(yearMonthObj) {
    const now = new Date();
    currentYear = yearMonthObj ? yearMonthObj.year : now.getFullYear();
    currentMonth = yearMonthObj ? yearMonthObj.month : now.getMonth();
    render();
  }

  // ----------------------------------------------------------------
  // Campus filter for calendar
  // ----------------------------------------------------------------
  function setCampusFilter(campus) {
    activeCampusFilter = campus;
    render();
  }

  // ----------------------------------------------------------------
  // Get events for a given YYYY-MM-DD date string
  // ----------------------------------------------------------------
  function getEventsForDate(dateStr) {
    return getAllEvents().filter((e) => {
      if (e.date !== dateStr) return false;
      if (activeCampusFilter !== "all" && e.campus !== activeCampusFilter) return false;
      return true;
    });
  }

  // ----------------------------------------------------------------
  // Get all event dates in the current month (as Set of day numbers)
  // ----------------------------------------------------------------
  function getEventDaysInMonth() {
    const prefix = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`;
    const days = new Set();
    getAllEvents().forEach((e) => {
      if (!e.date) return;
      if (!e.date.startsWith(prefix)) return;
      if (activeCampusFilter !== "all" && e.campus !== activeCampusFilter) return;
      const day = parseInt(e.date.split("-")[2], 10);
      if (!isNaN(day)) days.add(day);
    });
    return days;
  }

  // ----------------------------------------------------------------
  // Render calendar grid
  // ----------------------------------------------------------------
  function render() {
    renderCalendarGrid();
    renderCampusFilter();
  }

  function renderCampusFilter() {
    const filter = document.getElementById("cal-campus-filter");
    if (!filter) return;
    filter.value = activeCampusFilter;
  }

  function renderCalendarGrid() {
    const grid = document.getElementById("calendar-grid");
    const heading = document.getElementById("calendar-heading");
    if (!grid || !heading) return;

    heading.textContent = `${MONTH_NAMES[currentMonth]} ${currentYear}`;

    const eventDays = getEventDaysInMonth();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    grid.innerHTML = "";

    // Day-name header row
    DAY_NAMES.forEach((name) => {
      const cell = document.createElement("div");
      cell.className = "cal-day-name";
      cell.textContent = name;
      grid.appendChild(cell);
    });

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      const empty = document.createElement("div");
      empty.className = "cal-cell cal-empty";
      grid.appendChild(empty);
    }

    // Day cells
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const cell = document.createElement("div");
      cell.className = "cal-cell";
      if (dateStr === todayStr) cell.classList.add("cal-today");
      if (eventDays.has(day)) cell.classList.add("cal-has-events");

      cell.setAttribute("role", "button");
      cell.setAttribute("tabindex", "0");
      cell.setAttribute("aria-label", `${day} ${MONTH_NAMES[currentMonth]} ${currentYear}${eventDays.has(day) ? " – has events" : ""}`);

      const dayNum = document.createElement("span");
      dayNum.className = "cal-day-number";
      dayNum.textContent = day;
      cell.appendChild(dayNum);

      if (eventDays.has(day)) {
        const dot = document.createElement("span");
        dot.className = "cal-event-dot";
        dot.setAttribute("aria-hidden", "true");
        cell.appendChild(dot);
      }

      cell.addEventListener("click", () => selectDate(dateStr));
      cell.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selectDate(dateStr);
        }
      });

      grid.appendChild(cell);
    }
  }

  // ----------------------------------------------------------------
  // Show events for selected date
  // ----------------------------------------------------------------
  function selectDate(dateStr) {
    // Highlight selected
    document.querySelectorAll(".cal-cell.selected").forEach((c) => c.classList.remove("selected"));
    const day = parseInt(dateStr.split("-")[2], 10);
    document.querySelectorAll(".cal-cell").forEach((c) => {
      const num = c.querySelector(".cal-day-number");
      if (num && parseInt(num.textContent, 10) === day && !c.classList.contains("cal-empty")) {
        c.classList.add("selected");
      }
    });

    renderDateEvents(dateStr);
  }

  function renderDateEvents(dateStr) {
    const panel = document.getElementById("cal-date-events");
    if (!panel) return;

    const events = getEventsForDate(dateStr);
    const displayDate = formatDate(dateStr);

    if (events.length === 0) {
      panel.innerHTML = `
        <div class="cal-date-header">${displayDate}</div>
        <div class="empty-state-sm">
          <span>📅</span>
          <p>No events on this date${activeCampusFilter !== "all" ? " for the selected campus" : ""}.</p>
        </div>`;
      return;
    }

    panel.innerHTML = `<div class="cal-date-header">${displayDate}</div>`;
    events.forEach((event) => {
      const item = document.createElement("div");
      item.className = "cal-event-item";
      item.innerHTML = `
        <div class="cal-event-info">
          <span class="cal-event-title">${escapeHTML(event.title)}</span>
          <span class="cal-event-meta">${escapeHTML(event.campus)} · ${formatTime(event.time)} · ${escapeHTML(event.venue)}</span>
          <span class="event-category-badge category-${(event.category || "").toLowerCase().replace(/[^a-z0-9]/g, "-")}">${escapeHTML(event.category)}</span>
        </div>
        <button class="btn btn-outline btn-sm" data-action="view-details" data-id="${event.id}">Details</button>`;
      panel.appendChild(item);
    });
  }

  // ----------------------------------------------------------------
  // Navigation
  // ----------------------------------------------------------------
  function prevMonth() {
    currentMonth--;
    if (currentMonth < 0) { currentMonth = 11; currentYear--; }
    render();
    clearDatePanel();
  }

  function nextMonth() {
    currentMonth++;
    if (currentMonth > 11) { currentMonth = 0; currentYear++; }
    render();
    clearDatePanel();
  }

  function clearDatePanel() {
    const panel = document.getElementById("cal-date-events");
    if (panel) panel.innerHTML = `<p class="cal-prompt">Click a date to see events.</p>`;
  }

  function refreshCalendar() {
    render();
    clearDatePanel();
  }

  // ----------------------------------------------------------------
  // Public API
  // ----------------------------------------------------------------
  return { init, prevMonth, nextMonth, setCampusFilter, refreshCalendar };
})();
