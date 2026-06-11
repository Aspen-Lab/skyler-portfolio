/* ============================================================
   SKYLER — main.js
   渲染逻辑：一般不需要改这里，改 data.js 就够了。
   ============================================================ */
(() => {
  "use strict";

  const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  // U+2733 + U+FE0E：强制文本样式，避免手机上渲染成彩色 emoji
  const AST = "✳︎";

  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );

  const pad2 = (n) => String(n).padStart(2, "0");

  // 某些隐私模式下访问 sessionStorage 会直接抛错 —— 包一层
  const storeGet = (k) => { try { return sessionStorage.getItem(k); } catch { return null; } };
  const storeSet = (k, v) => { try { sessionStorage.setItem(k, v); } catch { /* blocked */ } };

  /* ---------- site identity (data.js 驱动) ---------- */
  function applySite() {
    document.title = `${SITE.name} ${AST} VISUAL ARCHIVE`;
    const hero = $("#heroTitle");
    if (hero) {
      const n = String(SITE.heroName || SITE.name).trim();
      // 有数字时在数字处切分（SECAL|72），否则对半切
      const m = n.match(/^(.+?)(\d.*)$/);
      const cut = m ? m[1].length : Math.ceil(n.length / 2);
      hero.innerHTML = `<span class="solid">${esc(n.slice(0, cut))}</span><span class="hollow">${esc(n.slice(cut))}</span>`;
    }
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set("brandName", SITE.name);
    set("specName", SITE.name);
    set("footName", SITE.name);
    set("footCopy", SITE.name);
    set("tagId", `ID: ${SITE.alias}`);
    set("tagZh", `${SITE.zhName} ${AST} ${SITE.est}`);
  }

  /* ---------- boot overlay ---------- */
  const boot = $("#boot");
  const killBoot = () => boot && boot.classList.add("killed");
  if (boot) {
    if (REDUCED || storeGet("skyler-booted")) {
      killBoot();
    } else {
      const dismiss = () => {
        boot.classList.add("done");
        storeSet("skyler-booted", "1");
        setTimeout(killBoot, 650);
      };
      setTimeout(dismiss, 1500);
      boot.addEventListener("click", dismiss, { once: true });
    }
  }

  /* ---------- clock + live telemetry ---------- */
  const clockEl = $("#clock");
  if (clockEl) {
    const tick = () => {
      const d = new Date();
      clockEl.textContent = `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
    };
    tick();
    setInterval(tick, 1000);
  }
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  if (!REDUCED) {
    const lat = $("#statLatency"), sig = $("#statSignal"), loss = $("#pillLoss");
    const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
    setInterval(() => {
      if (lat) lat.textContent = `${ri(38, 61)}ms`;
      if (loss) loss.textContent = `PACKET LOSS: 0.${ri(1, 6)}%`;
      if (sig && Math.random() < 0.15) sig.textContent = sig.textContent === "STRONG" ? "NOMINAL" : "STRONG";
    }, 1200);
  }

  /* ---------- text scramble ---------- */
  const GLYPHS = "ABCDEFGHIKLMNOPRSTUVXYZ0123456789*#/<>+=";
  function scramble(el) {
    if (REDUCED || !el) return;
    if (!el.dataset.original) el.dataset.original = el.textContent;
    const original = el.dataset.original;
    if (el._scrTimer) clearInterval(el._scrTimer);
    const len = original.length;
    let frame = 0;
    const total = 16;
    el._scrTimer = setInterval(() => {
      frame++;
      const settled = Math.floor((frame / total) * len);
      let out = "";
      for (let i = 0; i < len; i++) {
        const ch = original[i];
        if (i < settled || ch === " " || ch === " ") out += ch;
        else out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }
      el.textContent = out;
      if (frame >= total) {
        el.textContent = original;
        clearInterval(el._scrTimer);
        el._scrTimer = null;
      }
    }, 28);
  }

  /* ---------- placeholder art ---------- */
  const PH_SVGS = [
    // a: dotted grid (参考图4)
    `<svg viewBox="0 0 56 56" aria-hidden="true"><rect x="3" y="3" width="50" height="50" rx="8" class="ln"/>
      <circle cx="18" cy="18" r="3" class="fl"/><circle cx="32" cy="22" r="3" class="ln"/><circle cx="40" cy="16" r="3" class="fl"/>
      <circle cx="16" cy="32" r="3" class="ln"/><circle cx="28" cy="34" r="3" class="fl"/><circle cx="40" cy="32" r="3" class="fl"/>
      <circle cx="20" cy="44" r="3" class="fl"/><circle cx="34" cy="44" r="3" class="ln"/></svg>`,
    // b: clock dial (参考图3)
    `<svg viewBox="0 0 56 56" aria-hidden="true"><circle cx="28" cy="28" r="24" class="ln"/>
      <g class="hand"><line x1="28" y1="28" x2="28" y2="9" class="ln"/></g>
      <circle cx="28" cy="28" r="2.5" class="fl"/></svg>`,
    // c: striped peak (参考图2 ECHO)
    `<svg viewBox="0 0 56 56" aria-hidden="true">
      <rect x="25" y="12" width="6" height="3" class="fl"/><rect x="21" y="19" width="14" height="3" class="fl"/>
      <rect x="17" y="26" width="22" height="3" class="fl"/><rect x="12" y="33" width="32" height="3" class="fl"/>
      <rect x="7" y="40" width="42" height="3" class="fl"/></svg>`,
  ];
  const PH_LABELS = ["AWAITING UPLOAD", "STANDBY", "NO SIGNAL"];
  function phHTML(i, slotId) {
    const v = i % 3;
    const cls = ["ph-a", "ph-b", "ph-c"][v];
    return `<div class="ph ${cls}">${PH_SVGS[v]}
      <div class="ph-label"><b>${PH_LABELS[v]}</b>SLOT_${esc(slotId)} ${AST} STATE: EMPTY</div>
    </div>`;
  }

  /* ---------- card builder ---------- */
  function cardHTML(work, fileId, lbGroup, lbIndex) {
    const hasImg = work.src && String(work.src).trim() !== "";
    const inner = hasImg
      ? `<img src="${esc(work.src)}" alt="${esc(work.title)}" loading="lazy" />`
      : phHTML(lbIndex, fileId);
    const linkAttrs = hasImg
      ? ` tabindex="0" role="button" aria-label="查看 ${esc(work.title)}" data-lb-group="${esc(lbGroup)}" data-lb-index="${lbIndex}"`
      : "";
    return `<figure class="card${hasImg ? " is-link" : ""}"${linkAttrs}>
      <div class="frame">${inner}
        <span class="corner c-tl"></span><span class="corner c-tr"></span><span class="corner c-bl"></span><span class="corner c-br"></span>
      </div>
      <figcaption class="mono"><span>${esc(work.title)}</span><span class="fid">${esc(fileId)}</span></figcaption>
    </figure>`;
  }

  /* ---------- lightbox ---------- */
  const lb = $("#lightbox");
  const lbImg = $("#lbImg");
  const lbCap = $("#lbCap");
  const galleries = {}; // group -> [{src, cap}]
  let lbState = { group: null, index: 0, lastFocus: null };

  function lbOpen(group, index) {
    const items = galleries[group];
    if (!items || !items.length) return;
    lbState = { group, index, lastFocus: document.activeElement };
    lbRender();
    lb.hidden = false;
    document.body.style.overflow = "hidden";
    $(".lb-close", lb).focus();
  }
  function lbRender() {
    const items = galleries[lbState.group];
    const it = items[lbState.index];
    lbImg.src = it.src;
    lbImg.alt = it.cap;
    lbCap.innerHTML = `FILE: <em>${esc(it.cap)}</em> ${AST} ${pad2(lbState.index + 1)} / ${pad2(items.length)}`;
  }
  function lbNav(dir) {
    const items = galleries[lbState.group];
    if (!items) return;
    lbState.index = (lbState.index + dir + items.length) % items.length;
    lbRender();
  }
  function lbClose() {
    lb.hidden = true;
    lbImg.src = "";
    document.body.style.overflow = "";
    if (lbState.lastFocus) lbState.lastFocus.focus();
  }
  if (lb) {
    $(".lb-close", lb).addEventListener("click", lbClose);
    $(".lb-prev", lb).addEventListener("click", () => lbNav(-1));
    $(".lb-next", lb).addEventListener("click", () => lbNav(1));
    lbImg.addEventListener("click", () => lbNav(1));
    lb.addEventListener("click", (e) => { if (e.target === lb) lbClose(); });
    document.addEventListener("keydown", (e) => {
      if (lb.hidden) return;
      if (e.key === "Tab") {
        // 简易焦点圈：在可见的灯箱按钮之间循环
        const f = $$(".lb-close, .lb-prev, .lb-next", lb).filter((b) => b.offsetParent !== null);
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        else if (!lb.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
        return;
      }
      if (e.key === "Escape") lbClose();
      else if (e.key === "ArrowLeft") lbNav(-1);
      else if (e.key === "ArrowRight") lbNav(1);
    });
  }
  // delegated open (works for portfolio + fanart)
  document.addEventListener("click", (e) => {
    const card = e.target.closest("[data-lb-group]");
    if (card) lbOpen(card.dataset.lbGroup, Number(card.dataset.lbIndex));
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const card = e.target.closest && e.target.closest("[data-lb-group]");
    if (card) {
      e.preventDefault();
      lbOpen(card.dataset.lbGroup, Number(card.dataset.lbIndex));
    }
  });

  /* ---------- marquee engine ----------
     - 隐藏视图 (display:none) 下不测量，等切回 portfolio 再初始化
     - 图片加载 / 窗口变化后重新计算复制份数与时长（保持恒定像素速度）
     - 复制出来的卡片去掉 tabindex/role，避免键盘焦点重复 */
  const stripBase = new Map(); // strip -> { base, count }
  let marqueesDone = false;

  function sanitizeDupes(half, origCount) {
    [...half.children].slice(origCount).forEach((el) => {
      el.setAttribute("aria-hidden", "true");
      el.removeAttribute("tabindex");
      el.removeAttribute("role");
      el.removeAttribute("aria-label");
      $$("[tabindex]", el).forEach((n) => n.removeAttribute("tabindex"));
    });
  }
  function appendClone(track, half) {
    const clone = half.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    $$("[tabindex]", clone).forEach((el) => el.removeAttribute("tabindex"));
    track.appendChild(clone);
  }
  function fillStrip(strip) {
    const track = $(".track", strip);
    const half = $(".half", track);
    if (!track || !half || strip.clientWidth === 0) return false;
    if (!stripBase.has(strip)) {
      stripBase.set(strip, { base: half.innerHTML, count: half.children.length });
    }
    const { base, count } = stripBase.get(strip);
    const copies = Math.max(1, Math.round(half.children.length / count));
    const per = half.offsetWidth / copies;
    const need = Math.min(7, Math.max(1, Math.ceil((strip.clientWidth + 60) / Math.max(per, 1))));
    if (need !== copies) {
      half.innerHTML = base.repeat(need);
      sanitizeDupes(half, count);
      $$(".half[aria-hidden]", track).forEach((h) => h.remove());
      appendClone(track, half);
    } else if (!$(".half[aria-hidden]", track)) {
      appendClone(track, half);
    }
    // 恒速 ~30px/s
    track.style.setProperty("--dur", `${Math.max(28, Math.round(half.offsetWidth / 30))}s`);
    return true;
  }
  function setupMarquees() {
    if (REDUCED) { marqueesDone = true; return; }
    let ok = true;
    $$("#projects .strip").forEach((s) => { if (!fillStrip(s)) ok = false; });
    marqueesDone = ok;
  }
  function portfolioVisible() {
    const v = $("#view-portfolio");
    return v && v.classList.contains("is-active");
  }
  let resizeT = 0;
  window.addEventListener("resize", () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(() => { if (!REDUCED && portfolioVisible()) setupMarquees(); }, 250);
  });

  /* ---------- portfolio render ---------- */
  function renderProjects() {
    const wrap = $("#projects");
    if (!wrap) return;
    wrap.innerHTML = PROJECTS.map((p, pi) => {
      const stateCls = p.state === "ACTIVE" ? " is-active" : p.state === "ARCHIVED" ? " is-archived" : "";
      const gallery = [];
      const cards = p.works.map((w, wi) => {
        const fileId = `F-${pad2(pi + 1)}${pad2(wi + 1)}`;
        const hasImg = w.src && String(w.src).trim() !== "";
        let lbIndex = wi;
        if (hasImg) {
          lbIndex = gallery.length;
          gallery.push({ src: w.src, cap: `${w.title} / ${p.title}` });
        }
        return cardHTML(w, fileId, `p-${pi}`, lbIndex);
      }).join("");
      galleries[`p-${pi}`] = gallery;

      const pauseBtn = REDUCED ? "" :
        `<button class="strip-toggle mono" type="button" aria-pressed="false" aria-label="暂停滚动">PAUSE</button>`;

      return `<article class="project reveal" id="${esc(p.id)}">
        <header class="project-head">
          <span class="p-index mono">[${esc(p.id)}]</span>
          <h2 class="p-title">${esc(p.title)}<span class="p-zh">${esc(p.zh)}</span></h2>
          <div class="p-meta mono">
            <span>${esc(p.year)}</span><span>${AST}</span>
            <span>${esc(p.medium)}</span><span>${AST}</span>
            <span>${pad2(p.works.length)} FILES</span>
            <span class="chip${stateCls}">${esc(p.state)}</span>
            ${pauseBtn}
          </div>
        </header>
        <div class="strip">
          <div class="track${pi % 2 ? " rev" : ""}">
            <div class="half">${cards}</div>
          </div>
        </div>
      </article>`;
    }).join("");

    // 暂停按钮 + 触屏按住暂停 + 焦点滚动复位
    $$(".project", wrap).forEach((art) => {
      const strip = $(".strip", art);
      const btn = $(".strip-toggle", art);
      if (!strip) return;
      let pinned = false;
      if (btn) {
        btn.addEventListener("click", () => {
          pinned = !pinned;
          btn.setAttribute("aria-pressed", String(pinned));
          btn.textContent = pinned ? "PLAY" : "PAUSE";
          btn.setAttribute("aria-label", pinned ? "继续滚动" : "暂停滚动");
          strip.classList.toggle("is-paused", pinned);
        });
      }
      let touchT = 0;
      strip.addEventListener("pointerdown", (e) => {
        if (e.pointerType === "mouse") return;
        clearTimeout(touchT);
        strip.classList.add("is-paused");
      }, { passive: true });
      const release = () => {
        if (pinned) return;
        clearTimeout(touchT);
        touchT = setTimeout(() => strip.classList.remove("is-paused"), 600);
      };
      strip.addEventListener("pointerup", release, { passive: true });
      strip.addEventListener("pointercancel", release, { passive: true });
      strip.addEventListener("focusin", () => { strip.scrollLeft = 0; });
    });

    // 图片加载完成后重新测量（load 不冒泡，用捕获）
    let loadT = 0;
    wrap.addEventListener("load", () => {
      clearTimeout(loadT);
      loadT = setTimeout(() => { if (!REDUCED && portfolioVisible()) setupMarquees(); }, 200);
    }, true);

    // stats
    const files = PROJECTS.reduce((n, p) => n + p.works.length, 0);
    const sf = $("#statFiles"), sp = $("#statProjects");
    if (sf) sf.textContent = pad2(files);
    if (sp) sp.textContent = pad2(PROJECTS.length);
  }

  /* ---------- ticker ---------- */
  function renderTicker() {
    const t = $("#tickerTrack");
    if (!t) return;
    const words = [SITE.tagline, "文字と線の融合", SITE.est, SITE.name, "SIGNAL: STRONG", "LOG_2026.TXT — WRITING", "アーカイブ更新中"];
    const seq = words.map((w) =>
      `<span><span class="ast">${AST}</span> ${esc(w).replace(/✳︎?/g, AST)}</span>`
    ).join("");
    t.innerHTML = seq + seq; // 两份 → translateX(-50%) 无缝
  }

  /* ---------- fanart ---------- */
  let fanFilter = "ALL";
  function renderFanart() {
    const grid = $("#fanartGrid");
    if (!grid) return;
    const list = FANART.filter((w) => fanFilter === "ALL" || w.fandom === fanFilter);
    const gallery = [];
    grid.innerHTML = list.map((w, i) => {
      const fileId = `FA-${pad2(i + 1)}`;
      const hasImg = w.src && String(w.src).trim() !== "";
      let lbIndex = i;
      if (hasImg) {
        lbIndex = gallery.length;
        gallery.push({ src: w.src, cap: `${w.title} / ${w.fandom}` });
      }
      return cardHTML({ title: `${w.title} ⌁ ${w.fandom}`, src: w.src }, fileId, "fan", lbIndex);
    }).join("");
    galleries["fan"] = gallery;
  }
  function renderFanartFilters() {
    const bar = $("#fanartFilters");
    if (!bar) return;
    const fandoms = ["ALL", ...new Set(FANART.map((w) => w.fandom))];
    bar.innerHTML = fandoms.map((f) =>
      `<button class="fbtn${f === fanFilter ? " is-on" : ""}" aria-pressed="${f === fanFilter}" data-f="${esc(f)}">${esc(f)}</button>`
    ).join("");
    $$(".fbtn", bar).forEach((b) =>
      b.addEventListener("click", () => {
        fanFilter = b.dataset.f;
        // 原地切换状态，不重建按钮 —— 保住键盘焦点
        $$(".fbtn", bar).forEach((x) => {
          const on = x === b;
          x.classList.toggle("is-on", on);
          x.setAttribute("aria-pressed", String(on));
        });
        renderFanart();
      })
    );
  }

  /* ---------- about ---------- */
  function renderAbout() {
    const bz = $("#bioZh"), be = $("#bioEn");
    if (bz) bz.textContent = ABOUT.bioZh;
    if (be) be.textContent = ABOUT.bioEn;

    const av = $("#avatarFrame");
    if (av) {
      const hasAva = ABOUT.avatar && String(ABOUT.avatar).trim() !== "";
      const media = hasAva
        ? `<img src="${esc(ABOUT.avatar)}" alt="Skyler 的头像" />`
        : `<div class="ph-ava">NO IMAGE<br>待上传 ${AST} ${esc(SITE.name)}</div>`;
      av.insertAdjacentHTML("afterbegin", media);
    }

    const sState = (v) => (v >= 85 ? "PRIMARY" : v >= 65 ? "ACTIVE" : "TRAINING");
    const sl = $("#skillList");
    if (sl) {
      sl.innerHTML = ABOUT.skills.map(([name, v]) =>
        `<div class="skill">
          <div class="s-row"><span>${esc(name)}</span><em>STATE: ${sState(Number(v) || 0)}</em></div>
          <div class="s-bar"><div class="s-fill" data-v="${Number(v) || 0}"></div></div>
        </div>`
      ).join("");
    }

    const ll = $("#linkList");
    if (ll) {
      ll.innerHTML = ABOUT.links.map((l) => {
        const u = String(l.url || "").trim();
        if (!u || u === "#") {
          return `<span class="dead" title="链接待填写">${esc(l.label)}</span>`;
        }
        return `<a href="${esc(u)}" target="_blank" rel="noopener noreferrer">${esc(l.label)}</a>`;
      }).join("");
    }
  }
  function animateSkills() {
    $$("#skillList .s-fill").forEach((f, i) => {
      setTimeout(() => { f.style.width = `${f.dataset.v}%`; }, 80 + i * 90);
    });
  }

  /* ---------- view switching (窄bar切换) ---------- */
  const VIEWS = ["portfolio", "fanart", "about"];
  let currentView = null;
  function switchView(name, push = true) {
    if (!VIEWS.includes(name)) name = "portfolio";
    if (name === currentView) return;
    currentView = name;
    $$(".view").forEach((v) => v.classList.toggle("is-active", v.id === `view-${name}`));
    $$(".tab").forEach((t) => {
      const on = t.dataset.view === name;
      t.classList.toggle("is-active", on);
      if (on) t.setAttribute("aria-current", "page");
      else t.removeAttribute("aria-current");
    });
    if (push && location.hash.slice(1) !== name) location.hash = name;
    window.scrollTo({ top: 0, behavior: REDUCED ? "auto" : "smooth" });
    const title = $(`#view-${name} [data-scramble]`);
    if (title) scramble(title);
    if (name === "about") animateSkills();
    if (name === "portfolio" && !REDUCED && !marqueesDone) requestAnimationFrame(setupMarquees);
    observeReveals();
  }
  $$(".tab").forEach((t) => t.addEventListener("click", () => switchView(t.dataset.view)));
  $(".brand").addEventListener("click", (e) => { e.preventDefault(); switchView("portfolio"); });
  window.addEventListener("hashchange", () => switchView(location.hash.slice(1), false));

  /* ---------- scroll reveals ---------- */
  let revealObserver = null;
  function observeReveals() {
    if (REDUCED) return;
    if (!revealObserver) {
      revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("is-in");
            revealObserver.unobserve(en.target);
          }
        });
      }, { threshold: 0.08 });
    }
    $$(".reveal:not(.is-in)").forEach((el) => revealObserver.observe(el));
  }

  /* ---------- init ---------- */
  applySite();
  renderProjects();
  renderTicker();
  renderFanartFilters();
  renderFanart();
  renderAbout();
  switchView(location.hash.slice(1) || "portfolio", false);
})();
