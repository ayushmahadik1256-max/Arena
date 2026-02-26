/* ======================================================
   SURVIVAL ARENA - Complete JavaScript
   ====================================================== */

document.addEventListener("DOMContentLoaded", () => {
  /* ======================
     SCROLL REVEAL
     ====================== */
  const revealElements = document.querySelectorAll(".reveal, .reveal-left, .reveal-right");
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    { threshold: 0.1, rootMargin: "-60px" }
  );
  revealElements.forEach((el) => revealObserver.observe(el));

  /* ======================
     NAVBAR
     ====================== */
  const navbar = document.querySelector(".navbar");
  const hamburger = document.querySelector(".hamburger");
  const mobileMenu = document.querySelector(".mobile-menu");
  const mobileOverlay = document.querySelector(".mobile-menu-overlay");
  const navLinksAll = document.querySelectorAll(".nav-links a, .mobile-menu a");

  // Scroll effect
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
    updateActiveSection();
  }, { passive: true });

  // Hamburger toggle
  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("open");
    mobileMenu.classList.toggle("show");
    mobileOverlay.classList.toggle("show");
  });

  mobileOverlay.addEventListener("click", () => {
    hamburger.classList.remove("open");
    mobileMenu.classList.remove("show");
    mobileOverlay.classList.remove("show");
  });

  // Smooth scroll for nav links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        // Close mobile menu
        hamburger.classList.remove("open");
        mobileMenu.classList.remove("show");
        mobileOverlay.classList.remove("show");
      }
    });
  });

  // Active section tracking
  function updateActiveSection() {
    const sections = ["hero", "games", "register", "leaderboard", "arena"];
    let current = "hero";
    for (let i = sections.length - 1; i >= 0; i--) {
      const el = document.getElementById(sections[i]);
      if (el && el.getBoundingClientRect().top <= 120) {
        current = sections[i];
        break;
      }
    }
    navLinksAll.forEach((link) => {
      const href = link.getAttribute("href");
      if (href === "#" + current) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  }

  /* ======================
     GAME CARDS - 3D TILT
     ====================== */
  document.querySelectorAll(".game-card").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const rotateX = (y - 0.5) * -16;
      const rotateY = (x - 0.5) * 16;
      card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale(1.02)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });

  /* ======================
     REGISTRATION FORM
     ====================== */
  const form = document.getElementById("register-form");
  const formContainer = document.getElementById("form-container");
  const successContainer = document.getElementById("form-success-container");

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      clearErrors();
      const name = document.getElementById("reg-name").value.trim();
      const email = document.getElementById("reg-email").value.trim();
      const age = document.getElementById("reg-age").value.trim();
      const game = document.getElementById("reg-game").value;

      let hasError = false;

      if (!name || name.length < 2) {
        showError("reg-name", name ? "Name must be at least 2 characters" : "Name is required");
        hasError = true;
      }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showError("reg-email", email ? "Enter a valid email address" : "Email is required");
        hasError = true;
      }
      if (!age || parseInt(age) < 16 || parseInt(age) > 99) {
        showError("reg-age", age ? "Age must be between 16 and 99" : "Age is required");
        hasError = true;
      }
      if (!game) {
        showError("reg-game", "Select a challenge");
        hasError = true;
      }

      if (hasError) return;

      // Show submitting state
      const submitBtn = form.querySelector(".btn-submit");
      submitBtn.classList.add("submitting");

      setTimeout(() => {
        submitBtn.classList.remove("submitting");
        formContainer.style.display = "none";
        successContainer.style.display = "flex";

        // Fill success message
        const selectedGame = document.getElementById("reg-game");
        const gameName = selectedGame.options[selectedGame.selectedIndex].text;
        document.getElementById("success-player-name").textContent = name;
        document.getElementById("success-game-name").textContent = gameName;
      }, 1500);
    });
  }

  // Reset form
  const resetBtn = document.getElementById("reset-form-btn");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      form.reset();
      formContainer.style.display = "flex";
      successContainer.style.display = "none";
    });
  }

  function showError(fieldId, message) {
    const field = document.getElementById(fieldId).closest(".form-field");
    field.classList.add("error", "shake");
    setTimeout(() => field.classList.remove("shake"), 500);
    const errorEl = field.querySelector(".field-error");
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.display = "flex";
    }
  }

  function clearErrors() {
    document.querySelectorAll(".form-field").forEach((field) => {
      field.classList.remove("error");
      const errorEl = field.querySelector(".field-error");
      if (errorEl) errorEl.style.display = "none";
    });
  }

  /* ======================
     LEADERBOARD TABS
     ====================== */
  const leaderboardData = {
    today: [
      { rank: 1, name: "Phoenix Blaze", initials: "PB", score: 9850, game: "Laser Dodge", trend: "up" },
      { rank: 2, name: "Shadow Viper", initials: "SV", score: 9420, game: "The Maze Escape", trend: "up" },
      { rank: 3, name: "Neon Storm", initials: "NS", score: 8990, game: "Memory Grid", trend: "same" },
      { rank: 4, name: "Iron Pulse", initials: "IP", score: 8710, game: "Last Step Standing", trend: "down" },
      { rank: 5, name: "Cyber Hawk", initials: "CH", score: 8340, game: "Laser Dodge", trend: "up" },
      { rank: 6, name: "Frost Byte", initials: "FB", score: 7980, game: "The Maze Escape", trend: "down" },
      { rank: 7, name: "Blitz Runner", initials: "BR", score: 7650, game: "Memory Grid", trend: "same" },
      { rank: 8, name: "Volt Strike", initials: "VS", score: 7200, game: "Last Step Standing", trend: "up" },
    ],
    weekly: [
      { rank: 1, name: "Shadow Viper", initials: "SV", score: 48200, game: "The Maze Escape", trend: "up" },
      { rank: 2, name: "Phoenix Blaze", initials: "PB", score: 46800, game: "Laser Dodge", trend: "down" },
      { rank: 3, name: "Iron Pulse", initials: "IP", score: 44100, game: "Last Step Standing", trend: "up" },
      { rank: 4, name: "Neon Storm", initials: "NS", score: 41500, game: "Memory Grid", trend: "same" },
      { rank: 5, name: "Frost Byte", initials: "FB", score: 39800, game: "The Maze Escape", trend: "up" },
      { rank: 6, name: "Blitz Runner", initials: "BR", score: 37200, game: "Memory Grid", trend: "down" },
      { rank: 7, name: "Cyber Hawk", initials: "CH", score: 35100, game: "Laser Dodge", trend: "up" },
      { rank: 8, name: "Volt Strike", initials: "VS", score: 33400, game: "Last Step Standing", trend: "same" },
    ],
    "all-time": [
      { rank: 1, name: "Phoenix Blaze", initials: "PB", score: 284500, game: "Laser Dodge", trend: "same" },
      { rank: 2, name: "Shadow Viper", initials: "SV", score: 271200, game: "The Maze Escape", trend: "up" },
      { rank: 3, name: "Neon Storm", initials: "NS", score: 258900, game: "Memory Grid", trend: "same" },
      { rank: 4, name: "Iron Pulse", initials: "IP", score: 245600, game: "Last Step Standing", trend: "down" },
      { rank: 5, name: "Frost Byte", initials: "FB", score: 232100, game: "The Maze Escape", trend: "up" },
      { rank: 6, name: "Cyber Hawk", initials: "CH", score: 218700, game: "Laser Dodge", trend: "same" },
      { rank: 7, name: "Blitz Runner", initials: "BR", score: 205400, game: "Memory Grid", trend: "up" },
      { rank: 8, name: "Volt Strike", initials: "VS", score: 192300, game: "Last Step Standing", trend: "down" },
    ],
  };

  const tabBtns = document.querySelectorAll(".tab-btn");
  const lbBody = document.getElementById("leaderboard-body");

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      renderLeaderboard(btn.dataset.tab);
    });
  });

  function renderLeaderboard(tab) {
    const data = leaderboardData[tab];
    if (!lbBody || !data) return;
    lbBody.innerHTML = "";

    data.forEach((player, i) => {
      const row = document.createElement("div");
      row.className = `lb-row ${player.rank === 1 ? "rank-1" : player.rank <= 3 ? "rank-top" : ""}`;
      row.style.animationDelay = `${i * 0.04}s`;

      const rankBadgeClass = player.rank <= 3 ? `rank-${player.rank}` : "rank-other";
      const rankIcon = player.rank === 1
        ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7z"/><path d="M4 22h16"/></svg>${player.rank === 1 ? '<span class="glow-ring"></span>' : ''}`
        : player.rank === 2
          ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15"/><path d="M11 12 5.12 2.2"/><path d="m13 12 5.88-9.8"/><path d="M8 7h8"/><circle cx="12" cy="17" r="5"/><path d="M12 18v-2h-.5"/></svg>`
          : player.rank === 3
            ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>`
            : player.rank;

      const trendHtml = player.trend === "up"
        ? `<span class="trend-up"><svg class="trend-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg></span>`
        : player.trend === "down"
          ? `<span class="trend-down"><svg class="trend-icon down" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg></span>`
          : `<span class="trend-same"><svg class="trend-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></span>`;

      row.innerHTML = `
        <div class="lb-col-rank">
          <div class="rank-badge ${rankBadgeClass}">
            ${rankIcon}
          </div>
        </div>
        <div class="lb-col-player">
          <div class="lb-player-info">
            <div class="lb-avatar ${player.rank === 1 ? 'rank-1' : 'default'}">${player.initials}</div>
            <div>
              <div class="lb-player-name ${player.rank === 1 ? 'rank-1' : ''}">${player.name}</div>
              <div class="lb-player-game lb-col-game-mobile">${player.game}</div>
            </div>
          </div>
        </div>
        <div class="lb-col-game">
          <span class="lb-player-game">${player.game}</span>
        </div>
        <div class="lb-col-score">
          <div class="lb-score-wrap">
            <span class="lb-score">${player.score.toLocaleString()}</span>
            ${trendHtml}
          </div>
        </div>
      `;
      lbBody.appendChild(row);
    });

    // Animate scores counting up
    animateScores();
  }

  function animateScores() {
    document.querySelectorAll(".lb-score").forEach((el) => {
      const target = parseInt(el.textContent.replace(/,/g, ""));
      const duration = 1200;
      const start = performance.now();
      function step(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(target * eased).toLocaleString();
        if (progress < 1) requestAnimationFrame(step);
      }
      el.textContent = "0";
      requestAnimationFrame(step);
    });
  }

  // Initial render
  renderLeaderboard("today");

  /* ======================
     PLAYER ARENA
     ====================== */
  let arenaPlayers = [
    { id: "p1", name: "Phoenix Blaze", initials: "PB", health: 92, maxHealth: 100, shield: 60, energy: 85, status: "alive", rank: 1, prevRank: 2, kills: 7, accentColor: "neon-pink", glowClass: "neon-border-pink" },
    { id: "p2", name: "Shadow Viper", initials: "SV", health: 74, maxHealth: 100, shield: 30, energy: 90, status: "alive", rank: 2, prevRank: 1, kills: 5, accentColor: "neon-cyan", glowClass: "neon-border-cyan" },
    { id: "p3", name: "Neon Storm", initials: "NS", health: 58, maxHealth: 100, shield: 45, energy: 62, status: "alive", rank: 3, prevRank: 3, kills: 4, accentColor: "neon-lime", glowClass: "neon-border-lime" },
    { id: "p4", name: "Iron Pulse", initials: "IP", health: 35, maxHealth: 100, shield: 10, energy: 40, status: "critical", rank: 4, prevRank: 5, kills: 3, accentColor: "neon-blue", glowClass: "neon-border-blue" },
    { id: "p5", name: "Cyber Hawk", initials: "CH", health: 0, maxHealth: 100, shield: 0, energy: 0, status: "eliminated", rank: 5, prevRank: 4, kills: 2, accentColor: "neon-pink", glowClass: "neon-border-pink" },
    { id: "p6", name: "Frost Byte", initials: "FB", health: 88, maxHealth: 100, shield: 72, energy: 94, status: "alive", rank: 6, prevRank: 8, kills: 6, accentColor: "neon-cyan", glowClass: "neon-border-cyan" },
  ];

  let selectedPlayerId = "p1";

  const arenaEvents = [
    { text: "Phoenix Blaze eliminated Cyber Hawk with a precision strike", time: "0:42", type: "kill" },
    { text: "Shadow Viper found a health pack (+25 HP)", time: "1:15", type: "heal" },
    { text: "Iron Pulse dropped to critical health", time: "1:38", type: "critical" },
    { text: "Frost Byte climbed to rank #3 after double kill", time: "2:01", type: "rank" },
    { text: "Neon Storm activated shield barrier", time: "2:24", type: "heal" },
    { text: "Phoenix Blaze took the #1 spot from Shadow Viper", time: "2:55", type: "rank" },
  ];

  function renderPlayerList() {
    const list = document.getElementById("player-list-items");
    if (!list) return;

    const aliveCount = arenaPlayers.filter((p) => p.status !== "eliminated").length;
    document.getElementById("alive-count").textContent = aliveCount;

    list.innerHTML = "";
    arenaPlayers.forEach((player) => {
      const btn = document.createElement("button");
      btn.className = `player-list-item ${selectedPlayerId === player.id ? "selected" : ""}`;
      btn.addEventListener("click", () => {
        selectedPlayerId = player.id;
        renderPlayerList();
        renderPlayerDetail();
      });

      const healthPercent = (player.health / player.maxHealth) * 100;
      const barClass = player.health > 50 ? "high" : player.health > 25 ? "medium" : player.health > 0 ? "low" : "low";
      const avatarStatusClass = player.status === "eliminated" ? "avatar-eliminated" : player.status === "critical" ? "avatar-critical" : "avatar-alive";
      const avatarColorClass = player.status === "eliminated" ? "" : `avatar-${player.accentColor}`;

      const rankDiff = player.prevRank - player.rank;
      let rankChangeHtml = "";
      if (rankDiff > 0) rankChangeHtml = `<span class="rank-change up"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"/></svg>${rankDiff}</span>`;
      else if (rankDiff < 0) rankChangeHtml = `<span class="rank-change down"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>${Math.abs(rankDiff)}</span>`;
      else rankChangeHtml = `<span class="rank-change same"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/></svg></span>`;

      btn.innerHTML = `
        <div class="player-avatar avatar-sm ${avatarStatusClass} ${avatarColorClass}">
          ${player.status !== "eliminated" ? `<span class="avatar-ring" style="border-color: var(--${player.accentColor})"></span>` : ""}
          <div class="avatar-body">${player.status === "eliminated" ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><path d="M8 1C4.5 4 3 6.5 3 9.5c0 4 3 7.5 9 13.5 6-6 9-9.5 9-13.5 0-3-1.5-5.5-5-8.5"/></svg>' : player.initials}</div>
        </div>
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:0.5rem">
            <span class="player-name-text ${player.status === 'eliminated' ? 'eliminated' : ''}">${player.name}</span>
            ${rankChangeHtml}
          </div>
          <div class="mini-health-bar"><div class="bar-fill ${barClass}" style="width:${healthPercent}%"></div></div>
        </div>
        <span class="player-rank-text">#${player.rank}</span>
      `;
      list.appendChild(btn);
    });
  }

  function renderPlayerDetail() {
    const container = document.getElementById("player-detail");
    if (!container) return;
    const player = arenaPlayers.find((p) => p.id === selectedPlayerId) || arenaPlayers[0];
    const isAlive = player.status !== "eliminated";
    const isCritical = player.status === "critical";

    const avatarStatusClass = isAlive ? (isCritical ? "avatar-critical" : "avatar-alive") : "avatar-eliminated";
    const avatarColorClass = isAlive ? `avatar-${player.accentColor}` : "";

    const statusBadgeClass = isAlive ? (isCritical ? "status-critical" : "status-alive") : "status-eliminated";
    const statusIcon = isAlive
      ? (isCritical
          ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/></svg>'
          : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>')
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><path d="M8 1C4.5 4 3 6.5 3 9.5c0 4 3 7.5 9 13.5 6-6 9-9.5 9-13.5 0-3-1.5-5.5-5-8.5"/></svg>';

    const heartbeatPath = isAlive
      ? (isCritical
          ? "M0,20 L20,20 L23,12 L26,28 L29,20 L50,20 L53,14 L56,26 L59,20 L80,20"
          : "M0,20 L8,20 L12,20 L15,8 L18,32 L21,4 L24,28 L27,16 L30,20 L38,20 L46,20 L49,10 L52,30 L55,6 L58,26 L61,18 L64,20 L72,20 L80,20")
      : "M0,20 L80,20";
    const heartbeatColor = isAlive ? (isCritical ? "var(--destructive)" : "var(--neon-lime)") : "var(--muted-foreground)";

    const healthBarClass = player.health > 50 ? "bar-neon-lime" : player.health > 25 ? "bar-orange" : "bar-destructive";

    const rankDiff = player.prevRank - player.rank;
    let rankChangeHtml = "";
    if (rankDiff > 0) rankChangeHtml = `<span class="rank-change up"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><polyline points="18 15 12 9 6 15"/></svg>${rankDiff}</span>`;
    else if (rankDiff < 0) rankChangeHtml = `<span class="rank-change down"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><polyline points="6 9 12 15 18 9"/></svg>${Math.abs(rankDiff)}</span>`;
    else rankChangeHtml = `<span class="rank-change same"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><line x1="5" y1="12" x2="19" y2="12"/></svg></span>`;

    container.className = `player-detail glass ${isAlive ? player.glowClass : ""}`;
    container.innerHTML = `
      <div class="player-detail-inner">
        <div class="player-detail-left">
          <div class="player-avatar avatar-lg ${avatarStatusClass} ${avatarColorClass}">
            ${isAlive ? `<span class="avatar-ring" style="border-color: var(--${player.accentColor})"></span>` : ""}
            <div class="avatar-body">${isAlive ? player.initials : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="32" height="32"><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><path d="M8 1C4.5 4 3 6.5 3 9.5c0 4 3 7.5 9 13.5 6-6 9-9.5 9-13.5 0-3-1.5-5.5-5-8.5"/></svg>'}</div>
          </div>
          <span class="player-status-badge ${statusBadgeClass}">
            ${statusIcon}
            ${player.status}
          </span>
        </div>
        <div class="player-detail-right">
          <div class="player-detail-name">
            ${player.name}
            ${player.rank === 1 ? '<span class="crown-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7z"/><path d="M4 22h16"/></svg></span>' : ""}
          </div>
          <div class="heartbeat-line ${!isAlive ? 'flatline' : ''}">
            <svg viewBox="0 0 80 40" preserveAspectRatio="none">
              <path d="${heartbeatPath}" fill="none" stroke="${heartbeatColor}" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="stat-bars">
            <div class="stat-bar-row">
              <div class="stat-bar-icon ${healthBarClass}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg></div>
              <div class="stat-bar-content">
                <div class="stat-bar-header"><span class="stat-bar-label">Health</span><span class="stat-bar-value ${healthBarClass}">${player.health}</span></div>
                <div class="stat-bar-track"><div class="stat-bar-fill ${healthBarClass}" style="width:${(player.health/player.maxHealth)*100}%"></div></div>
              </div>
            </div>
            <div class="stat-bar-row">
              <div class="stat-bar-icon bar-neon-cyan"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg></div>
              <div class="stat-bar-content">
                <div class="stat-bar-header"><span class="stat-bar-label">Shield</span><span class="stat-bar-value bar-neon-cyan">${player.shield}</span></div>
                <div class="stat-bar-track"><div class="stat-bar-fill bar-neon-cyan" style="width:${player.shield}%"></div></div>
              </div>
            </div>
            <div class="stat-bar-row">
              <div class="stat-bar-icon bar-neon-blue"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg></div>
              <div class="stat-bar-content">
                <div class="stat-bar-header"><span class="stat-bar-label">Energy</span><span class="stat-bar-value bar-neon-blue">${player.energy}</span></div>
                <div class="stat-bar-track"><div class="stat-bar-fill bar-neon-blue" style="width:${player.energy}%"></div></div>
              </div>
            </div>
          </div>
          <div class="quick-stats">
            <div class="quick-stat">
              <span class="label">Rank</span>
              <span class="value">#${player.rank}</span>
              ${rankChangeHtml}
            </div>
            <div class="quick-stat">
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--neon-pink)" stroke-width="2" width="14" height="14"><path d="M14.5 17.5 3 6V1.5h4.5L19 13M13 19l6-6"/><path d="m16 16 3.5 3.5"/><path d="M19 21.5 21.5 19"/></svg>
              <span class="label">Kills</span>
              <span class="value">${player.kills}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderEventFeed() {
    const container = document.getElementById("event-feed-items");
    if (!container) return;
    container.innerHTML = "";
    const iconMap = {
      kill: `<svg viewBox="0 0 24 24" fill="none" stroke="var(--neon-pink)" stroke-width="2" width="12" height="12"><path d="M14.5 17.5 3 6V1.5h4.5L19 13M13 19l6-6"/><path d="m16 16 3.5 3.5"/><path d="M19 21.5 21.5 19"/></svg>`,
      heal: `<svg viewBox="0 0 24 24" fill="none" stroke="var(--neon-lime)" stroke-width="2" width="12" height="12"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`,
      rank: `<svg viewBox="0 0 24 24" fill="none" stroke="var(--neon-cyan)" stroke-width="2" width="12" height="12"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7z"/><path d="M4 22h16"/></svg>`,
      critical: `<svg viewBox="0 0 24 24" fill="none" stroke="var(--destructive)" stroke-width="2" width="12" height="12"><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/></svg>`,
    };
    arenaEvents.forEach((event, i) => {
      const item = document.createElement("div");
      item.className = "event-item";
      item.style.animationDelay = `${i * 0.08}s`;
      item.innerHTML = `
        <div class="event-icon">${iconMap[event.type]}</div>
        <div class="event-text">${event.text}</div>
        <span class="event-time">${event.time}</span>
      `;
      container.appendChild(item);
    });
  }

  // Live simulation - update stats every 3 seconds
  setInterval(() => {
    arenaPlayers = arenaPlayers.map((p) => {
      if (p.status === "eliminated") return p;
      const hd = Math.floor(Math.random() * 12) - 5;
      const sd = Math.floor(Math.random() * 10) - 4;
      const ed = Math.floor(Math.random() * 8) - 2;
      const newH = Math.max(0, Math.min(p.maxHealth, p.health + hd));
      const newS = Math.max(0, Math.min(100, p.shield + sd));
      const newE = Math.max(0, Math.min(100, p.energy + ed));
      return {
        ...p,
        health: newH,
        shield: newS,
        energy: newE,
        status: newH === 0 ? "eliminated" : newH < 30 ? "critical" : "alive",
      };
    });
    renderPlayerList();
    renderPlayerDetail();
  }, 3000);

  // Initial arena render
  renderPlayerList();
  renderPlayerDetail();
  renderEventFeed();

  /* ======================
     HERO STATS COUNTER
     ====================== */
  const statsObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateStatCounters();
          statsObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  const statsBar = document.querySelector(".hero-stats");
  if (statsBar) statsObserver.observe(statsBar);

  function animateStatCounters() {
    document.querySelectorAll(".stat-value[data-count]").forEach((el) => {
      const target = el.dataset.count;
      if (target.includes("K")) {
        const num = parseFloat(target);
        const duration = 1000;
        const start = performance.now();
        function step(now) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = (num * eased).toFixed(0) + "K+";
          if (progress < 1) requestAnimationFrame(step);
          else el.textContent = target + "+";
        }
        requestAnimationFrame(step);
      } else if (target.includes("$")) {
        el.textContent = target;
      } else {
        el.textContent = target;
      }
    });
  }
});
