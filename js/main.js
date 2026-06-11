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
    const sig = $("#statSignal");
    const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
    setInterval(() => {
      const loss = document.getElementById("pillLoss"); // pill 形态切换会重建节点，每次都重新查
      if (loss) loss.textContent = `PACKET LOSS: 0.${ri(1, 6)}%`;
      if (sig && Math.random() < 0.15) sig.textContent = sig.textContent === "STRONG" ? "NOMINAL" : "STRONG";
    }, 1200);
  }

  /* ---------- pill 仪表盘：点击切换形态（内容 = 简历事实） ---------- */
  (() => {
    const pillBtn = $("#pillBtn");
    const stage = $("#pillStage");
    if (!pillBtn || !stage) return;

    // SMIL 旋转（不依赖 CSS transform-origin）
    const rot = (cx, cy, dur, rev) => REDUCED ? "" :
      `<animateTransform attributeName="transform" type="rotate" from="${rev ? 360 : 0} ${cx} ${cy}" to="${rev ? 0 : 360} ${cx} ${cy}" dur="${dur}s" repeatCount="indefinite"/>`;
    const tap = (i) =>
      `<text x="702" y="128" text-anchor="end" class="svgmono svgdim">TAP ⌁ 0${i}/04</text>`;

    const PILL_STATES = [
      { // 01 — IDENT / 在读状态（参考图1布局）
        aria: "SCAD 插画专业 · Concept Design 在读 2023–2026",
        svg: `
          <line x1="120" y1="48" x2="168" y2="48" class="ln flow" marker-end="url(#arr)"/>
          <text x="180" y="53" class="svgmono">NODE</text>
          <line x1="248" y1="48" x2="296" y2="48" class="ln flow" marker-end="url(#arr)"/>
          <text x="308" y="53" class="svgmono">SCAD</text>
          <line x1="372" y1="48" x2="600" y2="48" class="ln"/>
          <circle cx="608" cy="48" r="4" class="ln"/>
          <text x="64" y="92" class="svgbig">ONLINE</text>
          <circle cx="248" cy="80" r="4" class="fillw"/>
          <line x1="260" y1="80" x2="400" y2="80" class="ln"/>
          <text x="412" y="86" class="svgjp">コンセプトアート</text>
          <line x1="572" y1="80" x2="612" y2="80" class="ln"/>
          <circle cx="660" cy="80" r="28" class="ln dotted">${rot(660, 80, 9)}</circle>
          <line x1="600" y1="116" x2="392" y2="116" class="ln flow" marker-end="url(#arr)"/>
          <text x="180" y="121" class="svgmono" id="pillLoss">PACKET LOSS: 0.3%</text>
          ${tap(1)}`,
      },
      { // 02 — GARENA 实习（参考图2 ECHO 布局）
        aria: "Garena 概念美术实习：Free Fire 与 Arena of Valor，2025 年 7–9 月",
        svg: `
          <g class="fillw">
            <rect x="86" y="36" width="8" height="4"/><rect x="80" y="44" width="20" height="4"/>
            <rect x="74" y="52" width="32" height="4"/><rect x="66" y="60" width="48" height="4"/>
            <rect x="58" y="68" width="64" height="4"/>
          </g>
          <text x="58" y="110" class="svgbig">GARENA</text>
          <text x="246" y="52" class="svgmono">CONCEPT ARTIST — INTERNSHIP</text>
          <text x="246" y="84" class="svgmono">TARGET: FREE FIRE · ARENA OF VALOR</text>
          <text x="246" y="112" class="svgmono svgdim">STATE: SHIPPED — JUL→SEP 2025</text>
          <circle cx="660" cy="52" r="15" class="ln"/>
          <line x1="645" y1="52" x2="675" y2="52" class="ln"/>
          <line x1="660" y1="37" x2="660" y2="67" class="ln"/>
          <circle cx="660" cy="96" r="15" class="ln dotted">${rot(660, 96, 7, true)}</circle>
          ${tap(2)}`,
      },
      { // 03 — Sky 光·遇 官方插画（参考图3 STATIC 布局）
        aria: "thatgamecompany《Sky 光·遇》六周年官方插画，2025 年 6 月",
        svg: `
          <circle cx="76" cy="46" r="14" class="ln"/><text x="76" y="51" text-anchor="middle" class="svgmono">T</text>
          <circle cx="110" cy="46" r="14" class="ln"/><text x="110" y="51" text-anchor="middle" class="svgmono">G</text>
          <circle cx="144" cy="46" r="14" class="ln"/><text x="144" y="51" text-anchor="middle" class="svgmono">C</text>
          <text x="58" y="104" class="svgbig">SKY</text>
          <text x="58" y="124" class="svgmono svgdim">CHILDREN OF THE LIGHT</text>
          <text x="246" y="52" class="svgmono">OFFICIAL ILLUSTRATOR</text>
          <text x="246" y="84" class="svgmono">TARGET: 6TH ANNIVERSARY ART</text>
          <text x="246" y="112" class="svgmono svgdim">STATE: PUBLISHED — JUN 2025</text>
          <circle cx="660" cy="75" r="24" class="ln"/>
          <g><line x1="660" y1="75" x2="660" y2="56" class="ln"/>${rot(660, 75, 12)}</g>
          ${tap(3)}`,
      },
      { // 04 — 奖项（参考图4 SECTOR 布局）
        aria: "Beyond the Dot 比赛一等奖×1 二等奖×2；SCAD 奖学金 Top 3% GPA",
        svg: `
          <rect x="58" y="40" width="70" height="70" rx="10" class="ln"/>
          <circle cx="80" cy="62" r="3.5" class="fillw"/><circle cx="106" cy="58" r="3.5" class="ln"/>
          <circle cx="93" cy="76" r="3.5" class="fillw"/><circle cx="78" cy="92" r="3.5" class="ln"/>
          <circle cx="106" cy="90" r="3.5" class="fillw"/>
          <rect x="146" y="40" width="70" height="70" rx="18" class="ln"/>
          <path d="M181 53 L188 68 L203 75 L188 82 L181 97 L174 82 L159 75 L174 68 Z" class="fillw"/>
          <text x="246" y="50" class="svgmono">SECTOR A — BEYOND THE DOT</text>
          <text x="246" y="70" class="svgmono svgdim">1ST ×1 · 2ND ×2 — SCAD 2024</text>
          <text x="246" y="98" class="svgmono">SECTOR B — MERIT SCHOLARSHIP</text>
          <text x="246" y="118" class="svgmono svgdim">TOP 3% GPA · 8 SEMESTERS</text>
          <circle cx="660" cy="75" r="22" class="ln dotted">${rot(660, 75, 9)}</circle>
          ${tap(4)}`,
      },
    ];

    let pillIdx = 0;
    function setPillState(i, instant) {
      pillIdx = (i + PILL_STATES.length) % PILL_STATES.length;
      const st = PILL_STATES[pillIdx];
      const apply = () => {
        stage.innerHTML = st.svg;
        pillBtn.setAttribute("aria-label", `${st.aria} — 点击切换 (${pillIdx + 1}/4)`);
      };
      if (instant || REDUCED) { apply(); return; }
      const svg = $(".pill", pillBtn);
      svg.classList.add("glitch");
      setTimeout(apply, 110);
      setTimeout(() => svg.classList.remove("glitch"), 280);
    }
    pillBtn.addEventListener("click", () => setPillState(pillIdx + 1));
    setPillState(0, true);
  })();

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

      // 有真实作品的项目放大展示；纯占位的项目压缩，让真作品主导首页
      const hasArt = p.works.some((w) => w.src && String(w.src).trim() !== "");

      return `<article class="project reveal${hasArt ? " has-art" : " is-empty"}" id="${esc(p.id)}">
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
    const bm = $("#bioMain"), bd = $("#bioDeco");
    if (bm) bm.textContent = ABOUT.bio;
    if (bd) bd.innerHTML = esc(ABOUT.bioDeco).replace(/✳︎?/g, AST);

    const av = $("#avatarFrame");
    if (av) {
      const hasAva = ABOUT.avatar && String(ABOUT.avatar).trim() !== "";
      const media = hasAva
        ? `<img src="${esc(ABOUT.avatar)}" alt="Portrait of Skyler" />`
        : `<div class="ph-ava">NO IMAGE<br>AWAITING UPLOAD ${AST} ${esc(SITE.name)}</div>`;
      av.insertAdjacentHTML("afterbegin", media);
    }

    const xl = $("#xpList");
    if (xl) {
      xl.innerHTML = ABOUT.experience.map((x) =>
        `<div class="xp">
          <div class="xp-row mono">
            <span class="xp-period">${esc(x.period)}</span>
            <span class="xp-co">${esc(x.company)}</span>
            <span class="xp-role">${esc(x.role)}</span>
            ${x.tag ? `<span class="chip">${esc(x.tag)}</span>` : ""}
          </div>
          ${x.note ? `<p class="xp-note mono">${esc(x.note)}</p>` : ""}
        </div>`
      ).join("");
    }

    const ed = $("#eduBlock");
    if (ed && ABOUT.education) {
      const e = ABOUT.education;
      ed.innerHTML = `<div class="xp">
        <div class="xp-row mono">
          <span class="xp-period">${esc(e.period)}</span>
          <span class="xp-co">${esc(e.school)}</span>
          <span class="xp-role">${esc(e.degree)}</span>
        </div>
      </div>`;
    }

    const aw = $("#awardList");
    if (aw) {
      aw.innerHTML = ABOUT.awards.map((a) =>
        `<div class="xp">
          <div class="xp-row mono">
            <span class="xp-co">${esc(a.title)}</span>
            <span class="xp-role">${esc(a.sub)}</span>
            ${a.detail ? `<span class="chip is-active">${esc(a.detail)}</span>` : ""}
          </div>
          ${a.note ? `<p class="xp-note mono">${esc(a.note)}</p>` : ""}
        </div>`
      ).join("");
    }

    const sl = $("#skillList");
    if (sl) {
      sl.innerHTML = ABOUT.skills.map((s) =>
        `<span class="skill-chip mono">${esc(s)}</span>`
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
