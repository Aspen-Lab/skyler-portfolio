/* ============================================================
   SKYLER — main.js
   渲染逻辑：一般不需要改这里，改 data.js 就够了。
   ============================================================ */
(() => {
  "use strict";

  const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // 纯触屏设备：作品条不跑 marquee，改为手动横向滑动
  const TOUCH = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
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
    document.title = `${SITE.name} (${SITE.heroName}) ${AST} VISUAL ARCHIVE`;
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
    set("tagZh", `${SITE.displayName} ${AST} ${SITE.est}`);
    // 学历强调行（data.js 驱动；留空则整行移除）
    const cred = $("#heroCred");
    if (cred) {
      const txt = String(SITE.credential || "").trim();
      if (!txt) cred.remove();
      else {
        cred.setAttribute("aria-label", txt);
        const s = $(".cred-text", cred);
        if (s) s.textContent = txt;
      }
    }
  }

  /* ---------- boot overlay ---------- */
  const boot = $("#boot");
  const killBoot = () => boot && boot.classList.add("killed");
  let bootShown = false;
  if (boot) {
    if (storeGet("skyler-booted")) {
      killBoot();
    } else {
      bootShown = true;
      const dismiss = () => {
        document.removeEventListener("keydown", onKey);
        boot.classList.add("done");
        storeSet("skyler-booted", "1");
        setTimeout(killBoot, 650);
        heroIntro(); // boot 掀开的同时开始 hero 入场编排
      };
      // 键盘也能跳过开机动画
      const onKey = (e) => { if (e.key === "Enter" || e.key === " " || e.key === "Escape") dismiss(); };
      setTimeout(dismiss, 1500);
      boot.addEventListener("click", dismiss, { once: true });
      document.addEventListener("keydown", onKey);
    }
  }

  /* ---------- hero 入场编排 ----------
     标题逐字解码 → 学历行打字机 → 标签浮入(CSS) → pill 描边画入(CSS) → 计数器跳动 */
  let heroIntroDone = false;
  function heroIntro() {
    if (heroIntroDone) return;
    heroIntroDone = true;
    document.body.classList.add("hero-ready");
    decodeHeroTitle();
    setTimeout(typeCredential, 380);
    setTimeout(countUpStats, 1200);
  }

  // SECAL72 逐字乱码定格：实心/空心两段分别拆字符，错峰落定
  function decodeHeroTitle() {
    const hero = $("#heroTitle");
    if (!hero) return;
    const full = hero.textContent.trim();
    hero.setAttribute("aria-label", full); // SR 始终读完整名字
    const parts = $$("span", hero).filter((s) => s.classList.contains("solid") || s.classList.contains("hollow"));
    const chars = []; // { el, final, settleAt }
    let idx = 0;
    parts.forEach((part) => {
      const text = part.textContent;
      part.innerHTML = [...text].map(() => `<span class="tch" aria-hidden="true"></span>`).join("");
      $$(".tch", part).forEach((ch, i2) => {
        chars.push({ el: ch, final: [...text][i2] || "", settleAt: idx * 60 + 340 });
        idx++;
      });
    });
    const t0 = performance.now();
    const timer = setInterval(() => {
      const t = performance.now() - t0;
      let live = 0;
      chars.forEach((c) => {
        if (t >= c.settleAt) { c.el.textContent = c.final; }
        else { c.el.textContent = GLYPHS[Math.floor(Math.random() * GLYPHS.length)]; live++; }
      });
      if (!live) clearInterval(timer);
    }, 34);
  }

  // 学历行打字机（aria-label 已含全文，打字过程对 SR 隐藏）
  function typeCredential() {
    const wrap = $("#heroCred");
    if (!wrap) return;
    const txt = String(SITE.credential || "").trim();
    if (!txt) { wrap.remove(); return; }
    wrap.setAttribute("aria-label", txt);
    const span = $(".cred-text", wrap);
    if (!span) return;
    let i = 0;
    span.textContent = "";
    const timer = setInterval(() => {
      i++;
      span.textContent = txt.slice(0, i);
      if (i >= txt.length) clearInterval(timer);
    }, 20);
  }

  // FILES / PROJECTS 计数器从 00 跳到实际值
  function countUpStats() {
    $$("#statFiles, #statProjects").forEach((el) => {
      const target = parseInt(el.textContent, 10);
      if (!target || Number.isNaN(target)) return;
      const t0 = performance.now(), dur = 700;
      const tick = () => {
        const p = Math.min(1, (performance.now() - t0) / dur);
        el.textContent = pad2(Math.round(target * (1 - Math.pow(1 - p, 2.2))));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
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
  const logEl = $("#footLog");
  if (logEl) logEl.textContent = `LOG_${new Date().getFullYear()}.TXT`;

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

    const PILL_STATES = [
      { // 01 — IDENT / 在读状态（参考图1布局）
        aria: "SCAD Illustration, Concept Design concentration, 2023–2026",
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
          <text x="180" y="121" class="svgmono" id="pillLoss">PACKET LOSS: 0.3%</text>`,
      },
      { // 02 — GARENA 实习（参考图2 ECHO 布局）
        aria: "Garena concept art internship: Free Fire and Arena of Valor, Jul–Sep 2025",
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
          <circle cx="660" cy="96" r="15" class="ln dotted">${rot(660, 96, 7, true)}</circle>`,
      },
      { // 03 — Sky 光·遇 官方插画（参考图3 STATIC 布局）
        aria: "thatgamecompany Sky: Children of the Light 6th-anniversary official illustration, Jun 2025",
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
          <g><line x1="660" y1="75" x2="660" y2="56" class="ln"/>${rot(660, 75, 12)}</g>`,
      },
      { // 04 — 奖项（参考图4 SECTOR 布局）
        aria: "Beyond the Dot: one 1st prize, two 2nd prizes; SCAD merit scholarship, top 3% GPA",
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
          <circle cx="660" cy="75" r="22" class="ln dotted">${rot(660, 75, 9)}</circle>`,
      },
    ];

    let pillIdx = 0;
    const pillHint = $("#pillHint");
    const pillLive = $("#pillLive");
    function setPillState(i, instant) {
      pillIdx = (i + PILL_STATES.length) % PILL_STATES.length;
      const st = PILL_STATES[pillIdx];
      const apply = () => {
        stage.innerHTML = st.svg;
        pillBtn.setAttribute("aria-label", `${st.aria} — click to cycle (${pillIdx + 1}/4)`);
        if (pillHint) pillHint.textContent = `TAP · 0${pillIdx + 1}/04`;
        // aria-label 变更 VoiceOver 不播报，用 live region 主动播
        if (pillLive && !instant) pillLive.textContent = `${st.aria} (${pillIdx + 1}/4)`;
      };
      if (instant) { apply(); return; }
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
    if (!el) return;
    if (!el.dataset.original) el.dataset.original = el.textContent;
    const original = el.dataset.original;
    // SR 始终读完整标题，不读动画中的乱码帧
    el.setAttribute("aria-label", original);
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
  function cardHTML(work, fileId, lbGroup, lbIndex, eager) {
    const hasImg = work.src && String(work.src).trim() !== "";
    const dims = work.w && work.h ? ` width="${Number(work.w)}" height="${Number(work.h)}"` : "";
    const load = eager ? ` loading="eager" fetchpriority="high"` : ` loading="lazy"`;
    const inner = hasImg
      ? `<img src="${esc(work.src)}" alt="${esc(work.title)}"${dims} decoding="async"${load} />`
      : phHTML(lbIndex, fileId);
    const linkAttrs = hasImg
      ? ` tabindex="0" role="button" aria-label="View ${esc(work.title)}" data-lb-group="${esc(lbGroup)}" data-lb-index="${lbIndex}"`
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
  let lbZoomOn = false;      // 放大镜状态（swipe 导航需要避让）
  let lbZoomToggle = null;   // 由 zoom 模块赋值：点击图片切换缩放

  let lbHideT = 0;
  function lbOpen(group, index) {
    const items = galleries[group];
    if (!items || !items.length) return;
    clearTimeout(lbHideT);
    lbState = { group, index, lastFocus: document.activeElement, scrollY: window.scrollY };
    lbRender(true); // first open: instant (no fade-out on blank)
    lb.hidden = false;
    // 双 rAF 确保 hidden 移除后过渡能播：背景淡入 + 画框浮入
    requestAnimationFrame(() => requestAnimationFrame(() => lb.classList.add("is-open")));
    // iOS 也锁得住的滚动锁：body 定格 + 记录位置，关闭时还原
    document.body.style.position = "fixed";
    document.body.style.top = `-${lbState.scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";
    $(".lb-close", lb).focus();
  }
  let lbTransitioning = false;
  function lbRender(instant, dir = 1) {
    const items = galleries[lbState.group];
    const it = items[lbState.index];
    lbCap.innerHTML = `FILE: <em>${esc(it.cap)}</em> ${AST} ${pad2(lbState.index + 1)} / ${pad2(items.length)}`;
    if (instant) {
      lbImg.src = it.src;
      lbImg.alt = it.cap;
      lbImg.style.opacity = "1";
      lbImg.style.transform = "";
      lbTransitioning = false;
      return;
    }
    // 正常加载过渡：淡出 → 换图 → 淡入
    lbTransitioning = true;
    lbImg.style.transition = "opacity 0.18s ease";
    lbImg.style.transform = "";
    lbImg.style.opacity = "0";
    const swap = () => {
      lbImg.src = it.src;
      lbImg.alt = it.cap;
      let entered = false;
      const enter = () => {
        if (entered) return;
        entered = true;
        lbImg.style.opacity = "1";
        setTimeout(() => { lbTransitioning = false; }, 200);
      };
      if (lbImg.complete) enter();
      else {
        lbImg.addEventListener("load", enter, { once: true });
        lbImg.addEventListener("error", enter, { once: true });
      }
    };
    setTimeout(swap, 170);
  }
  function lbNav(dir) {
    if (lbTransitioning) return;
    const items = galleries[lbState.group];
    if (!items) return;
    let i = lbState.index;
    for (let n = 0; n < items.length; n++) {
      i = (i + dir + items.length) % items.length;
      if (!items[i].dead) break;
    }
    if (!items[i] || items[i].dead) return;
    lbState.index = i;
    lbRender(false, dir);
  }
  function lbClose() {
    // 滚动与焦点立即还原；视觉上淡出 240ms 后才真正隐藏
    lb.classList.remove("is-open");
    ["position", "top", "left", "right", "width", "overflow"].forEach((p) => { document.body.style[p] = ""; });
    // html 有 scroll-behavior:smooth，必须 instant 否则还原会变成滚动动画
    window.scrollTo({ top: lbState.scrollY || 0, left: 0, behavior: "instant" });
    const f = lbState.lastFocus;
    if (f && f.isConnected && f.offsetParent !== null) f.focus({ preventScroll: true });
    else { const t = $(".tab.is-active"); if (t) t.focus({ preventScroll: true }); }
    clearTimeout(lbHideT);
    lbHideT = setTimeout(() => { lb.hidden = true; lbImg.src = ""; }, 240);
  }
  if (lb) {
    $(".lb-close", lb).addEventListener("click", lbClose);
    $(".lb-prev", lb).addEventListener("click", () => lbNav(-1));
    $(".lb-next", lb).addEventListener("click", () => lbNav(1));
    // 触屏滑动翻页；滑动后吞掉随之而来的合成 click，避免翻两页
    const stage = $(".lb-stage", lb);
    let swipeX = null, swiped = false;
    stage.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "mouse") return;
      swipeX = e.clientX; swiped = false;
    }, { passive: true });
    stage.addEventListener("pointerup", (e) => {
      if (swipeX === null) return;
      const dx = e.clientX - swipeX;
      swipeX = null;
      // 放大状态下水平拖动是平移，不是翻页
      if (Math.abs(dx) > 40 && !lbZoomOn) { swiped = true; lbNav(dx < 0 ? 1 : -1); }
    }, { passive: true });
    stage.addEventListener("pointercancel", () => { swipeX = null; }, { passive: true });
    // 点击图片 = 以点击位置为中心切换放大（ArtStation 式）
    lbImg.addEventListener("click", (e) => {
      if (swiped) { swiped = false; return; }
      if (lbZoomToggle) lbZoomToggle(e);
    });
    lb.addEventListener("click", (e) => { if (e.target === lb) lbClose(); });
    document.addEventListener("keydown", (e) => {
      if (lb.hidden) return;
      if (e.key === "Tab") {
        // 简易焦点圈：在可见的灯箱按钮之间循环
        const f = $$(".lb-close, .lb-prev, .lb-next, .lb-loupe", lb).filter((b) => b.offsetParent !== null);
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
  /* ---------- loupe 放大镜：圆形镜片跟随光标局部放大 ----------
     不缩放整图 —— 一块 2.5× 的圆形镜片贴着光标走，
     构图全貌始终可见，看细节像拿着放大镜看原画。
     镜片位置 rAF lerp 跟随，背景图位置同源计算，全程同步丝滑。 */
  (() => {
    if (!lb) return;
    const lbFrame = $("#lbFrame");
    const lens = $("#lbLens");
    const loupeBtn = $("#lbZoomBtn");
    if (!lbFrame || !lens || !loupeBtn) return;

    const glass = $("#lbLensGlass");
    const Z = 3.5, R = 260; // 镜片半径 260px（直径 520），3.5× 放大
    let on = false, raf = 0, rect = null, visible = false;
    let cx = 0, cy = 0, tx = 0, ty = 0;

    const measure = () => {
      rect = lbImg.getBoundingClientRect();
      if (glass) {
        glass.style.backgroundImage = `url("${lbImg.currentSrc || lbImg.src}")`;
        glass.style.backgroundSize = `${rect.width * Z}px ${rect.height * Z}px`;
      }
    };
    // transform 定位（合成器，不触发布局）；镜内画面与镜片同源同步
    const place = () => {
      lens.style.transform = `translate3d(${cx - R}px, ${cy - R}px, 0)`;
      if (glass) glass.style.backgroundPosition = `${R - cx * Z}px ${R - cy * Z}px`;
    };
    const step = () => {
      // 0.55：紧贴光标的"光标感"，只留一丝重量
      cx += (tx - cx) * 0.55;
      cy += (ty - cy) * 0.55;
      place();
      if (Math.abs(tx - cx) > 0.2 || Math.abs(ty - cy) > 0.2) raf = requestAnimationFrame(step);
      else raf = 0;
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(step); };

    const showLens = () => { if (!visible) { visible = true; lens.classList.add("show"); } };
    const hideLens = () => { if (visible) { visible = false; lens.classList.remove("show"); } };

    const track = (e) => {
      if (!on || !rect) return;
      tx = Math.min(rect.width, Math.max(0, e.clientX - rect.left));
      ty = Math.min(rect.height, Math.max(0, e.clientY - rect.top));
      if (!visible) { cx = tx; cy = ty; place(); showLens(); } // 首次出现不飞入
      kick();
    };

    const syncBtn = () => {
      loupeBtn.setAttribute("aria-pressed", String(on));
      loupeBtn.classList.toggle("is-on", on);
    };

    function setLoupe(next, e) {
      on = next;
      lbZoomOn = next;
      syncBtn();
      lbFrame.classList.toggle("lens-on", next);
      document.body.classList.toggle("lens-cursor", next); // 镜片激活时隐藏自定义光标
      if (next) {
        measure();
        if (e && e.clientX !== undefined) track(e);
      } else {
        hideLens();
        cancelAnimationFrame(raf); raf = 0;
      }
    }
    lbZoomToggle = (e) => setLoupe(!on, e);

    loupeBtn.addEventListener("click", () => setLoupe(!on));

    lbFrame.addEventListener("pointermove", track);
    lbFrame.addEventListener("pointerdown", track);
    lbFrame.addEventListener("pointerleave", hideLens);
    lbFrame.addEventListener("pointerenter", (e) => { if (on) { measure(); track(e); } });
    window.addEventListener("resize", () => { if (on) measure(); });
    lbImg.addEventListener("load", () => { if (on) measure(); });

    const hardReset = () => setLoupe(false);
    const _origRender = lbRender;
    lbRender = function (...args) { hardReset(); _origRender(...args); };
    const _origClose = lbClose;
    lbClose = function () { hardReset(); _origClose(); };

    // Z 键快捷切换
    document.addEventListener("keydown", (e) => {
      if (lb.hidden) return;
      if (e.key === "z" || e.key === "Z") setLoupe(!on);
    });
  })();

  // 图片 404：换成占位卡并撤销链接语义，灯箱里也跳过（error 不冒泡，用捕获）
  document.addEventListener("error", (e) => {
    const img = e.target;
    if (!(img instanceof HTMLImageElement)) return;
    const card = img.closest(".card");
    if (!card) return;
    const grp = card.dataset.lbGroup, idx = Number(card.dataset.lbIndex);
    if (grp && galleries[grp] && galleries[grp][idx]) galleries[grp][idx].dead = true;
    const fid = $(".fid", card) ? $(".fid", card).textContent : "ERR";
    const tmp = document.createElement("div");
    tmp.innerHTML = phHTML(2, fid);
    img.replaceWith(tmp.firstElementChild);
    card.classList.remove("is-link");
    ["tabindex", "role", "aria-label", "data-lb-group", "data-lb-index"].forEach((a) => card.removeAttribute(a));
  }, true);

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
    if (REDUCED || TOUCH) { marqueesDone = true; return; }
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
    resizeT = setTimeout(() => {
      if (REDUCED || TOUCH) return;
      // 视图隐藏时测不了宽度：标记为脏，等切回 portfolio 再重测
      if (portfolioVisible()) setupMarquees();
      else marqueesDone = false;
    }, 250);
  });

  /* ---------- portfolio render ---------- */
  function renderProjects() {
    const wrap = $("#projects");
    if (!wrap) return;
    wrap.innerHTML = PROJECTS.map((p, pi) => {
      const stateCls = p.state === "ACTIVE" ? " is-active" : p.state === "ARCHIVED" ? " is-archived" : "";
      const gallery = [];

      // 所有作品都进滚动条（不再拆 featured 大图）
      const cards = p.works.map((w, wi) => {
        const fileId = `F-${pad2(pi + 1)}${pad2(wi + 1)}`;
        const hasImg = w.src && String(w.src).trim() !== "";
        const lbIndex = hasImg ? gallery.length : wi;
        if (hasImg) gallery.push({ src: w.src, cap: `${w.title} / ${p.title}` });
        return cardHTML(w, fileId, `p-${pi}`, lbIndex, pi === 0 && wi < 4);
      }).join("");
      galleries[`p-${pi}`] = gallery;

      const pauseBtn = (REDUCED || TOUCH) ? "" :
        `<button class="strip-toggle mono" type="button" aria-label="Pause scrolling">PAUSE</button>`;

      const hasArt = p.works.some((w) => w.src && String(w.src).trim() !== "");

      return `<article class="project reveal${hasArt ? " has-art" : " is-empty"}" id="${esc(p.id)}">
        <header class="project-head">
          <span class="p-index mono">[${esc(p.id)}]</span>
          <h2 class="p-title">${esc(p.title)}<span class="p-zh" lang="ja">${esc(p.ja)}</span></h2>
          <div class="p-meta mono">
            <span>${esc(p.year)}</span><span>${AST}</span>
            <span>${esc(p.medium)}</span><span>${AST}</span>
            <span>${pad2(p.works.length)} FILES</span>
            <span class="chip${stateCls}">${esc(p.state)}</span>
            ${pauseBtn}
          </div>
        </header>
        ${cards ? `<div class="strip">
          <div class="track${pi % 2 ? " rev" : ""}">
            <div class="half">${cards}</div>
          </div>
        </div>` : ""}
      </article>`;
    }).join("");

    // 暂停按钮 + 触屏按住暂停 + 键盘焦点滚动模式
    $$(".project", wrap).forEach((art) => {
      const strip = $(".strip", art);
      const btn = $(".strip-toggle", art);
      if (!strip) return;
      let pinned = false;
      if (btn) {
        btn.addEventListener("click", () => {
          pinned = !pinned;
          btn.classList.toggle("is-on", pinned);
          btn.textContent = pinned ? "PLAY" : "PAUSE";
          btn.setAttribute("aria-label", pinned ? "Resume scrolling" : "Pause scrolling");
          strip.classList.toggle("is-paused", pinned);
        });
      }
      if (TOUCH) return; // 触屏：条本身可滑动，无需按住暂停/焦点复位
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
      // Tab 进入：停掉位移动画、把焦点卡片滚进视野；移出后复位
      strip.addEventListener("focusin", (e) => {
        if (!e.target.matches(":focus-visible")) return;
        strip.classList.add("kb");
        e.target.scrollIntoView({ block: "nearest", inline: "nearest" });
      });
      strip.addEventListener("focusout", (e) => {
        if (strip.contains(e.relatedTarget)) return;
        strip.classList.remove("kb");
        strip.scrollLeft = 0;
      });
    });

    // 离屏的条暂停动画，省合成开销
    if (!REDUCED && !TOUCH && "IntersectionObserver" in window) {
      const stripIO = new IntersectionObserver(
        (es) => es.forEach((en) => en.target.classList.toggle("is-offview", !en.isIntersecting)),
        { rootMargin: "60px" }
      );
      $$(".strip", wrap).forEach((s) => stripIO.observe(s));
    }

    // 图片加载完成后重新测量（load 不冒泡，用捕获）
    let loadT = 0;
    wrap.addEventListener("load", () => {
      clearTimeout(loadT);
      loadT = setTimeout(() => {
        if (REDUCED || TOUCH) return;
        if (portfolioVisible()) setupMarquees();
        else marqueesDone = false;
      }, 200);
    }, true);

    // stats（FILES = 作品集 + 速写档案 + fanart/委托，整站文件数）
    const files = PROJECTS.reduce((n, p) => n + p.works.length, 0) + SKETCHES.works.length + FANART.length;
    const sf = $("#statFiles"), sp = $("#statProjects");
    if (sf) sf.textContent = pad2(files);
    if (sp) sp.textContent = pad2(PROJECTS.length);
  }

  /* ---------- ticker ---------- */
  function renderTicker() {
    const t = $("#tickerTrack");
    if (!t) return;
    // 不与 hero 标签/统计行重复的词条（EST/SIGNAL 已在上方出现过）
    const words = [SITE.tagline, "文字と線の融合", SITE.name, "TEXT & LINE", `LOG_${new Date().getFullYear()}.TXT — WRITING`, "アーカイブ更新中"];
    const seq = words.map((w) =>
      `<span><span class="ast">${AST}</span> ${esc(w).replace(/✳︎?/g, AST)}</span>`
    ).join("");
    t.innerHTML = seq.repeat(4); // 偶数份 → translateX(-50%) 落在整数倍上无缝；4 份覆盖 ~2.7k 宽屏
  }

  /* ---------- sketch archive（ARCHIVE 页上半部分） ---------- */
  function renderSketches() {
    const grid = $("#sketchGrid");
    if (!grid) return;
    const gallery = [];
    grid.innerHTML = SKETCHES.works.map((w, i) => {
      const fileId = `SK-${pad2(i + 1)}`;
      const hasImg = w.src && String(w.src).trim() !== "";
      let lbIndex = i;
      if (hasImg) {
        lbIndex = gallery.length;
        gallery.push({ src: w.src, cap: `${w.title} / SKETCH ARCHIVE` });
      }
      return cardHTML(w, fileId, "sk", lbIndex);
    }).join("");
    galleries["sk"] = gallery;
    const ja = $("#sketchJa");
    if (ja) ja.textContent = SKETCHES.ja || "";
    const meta = $("#sketchMeta");
    if (meta) meta.innerHTML =
      `<span>${esc(SKETCHES.year)}</span><span>${AST}</span><span>${esc(SKETCHES.medium)}</span><span>${AST}</span><span>${pad2(SKETCHES.works.length)} FILES</span>`;
  }

  /* ---------- fan art & commission（ARCHIVE 页下半部分） ---------- */
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
      return cardHTML({ title: `${w.title} / ${w.fandom}`, src: w.src }, fileId, "fan", lbIndex);
    }).join("");
    galleries["fan"] = gallery;
    // 筛选结果播报给 SR
    const st = $("#fanartStatus");
    if (st) st.textContent = fanFilter === "ALL" ? `All · ${list.length} works` : `${fanFilter} · ${list.length} works`;
  }
  // hash 参数 → 筛选状态（#fanart/FANDOM%20B 深链接、前进后退）
  function syncFanFilter(param) {
    const valid = new Set(FANART.map((w) => w.fandom));
    const next = param && valid.has(param) ? param : "ALL";
    if (next === fanFilter) return;
    fanFilter = next;
    const bar = $("#fanartFilters");
    if (bar) {
      $$(".fbtn", bar).forEach((x) => {
        const on = x.dataset.f === fanFilter;
        x.classList.toggle("is-on", on);
        x.setAttribute("aria-pressed", String(on));
      });
    }
    renderFanart();
  }
  function renderFanartFilters() {
    const bar = $("#fanartFilters");
    if (!bar) return;
    const fandoms = ["ALL", ...new Set(FANART.map((w) => w.fandom))];
    const meta = $("#fanMeta");
    if (meta) meta.innerHTML =
      `<span>${fandoms.length - 1} TAGS</span><span>${AST}</span><span>${pad2(FANART.length)} FILES</span>`;
    bar.innerHTML = fandoms.map((f) =>
      `<button class="fbtn${f === fanFilter ? " is-on" : ""}" aria-pressed="${f === fanFilter}" data-f="${esc(f)}">${esc(f)}</button>`
    ).join("");
    $$(".fbtn", bar).forEach((b) =>
      b.addEventListener("click", () => {
        fanFilter = b.dataset.f;
        // 筛选进 URL（replaceState 不污染历史、不触发 hashchange）
        history.replaceState(null, "", fanFilter === "ALL" ? "#fanart" : "#fanart/" + encodeURIComponent(fanFilter));
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
  // 档案日志块：period 左轨 | 主体（大字标题/角色/简述）| 幽灵编号右侧
  function logRowHTML(r, i) {
    const d = Math.min(i * 70, 350);
    return `<article class="xp reveal" style="--d:${d}ms">
      <div class="xp-when mono">
        <span class="xp-period">${esc(r.period || "")}</span>
        ${r.chip ? `<span class="chip${r.chipCls || ""}">${esc(r.chip)}</span>` : ""}
      </div>
      <div class="xp-main">
        <h3 class="xp-co">${esc(r.title)}</h3>
        ${r.sub ? `<p class="xp-role mono">${esc(r.sub)}</p>` : ""}
        ${r.note ? `<p class="xp-note mono">${esc(r.note)}</p>` : ""}
      </div>
      <span class="xp-num" aria-hidden="true">${pad2(i + 1)}</span>
    </article>`;
  }

  function renderAbout() {
    const bm = $("#bioMain"), bd = $("#bioDeco");
    if (bm) {
      // 关键短语点亮：基调灰 + 亮白焦点（先转义再替换，短语本身不含特殊字符时安全）
      let html = esc(ABOUT.bio);
      (ABOUT.bioHighlights || []).forEach((p) => {
        const e = esc(p);
        html = html.split(e).join(`<em class="hi">${e}</em>`);
      });
      bm.innerHTML = html;
    }
    if (bd) bd.innerHTML = esc(ABOUT.bioDeco).replace(/✳︎?/g, AST);

    const sb = $("#statBand");
    if (sb && ABOUT.highlights && ABOUT.highlights.length) {
      sb.innerHTML = ABOUT.highlights.map((h, i) =>
        `<div class="stat reveal" style="--d:${i * 80}ms">
          <span class="stat-n" data-scramble-io>${esc(h.n)}</span>
          <span class="stat-l mono">${esc(h.label)}</span>
        </div>`
      ).join("");
    }

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
      xl.innerHTML = ABOUT.experience.map((x, i) =>
        logRowHTML({ period: x.period, chip: x.tag, title: x.company, sub: x.role, note: x.note }, i)
      ).join("");
    }

    const ed = $("#eduBlock");
    if (ed && ABOUT.education) {
      const e = ABOUT.education;
      ed.innerHTML = logRowHTML({ period: e.period, title: e.school, sub: e.degree }, 0);
    }

    const aw = $("#awardList");
    if (aw) {
      aw.innerHTML = ABOUT.awards.map((a, i) =>
        logRowHTML({ period: a.period, chip: a.detail, chipCls: " is-active", title: a.title, sub: a.sub, note: a.note }, i)
      ).join("");
    }

    const sl = $("#skillList");
    if (sl) {
      sl.innerHTML = ABOUT.skills.map((s, i) =>
        `<span class="skill-chip mono reveal" style="--d:${Math.min(i * 45, 400)}ms">${esc(s)}</span>`
      ).join("");
    }

    const ll = $("#linkList");
    if (ll) {
      ll.innerHTML = ABOUT.links.map((l) => {
        const u = String(l.url || "").trim();
        if (!u || u === "#") {
          return `<span class="dead" title="Link coming soon">${esc(l.label)}</span>`;
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
    const isInitial = currentView === null;
    currentView = name;
    $$(".view").forEach((v) => v.classList.toggle("is-active", v.id === `view-${name}`));
    $$(".tab").forEach((t) => {
      const on = t.dataset.view === name;
      t.classList.toggle("is-active", on);
      if (on) t.setAttribute("aria-current", "page");
      else t.removeAttribute("aria-current");
    });
    if (push && location.hash.slice(1) !== name) location.hash = name;
    // 路由名 fanart 保留（深链接兼容），展示名是 ARCHIVE
    const viewLabel = name === "fanart" ? "ARCHIVE" : name.toUpperCase();
    document.title = name === "portfolio"
      ? `${SITE.name} (${SITE.heroName}) ${AST} VISUAL ARCHIVE`
      : `${viewLabel} — ${SITE.name} (${SITE.heroName}) ${AST} VISUAL ARCHIVE`;
    // 切换后把焦点放到新视图标题：SR 收到上下文，Tab 从头开始
    if (!isInitial) {
      const target = $(`#view-${name} [data-scramble]`) || $(`#view-${name} h1`) || $(`#view-${name}`);
      if (target) {
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      }
    }
    window.scrollTo({ top: 0, behavior: REDUCED || isInitial ? "auto" : "smooth" });
    const title = $(`#view-${name} [data-scramble]`);
    if (title) scramble(title);
    if (name === "portfolio" && !REDUCED && !TOUCH && !marqueesDone) requestAnimationFrame(setupMarquees);
    observeReveals();
    observeScrambles();
  }
  // hash 是唯一路由来源：tab 是真链接，点击只改 hash，这里统一处理。
  // 非视图 hash（如 skip-link 的 #main）交还浏览器原生锚点行为。
  function applyHash() {
    const [view, param] = location.hash.slice(1).split("/");
    if (!VIEWS.includes(view)) return false;
    if (lb && !lb.hidden) lbClose(); // 前进/后退时先关灯箱
    if (view === "fanart") syncFanFilter(param ? decodeURIComponent(param) : "");
    switchView(view, false);
    return true;
  }
  $(".brand").addEventListener("click", (e) => { e.preventDefault(); switchView("portfolio"); });
  window.addEventListener("hashchange", applyHash);

  /* ---------- scroll reveals ---------- */
  let revealObserver = null;
  function observeReveals() {
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

  /* ---------- 进入视野时乱码定格（一次性，FUI 解码感） ---------- */
  let scrambleObserver = null;
  function observeScrambles() {
    if (!("IntersectionObserver" in window)) return;
    if (!scrambleObserver) {
      scrambleObserver = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            scramble(en.target);
            scrambleObserver.unobserve(en.target);
          }
        });
      }, { threshold: 0.4 });
    }
    $$("[data-scramble-io]:not(.scr-seen)").forEach((el) => {
      el.classList.add("scr-seen");
      scrambleObserver.observe(el);
    });
  }

  /* ---------- 自定义光标：FUI 菱形准星 ----------
     白点 1:1 跟手 + 菱形细框拖尾跟随；
     悬停可点元素时菱形转正放大成方框（呼应卡片四角准星），按下收缩 */
  (() => {
    if (TOUCH || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const cur = document.createElement("div");
    cur.className = "cursor";
    cur.setAttribute("aria-hidden", "true");
    cur.innerHTML = `<span class="c-dot"></span><span class="c-ring"></span>`;
    document.body.appendChild(cur);
    document.body.classList.add("has-cursor");
    const dot = cur.firstElementChild, ring = cur.lastElementChild;
    let tx = -100, ty = -100, rx = -100, ry = -100, raf = 0, seen = false;
    const step = () => {
      rx += (tx - rx) * 0.28;
      ry += (ty - ry) * 0.28;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
      if (Math.abs(tx - rx) > 0.2 || Math.abs(ty - ry) > 0.2) raf = requestAnimationFrame(step);
      else raf = 0;
    };
    const onMove = (e) => {
      tx = e.clientX; ty = e.clientY;
      dot.style.transform = `translate3d(${tx}px, ${ty}px, 0) translate(-50%, -50%)`;
      if (!seen) { seen = true; rx = tx; ry = ty; }
      cur.classList.add("on"); // 每次移动都强制可见（黏性，杜绝偶发消失）
      const t = e.target;
      const hot = t && t.closest && t.closest("a, button, [role='button'], .card.is-link, input, textarea, summary, label");
      cur.classList.toggle("hot", !!hot);
      if (!raf) raf = requestAnimationFrame(step);
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerdown", (e) => { cur.classList.add("down"); onMove(e); }, { passive: true });
    document.addEventListener("pointerup", () => cur.classList.remove("down"), { passive: true });
    // 只在真正离开窗口 / 失焦时隐藏
    document.addEventListener("mouseleave", () => cur.classList.remove("on"));
    window.addEventListener("blur", () => cur.classList.remove("on"));
  })();

  /* ---------- init ---------- */
  applySite();
  renderProjects();
  renderTicker();
  renderSketches();
  renderFanartFilters();
  renderFanart();
  renderAbout();
  if (!applyHash()) switchView("portfolio", false);
  if (!bootShown) heroIntro(); // 无 boot 动画（回访/REDUCED）时立即跑 hero 入场
})();
