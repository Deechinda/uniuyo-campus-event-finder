const PublicViews = (() => {
  const eventPosters = [
    { date: "08", month: "OCT", category: "TECH", title: "Build Beyond the Classroom", tone: "violet" },
    { date: "12", month: "OCT", category: "CULTURE", title: "A Night of Uyo Stories", tone: "coral" },
    { date: "19", month: "OCT", category: "SPORT", title: "Inter-Campus Finals", tone: "lime" },
  ];

  function icon(name) {
    const icons = {
      arrow: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M11 5l5 5-5 5"/></svg>',
      search: '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.5"/><path d="m13 13 4 4"/></svg>',
      moon: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M16 12.8A7 7 0 0 1 7.2 4 7 7 0 1 0 16 12.8Z"/></svg>',
      spark: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="m10 2 1.5 5.5L17 9l-5.5 1.5L10 16l-1.5-5.5L3 9l5.5-1.5L10 2Z"/></svg>',
    };
    return icons[name] || "";
  }

  function header() {
    return `<header class="landing-nav">
      <a class="experience-brand" href="#landing" data-public-route="landing" aria-label="UNIUYO Events home">
        <span class="brand-orbit"><i></i></span><span>UNIUYO<span>events</span></span>
      </a>
      <nav aria-label="Landing navigation">
        <a href="#how-it-works">How it works</a><a href="#for-organizers">For organizers</a><a href="#campuses">Campuses</a>
      </nav>
      <div class="landing-nav-actions">
        <button class="round-control" data-theme-toggle aria-label="Toggle color theme">${icon("moon")}</button>
        <button class="text-action" data-public-route="signin">Sign in</button>
        <button class="experience-button compact" data-public-route="signup">Get started ${icon("arrow")}</button>
      </div>
      <button class="landing-menu" data-landing-menu aria-label="Open menu"><span></span><span></span></button>
    </header>`;
  }

  function posterCard(poster, index) {
    return `<article class="floating-poster poster-${index + 1} tone-${poster.tone}" data-parallax="${(index + 1) * 6}">
      <div class="poster-top"><span>${poster.category}</span><span>0${index + 1}</span></div>
      <div class="poster-symbol" aria-hidden="true"><i></i><i></i><i></i></div>
      <div class="poster-copy"><div class="poster-date"><strong>${poster.date}</strong><span>${poster.month}</span></div><h3>${poster.title}</h3></div>
      <div class="poster-foot"><span>University of Uyo</span><span>View event ↗</span></div>
    </article>`;
  }

  function landing() {
    return `<div class="experience-shell">
      ${header()}
      <main>
        <section class="landing-hero">
          <div class="hero-aurora" aria-hidden="true"></div>
          <div class="landing-hero-copy reveal-now">
            <div class="live-label"><span></span> Events moving across campus now</div>
            <h1>Campus life,<br><em>turned all the way up.</em></h1>
            <p>Find the workshops, shows, games and conversations worth leaving your room for—across every UNIUYO campus.</p>
            <div class="landing-hero-actions">
              <button class="experience-button" data-public-route="signup">Explore the campus ${icon("arrow")}</button>
              <button class="outline-experience-button" data-public-route="signin">I already have an account</button>
            </div>
            <div class="hero-proof"><span><strong>3</strong> campuses</span><span><strong>12+</strong> event categories</span><span><strong>1</strong> shared pulse</span></div>
          </div>
          <div class="poster-stage" aria-label="Featured event previews">
            <div class="stage-caption">LIVE EVENT BOARD <span>●</span></div>
            ${eventPosters.map(posterCard).join("")}
            <div class="stage-sticker">Made for<br><strong>students</strong></div>
          </div>
          <div class="hero-scroll-cue"><span></span> Scroll to discover</div>
        </section>

        <section class="landing-ticker" aria-label="Event categories"><div>ACADEMIC <i>✦</i> CULTURE <i>✦</i> TECHNOLOGY <i>✦</i> SPORTS <i>✦</i> CAREERS <i>✦</i> COMMUNITY <i>✦</i> ACADEMIC <i>✦</i> CULTURE</div></section>

        <section class="landing-section discovery-story" id="how-it-works" data-reveal>
          <div class="section-index">01 / DISCOVER</div>
          <div class="story-heading"><p>Your campus should never feel quiet.</p><h2>Everything happening.<br><span>Nothing buried.</span></h2></div>
          <div class="discovery-grid">
            <article class="discovery-feature tone-coral"><div class="mock-date"><strong>24</strong><span>FRI</span></div><p>Permanent Site · 4:00 PM</p><h3>Creative Arts<br>After Hours</h3><span class="mock-pill">Arts & Culture</span></article>
            <div class="discovery-copy"><p>Search less. Show up more.</p><h3>One living board for all three campuses.</h3><ul><li><span>01</span> Filter by campus, category or date</li><li><span>02</span> Save what catches your eye</li><li><span>03</span> Get a ticket in a few taps</li></ul></div>
          </div>
        </section>

        <section class="landing-section campus-band" id="campuses" data-reveal>
          <div><span class="section-index">02 / EVERYWHERE</span><h2>Three campuses.<br>One shared rhythm.</h2></div>
          <div class="campus-list"><article><b>01</b><h3>Permanent Site</h3><span>Engineering · Science · Sport</span></article><article><b>02</b><h3>Town Campus</h3><span>Law · Business · Community</span></article><article><b>03</b><h3>Annex</h3><span>Arts · Culture · Creativity</span></article></div>
        </section>

        <section class="landing-section organizer-story" id="for-organizers" data-reveal>
          <div class="organizer-art"><div class="ticket-shape"><span>HOST PASS</span><strong>MAKE<br>IT<br>HAPPEN.</strong><small>UNIUYO / 2026</small></div></div>
          <div class="organizer-copy"><span class="section-index">03 / CREATE</span><h2>Your idea deserves a crowd.</h2><p>Publish an event, share one memorable link, accept registrations and send guests a digital ticket—all from a simple organizer workspace.</p><button class="experience-button" data-public-route="signup">Create your first event ${icon("arrow")}</button></div>
        </section>

        <section class="landing-cta" data-reveal><span>${icon("spark")}</span><h2>What will you<br>show up for?</h2><p>Your next campus memory is already being planned.</p><button class="experience-button light" data-public-route="signup">Enter the event finder ${icon("arrow")}</button></section>
      </main>
      <footer class="landing-footer"><div class="experience-brand"><span class="brand-orbit"><i></i></span><span>UNIUYO<span>events</span></span></div><p>Student academic project · University of Uyo</p><button data-theme-toggle>Switch theme</button></footer>
    </div>`;
  }

  function authentication(kind) {
    const signup = kind === "signup";
    const forgot = kind === "forgot";
    const reset = kind === "reset-password";
    const title = signup ? "Join the campus pulse." : forgot ? "Reset your password." : reset ? "Choose a new password." : "Welcome back.";
    const subtitle = signup ? "One account for events, tickets and organizing." : forgot ? "We’ll send a secure reset link to your email." : reset ? "Use at least eight characters." : "Your saved events are waiting.";
    return `<div class="auth-experience">
      <section class="auth-art" aria-label="Campus event artwork">
        <a class="experience-brand light-brand" href="#landing" data-public-route="landing"><span class="brand-orbit"><i></i></span><span>UNIUYO<span>events</span></span></a>
        <div class="auth-art-copy"><span>TONIGHT / TOWN CAMPUS</span><h2>Come for<br>the event.<br><em>Stay for the story.</em></h2></div>
        <div class="auth-art-orbit" aria-hidden="true"><i></i><i></i><i></i></div>
        <p class="auth-art-note">Discover what your campus feels like after lectures.</p>
      </section>
      <main class="auth-form-side">
        <div class="auth-top"><button class="back-button" data-public-route="landing">← Back home</button><button class="round-control" data-theme-toggle aria-label="Toggle color theme">${icon("moon")}</button></div>
        <div class="auth-form-wrap">
          <p class="auth-eyebrow">${signup ? "CREATE ACCOUNT" : forgot || reset ? "ACCOUNT RECOVERY" : "SIGN IN"}</p>
          <h1>${title}</h1><p class="auth-subtitle">${subtitle}</p>
          <form id="${signup ? "signup" : forgot ? "forgot" : reset ? "reset" : "signin"}-form" class="experience-form" novalidate>
            ${signup ? '<label>Full name<input name="fullName" autocomplete="name" required placeholder="Your full name"><span data-error="fullName"></span></label>' : ""}
            ${reset ? "" : '<label>Email address<input type="email" name="email" autocomplete="email" required placeholder="you@example.com"><span data-error="email"></span></label>'}
            ${forgot ? "" : `<label>${reset ? "New password" : "Password"}<input type="password" name="password" minlength="8" autocomplete="${signup || reset ? "new-password" : "current-password"}" required placeholder="At least 8 characters"><span data-error="password"></span></label>`}
            ${signup || reset ? '<label>Confirm password<input type="password" name="confirm" minlength="8" autocomplete="new-password" required placeholder="Repeat your password"><span data-error="confirm"></span></label>' : ""}
            ${!signup && !forgot && !reset ? '<button type="button" class="forgot-link" data-public-route="forgot">Forgot password?</button>' : ""}
            <button class="experience-button auth-submit" type="submit">${signup ? "Create my account" : forgot ? "Send reset link" : reset ? "Update password" : "Sign in"} ${icon("arrow")}</button>
            <div class="auth-status" id="auth-status" role="status"></div>
          </form>
          <p class="auth-switch">${signup ? 'Already have an account? <button data-public-route="signin">Sign in</button>' : forgot || reset ? '<button data-public-route="signin">Return to sign in</button>' : 'New to UNIUYO Events? <button data-public-route="signup">Create an account</button>'}</p>
        </div>
      </main>
    </div>`;
  }

  return { landing, authentication };
})();
