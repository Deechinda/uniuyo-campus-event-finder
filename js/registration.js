// ============================================================
// registration.js – Event registration and Digital Event Pass
// UNIUYO Campus Event Finder
// ============================================================
// Sample events keep local demonstration passes. Published community events
// use Supabase registrations and server-verified Paystack payments.

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
    if (eventDisplay) eventDisplay.textContent = `${event.title}${event.organizerId ? (event.price > 0 ? ` · ₦${event.price.toLocaleString()} per ticket` : " · Free") : ""}`;
    if (eventIdInput) eventIdInput.value = eventId;

    // Check if already registered
    if (!event.organizerId && Storage.isAlreadyRegistered(eventId)) {
      const existing = Storage.getRegistrationForEvent(eventId);
      if (existing) {
        showPassDirectly(existing, event);
        return;
      }
    }

    // Clear form
    const form = document.getElementById("registration-form");
    if (form) form.reset();
    const quantity = document.getElementById("reg-quantity"); if (quantity) quantity.value = "1";
    if (eventIdInput) eventIdInput.value = eventId;
    if (eventDisplay) eventDisplay.textContent = `${event.title}${event.organizerId ? (event.price > 0 ? ` · ₦${event.price.toLocaleString()} per ticket` : " · Free") : ""}`;
    const submitButton=document.getElementById("registration-submit");if(submitButton)submitButton.textContent=event.organizerId?(event.price>0?`Pay ₦${event.price.toLocaleString()}`:"Get free ticket"):"Register & Get Pass";

    // Hide pass, show form
    togglePassView(false);
    clearFormErrors("registration-form");

    // Open modal
    openModal("registration-modal");
  }

  // ----------------------------------------------------------------
  // Handle form submission
  // ----------------------------------------------------------------
  async function handleSubmit(e) {
    e.preventDefault();
    clearFormErrors("registration-form");

    const form = e.target;
    const name = form.querySelector("#reg-name").value.trim();
    const email = form.querySelector("#reg-email").value.trim();
    const eventId = form.querySelector("#reg-event-id").value;
    const phone = form.querySelector("#reg-phone")?.value.trim() || "";
    const quantity = Number(form.querySelector("#reg-quantity")?.value || 1);

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

    const event = getAllEvents().find((ev) => ev.id === eventId);
    if (!event) { showFieldError("reg-email", "Event not found. Please close and try again."); return; }
    if(event.organizerId){
      if(!phone){showFieldError("reg-phone","Enter your phone number.");return;}
      if(!Number.isInteger(quantity)||quantity<1||quantity>10){showFieldError("reg-quantity","Choose 1 to 10 tickets.");return;}
      const button=document.getElementById("registration-submit");button.disabled=true;button.textContent=event.price>0?"Opening secure payment…":"Creating ticket…";
      try{
        if(event.price>0){
          const callbackUrl=`${location.origin}${location.pathname}?payment=callback`;
          const result=await DataService.invokePayment({action:"initialize",eventId,name,email,phone,quantity,callbackUrl});
          sessionStorage.setItem("uniuyo_pending_booking",JSON.stringify({eventId,email}));location.assign(result.authorizationUrl);return;
        }
        const ticket=await DataService.issueFreeTicket({eventId,name,email,phone,quantity});showServerTicket(ticket,event,email);showToast("Your ticket is ready.","success");
      }catch(error){showToast(error.message||"Registration failed.","error");}
      finally{button.disabled=false;button.textContent=event.price>0?`Pay ₦${(event.price*quantity).toLocaleString()}`:"Get free ticket";}
      return;
    }

    // Duplicate check
    if (Storage.isAlreadyRegistered(eventId)) {
      const existing = Storage.getRegistrationForEvent(eventId);
      const event = getAllEvents().find((ev) => ev.id === eventId);
      if (existing && event) {
        showPassDirectly(existing, event);
        return;
      }
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
        <div class="pass-detail"><span class="pass-label">TICKETS</span><span class="pass-value">${escapeHTML(registration.quantity || 1)}</span></div>
      </div>

      <div class="pass-divider"></div>

      <div class="pass-notice">
        ${event.organizerId ? '<strong>Community Event Ticket:</strong> Keep this reference safe and present it to the event organizer.' : '<strong>⚠ Prototype Notice:</strong> This is a demonstration pass for a fictional sample event.'}
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
    closeAllModals(); navigateTo("events");
    currentEventId = null;
  }

  function showServerTicket(ticket,event,email="") { showEventPass({ref:ticket.ticketCode,name:ticket.name,email,quantity:ticket.quantity},event);openModal("registration-modal"); }

  // ----------------------------------------------------------------
  // Public API
  // ----------------------------------------------------------------
  return { openForEvent, handleSubmit, printPass, registerAnother, showServerTicket };
})();
