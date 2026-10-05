const ExperienceShell = (() => {
  let currentSession = null;
  const publicRoot = () => document.getElementById("public-root");
  const privateRoot = () => document.getElementById("private-root");

  function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("uniuyo_theme", theme);
    const color = theme === "dark" ? "#0a0911" : "#f4f1e9";
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", color);
  }

  function toggleTheme() {
    setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
  }

  function route() {
    return location.hash.replace(/^#/, "") || "landing";
  }

  function renderPublic(name = route()) {
    privateRoot().hidden = true;
    publicRoot().hidden = false;
    const authRoutes = ["signin", "signup", "forgot", "reset-password"];
    publicRoot().innerHTML = authRoutes.includes(name) ? PublicViews.authentication(name) : PublicViews.landing();
    document.body.classList.toggle("auth-page-active", authRoutes.includes(name));
    window.scrollTo({ top: 0, behavior: "auto" });
    if (!authRoutes.includes(name)) initLandingMotion();
  }

  function enterApp() {
    publicRoot().hidden = true;
    privateRoot().hidden = false;
    document.body.classList.remove("auth-page-active");
    const userName = currentSession?.user?.user_metadata?.full_name || currentSession?.user?.email?.split("@")[0] || "Student";
    document.querySelectorAll("[data-account-name]").forEach((node) => { node.textContent = userName; });
    navigateTo("home");
    history.replaceState(null, "", `${location.pathname}#home`);
  }

  function navigatePublic(name) {
    location.hash = name;
    renderPublic(name);
  }

  function normalizeError(error) {
    const message = String(error?.message || "Something went wrong. Please try again.");
    if (/already registered|already exists|user exists/i.test(message)) return "An account may already exist with this email. Sign in or reset your password.";
    if (/invalid login/i.test(message)) return "The email or password is incorrect.";
    if (/email.*rate/i.test(message)) return "Please wait a moment before requesting another email.";
    return message;
  }

  function validate(form) {
    const values = Object.fromEntries(new FormData(form));
    form.querySelectorAll("[data-error]").forEach((node) => { node.textContent = ""; });
    let valid = true;
    const fail = (field, message) => { const node = form.querySelector(`[data-error="${field}"]`); if (node) node.textContent = message; valid = false; };
    if ("fullName" in values && values.fullName.trim().length < 2) fail("fullName", "Enter your full name.");
    if ("email" in values && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) fail("email", "Enter a valid email address.");
    if ("password" in values && values.password.length < 8) fail("password", "Use at least 8 characters.");
    if ("confirm" in values && values.password !== values.confirm) fail("confirm", "Passwords do not match.");
    return { valid, values };
  }

  async function handleAuth(form) {
    const status = document.getElementById("auth-status");
    const button = form.querySelector('[type="submit"]');
    const { valid, values } = validate(form);
    if (!valid) return;
    if (!SupabaseConfig.configured) { status.textContent = "Authentication is not configured."; return; }
    button.disabled = true;
    const original = button.innerHTML;
    button.textContent = "Please wait…";
    status.textContent = "";
    try {
      if (form.id === "signup-form") {
        const result = await Auth.signUp(values);
        if (result.error) throw result.error;
        if (result.data.user && Array.isArray(result.data.user.identities) && result.data.user.identities.length === 0) {
          throw new Error("An account may already exist with this email. Sign in or reset your password.");
        }
        if (!result.data.session) {
          form.innerHTML = '<div class="auth-success-mark">✓</div><h2>Check your inbox.</h2><p>Confirm your email address, then return here to sign in.</p><button class="experience-button" type="button" data-public-route="signin">Go to sign in →</button>';
          return;
        }
        currentSession = result.data.session;
        enterApp();
      } else if (form.id === "signin-form") {
        const result = await Auth.signIn(values.email, values.password);
        if (result.error) throw result.error;
        currentSession = result.data.session;
        enterApp();
      } else if (form.id === "forgot-form") {
        const result = await Auth.reset(values.email);
        if (result.error) throw result.error;
        form.innerHTML = '<div class="auth-success-mark">✓</div><h2>Reset link sent.</h2><p>If an account uses that email, password-reset instructions are on the way.</p><button class="experience-button" type="button" data-public-route="signin">Return to sign in →</button>';
      } else if (form.id === "reset-form") {
        const result = await Auth.updatePassword(values.password);
        if (result.error) throw result.error;
        status.textContent = "Password updated. You can now continue.";
        setTimeout(() => navigatePublic("signin"), 900);
      }
    } catch (error) {
      status.textContent = normalizeError(error);
    } finally {
      if (button.isConnected) { button.disabled = false; button.innerHTML = original; }
    }
  }

  function initLandingMotion() {
    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const reveals = document.querySelectorAll("[data-reveal]");
    if (reduceMotion) reveals.forEach((item) => item.classList.add("is-visible"));
    else {
      const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); }
      }), { threshold: .14 });
      reveals.forEach((item) => observer.observe(item));
    }
    const stage = document.querySelector(".poster-stage");
    if (stage && !reduceMotion && matchMedia("(pointer:fine)").matches) {
      stage.addEventListener("pointermove", (event) => {
        const rect = stage.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - .5;
        const y = (event.clientY - rect.top) / rect.height - .5;
        stage.querySelectorAll("[data-parallax]").forEach((card) => {
          const amount = Number(card.dataset.parallax);
          card.style.setProperty("--mx", `${x * amount}px`);
          card.style.setProperty("--my", `${y * amount}px`);
        });
      });
    }
  }

  async function init() {
    setTheme(document.documentElement.dataset.theme || "light");
    try { currentSession = await Auth.session(); } catch (error) { console.warn("Session unavailable", error); }
    const publicEvent = new URLSearchParams(location.search).has("event");
    if (currentSession && !publicEvent && !["signin", "signup", "forgot", "landing"].includes(route())) enterApp();
    else renderPublic(route());

    document.addEventListener("click", async (event) => {
      const routeButton = event.target.closest("[data-public-route]");
      if (routeButton) { event.preventDefault(); navigatePublic(routeButton.dataset.publicRoute); }
      if (event.target.closest("[data-theme-toggle]")) toggleTheme();
      const menu = event.target.closest("[data-landing-menu]");
      if (menu) document.querySelector(".landing-nav")?.classList.toggle("menu-open");
      const signOut = event.target.closest("[data-sign-out]");
      if (signOut) { await Auth.signOut(); currentSession = null; navigatePublic("landing"); }
    });
    document.addEventListener("submit", (event) => {
      if (event.target.matches("#signup-form,#signin-form,#forgot-form,#reset-form")) { event.preventDefault(); handleAuth(event.target); }
    });
    window.addEventListener("hashchange", () => {
      const name = route();
      if (!currentSession || ["landing", "signin", "signup", "forgot", "reset-password"].includes(name)) renderPublic(name);
    });
    Auth.onChange((_event, session) => { currentSession = session; });
  }

  return { init, session: () => currentSession, enterApp, renderPublic, toggleTheme };
})();

document.addEventListener("DOMContentLoaded", ExperienceShell.init);
