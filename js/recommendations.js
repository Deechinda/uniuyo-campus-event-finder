// ============================================================
// recommendations.js – Smart Event Match feature
// UNIUYO Campus Event Finder
// ============================================================
// NOTE: Recommendations are rule-based demonstrations.
// They are NOT powered by AI or machine learning.
// Events are matched by comparing selected interest keywords
// with event titles, descriptions, categories, and tags.

const Recommendations = (() => {
  let selectedInterests = [];

  // ----------------------------------------------------------------
  // Core matching logic
  // ----------------------------------------------------------------

  /**
   * Scores an event against a set of interest IDs.
   * Returns { score, matchedInterests } where score > 0 indicates a match.
   */
  function scoreEvent(event, interestIds) {
    if (!interestIds || interestIds.length === 0) return { score: 0, matchedInterests: [] };

    const searchable = [
      event.title || "",
      event.category || "",
      event.shortDescription || "",
      event.fullDescription || "",
      ...(event.tags || []),
    ]
      .join(" ")
      .toLowerCase();

    let score = 0;
    const matchedInterests = [];

    interestIds.forEach((interestId) => {
      const interest = CONFIG.interests.find((i) => i.id === interestId);
      if (!interest) return;

      const matched = interest.keywords.some((kw) => searchable.includes(kw));
      if (matched) {
        score++;
        matchedInterests.push(interest.label);
      }
    });

    return { score, matchedInterests };
  }

  /**
   * Returns events sorted by relevance score for the given interest IDs.
   * Only events with score > 0 are included.
   */
  function getRecommendedEvents(interestIds) {
    const allEvents = getAllEvents();
    const scored = allEvents
      .map((event) => {
        const { score, matchedInterests } = scoreEvent(event, interestIds);
        return { event, score, matchedInterests };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score);

    return scored;
  }

  // ----------------------------------------------------------------
  // Render interest selector
  // ----------------------------------------------------------------

  function renderInterestSelector(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    selectedInterests = Storage.getUserInterests();

    container.innerHTML = "";
    CONFIG.interests.forEach((interest) => {
      const isSelected = selectedInterests.includes(interest.id);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `interest-btn${isSelected ? " selected" : ""}`;
      btn.dataset.interestId = interest.id;
      btn.setAttribute("aria-pressed", isSelected ? "true" : "false");
      btn.textContent = interest.label;

      btn.addEventListener("click", () => {
        toggleInterest(interest.id, btn);
      });

      container.appendChild(btn);
    });
  }

  function toggleInterest(interestId, btn) {
    const idx = selectedInterests.indexOf(interestId);
    if (idx === -1) {
      selectedInterests.push(interestId);
      btn.classList.add("selected");
      btn.setAttribute("aria-pressed", "true");
    } else {
      selectedInterests.splice(idx, 1);
      btn.classList.remove("selected");
      btn.setAttribute("aria-pressed", "false");
    }
    Storage.saveUserInterests(selectedInterests);
  }

  // ----------------------------------------------------------------
  // Render recommended events
  // ----------------------------------------------------------------

  function renderRecommendations(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (selectedInterests.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">💡</div>
          <h3>Select your interests above</h3>
          <p>Choose topics that interest you and we'll suggest matching events from across all campuses.</p>
        </div>`;
      return;
    }

    const results = getRecommendedEvents(selectedInterests);

    if (results.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🔍</div>
          <h3>No matching events found</h3>
          <p>No current events match your selected interests. Try selecting different interests or check back when new events are added.</p>
        </div>`;
      return;
    }

    container.innerHTML = "";
    results.forEach(({ event, matchedInterests }) => {
      const card = createRecommendationCard(event, matchedInterests);
      container.appendChild(card);
    });
  }

  function createRecommendationCard(event, matchedInterests) {
    const card = document.createElement("div");
    card.className = "rec-card";

    const countdown = getCountdown(event.date);
    const isSaved = Storage.isEventSaved(event.id);
    const reasonText =
      matchedInterests.length > 0
        ? `Recommended because you selected: <strong>${matchedInterests.join(", ")}</strong>`
        : "Matches your interests";

    card.innerHTML = `
      <div class="rec-card-header">
        <span class="event-category-badge category-${(event.category || "").toLowerCase().replace(/[^a-z0-9]/g, "-")}">${escapeHTML(event.category)}</span>
        <span class="event-campus-badge">${escapeHTML(event.campus)}</span>
      </div>
      <h4 class="rec-card-title">${escapeHTML(event.title)}</h4>
      <p class="rec-card-meta">
        <span>📅 ${formatDate(event.date)}</span>
        <span>🕐 ${formatTime(event.time)}</span>
      </p>
      <p class="rec-card-meta"><span>📍 ${escapeHTML(event.venue)}</span></p>
      <p class="rec-reason">${reasonText}</p>
      ${countdown ? `<p class="countdown-badge countdown-${countdown.type}">${escapeHTML(countdown.text)}</p>` : ""}
      <div class="rec-card-actions">
        <button class="btn btn-outline btn-sm" data-action="view-details" data-id="${event.id}">View Details</button>
        <button class="btn ${isSaved ? "btn-saved" : "btn-save"} btn-sm" data-action="${isSaved ? "unsave" : "save"}" data-id="${event.id}">
          ${isSaved ? "✓ Saved" : "♡ Save"}
        </button>
      </div>`;

    return card;
  }

  // ----------------------------------------------------------------
  // Public API
  // ----------------------------------------------------------------
  return {
    renderInterestSelector,
    renderRecommendations,
    getSelectedInterests: () => selectedInterests,
    refresh: (containerId) => renderRecommendations(containerId),
  };
})();
