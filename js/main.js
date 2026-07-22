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

  /* about 卡时区时钟：SAV / SHA / TYO 真实当地时间，30s 刷新 */
  const tzBoxes = $$("#tzClocks .clockbox[data-tz]");
  if (tzBoxes.length) {
    const tzTime = (tz) => {
      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: tz, hour: "numeric", minute: "numeric", hour12: false,
      }).formatToParts(new Date());
      const get = (t) => +parts.find((p) => p.type === t).value;
      return { h: get("hour") % 12, m: get("minute"), hh24: get("hour") };
    };
    const setClocks = () => {
      tzBoxes.forEach((box) => {
        const { h, m, hh24 } = tzTime(box.dataset.tz);
        const hh = $(".hand.hh", box);
        const mh = $(".hand.mh", box);
        if (hh) hh.style.transform = `rotate(${h * 30 + m * 0.5}deg)`;
        if (mh) mh.style.transform = `rotate(${m * 6}deg)`;
        const label = $(".clk-l", box);
        if (label) box.setAttribute("aria-label", `${label.textContent} ${pad2(hh24)}:${pad2(m)}`);
      });
    };
    setClocks();
    setInterval(setClocks, 30000);
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

    // 每态一个外框形状：胶囊 / 切角 / 六边 / 直角（pathLength 统一，入场描画动画不受周长影响）
    const OUTLINES = {
      capsule: "M71 10 H689 A65 65 0 0 1 689 140 H71 A65 65 0 0 1 71 10 Z",
      cut:     "M30 10 H730 L754 34 V116 L730 140 H30 L6 116 V34 Z",
      hex:     "M46 10 H714 L754 75 L714 140 H46 L6 75 Z",
      rect:    "M6 10 H754 V140 H6 Z",
    };

    const PILL_STATES = [
      { // 01 — IDENT / 在读状态（参考图1布局）
        aria: "SCAD Illustration, Concept Design concentration, 2023–2026",
        outline: OUTLINES.capsule,
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
      { // 02 — SIGNAL：滚动波形监视（纯装饰，简历事实在 About 页）
        aria: "Decorative readout: signal waveform monitor",
        outline: OUTLINES.cut,
        svg: `
          <defs><clipPath id="wvclip"><rect x="246" y="36" width="322" height="78"/></clipPath></defs>
          <text x="58" y="50" class="svgmono svgdim">CH-02 · FEED</text>
          <text x="58" y="104" class="svgbig">SIGNAL</text>
          <g clip-path="url(#wvclip)"><g transform="translate(250,76)">
            <polyline class="ln" points="0,0 18,-16 36,0 54,10 72,0 90,-24 108,0 126,14 144,0 162,-8 180,0 198,-20 216,0 234,12 252,0 270,-26 288,0 306,8 324,0 342,-16 360,0 378,-16 396,0 414,10 432,0 450,-24 468,0 486,14 504,0 522,-8 540,0 558,-20 576,0 594,12 612,0 630,-26 648,0 666,8 684,0 702,-16 720,0"/>
            ${REDUCED ? "" : `<animateTransform attributeName="transform" type="translate" additive="sum" values="0 0; -360 0" dur="8s" repeatCount="indefinite"/>`}
          </g></g>
          <text x="592" y="60" class="svgmono">PEAK 0.92</text>
          <text x="592" y="92" class="svgmono svgdim">NOISE .03</text>`,
      },
      { // 03 — RADAR：近距扫描（纯装饰）
        aria: "Decorative readout: proximity radar sweep",
        outline: OUTLINES.hex,
        svg: `
          <text x="58" y="50" class="svgmono svgdim">CH-03 · SCAN</text>
          <text x="58" y="104" class="svgbig">RADAR</text>
          <circle cx="400" cy="75" r="46" class="ln"/>
          <circle cx="400" cy="75" r="30" class="ln dotted"/>
          <circle cx="400" cy="75" r="14" class="ln"/>
          <line x1="354" y1="75" x2="446" y2="75" class="ln svgdim"/>
          <line x1="400" y1="29" x2="400" y2="121" class="ln svgdim"/>
          <g><line x1="400" y1="75" x2="446" y2="75" class="ln"/>${rot(400, 75, 5)}</g>
          <circle cx="382" cy="58" r="3.5" class="fillw">${REDUCED ? "" : `<animate attributeName="opacity" values="1;0.1;1" dur="1.6s" repeatCount="indefinite"/>`}</circle>
          <circle cx="421" cy="92" r="3.5" class="fillw">${REDUCED ? "" : `<animate attributeName="opacity" values="1;0.1;1" dur="2.3s" begin="0.5s" repeatCount="indefinite"/>`}</circle>
          <circle cx="410" cy="49" r="3.5" class="fillw">${REDUCED ? "" : `<animate attributeName="opacity" values="1;0.1;1" dur="1.9s" begin="1s" repeatCount="indefinite"/>`}</circle>
          <text x="520" y="60" class="svgmono">CONTACTS 03</text>
          <text x="520" y="92" class="svgmono svgdim">RANGE 4.6KM</text>`,
      },
      { // 04 — COORD：遥测坐标 + 漂移标记（纯装饰）
        aria: "Decorative readout: telemetry coordinates",
        outline: OUTLINES.rect,
        svg: `
          <text x="58" y="50" class="svgmono svgdim">CH-04 · TRACK</text>
          <text x="58" y="104" class="svgbig">COORD</text>
          <path d="M300 50 V38 H312" class="ln"/><path d="M462 38 H480 V50" class="ln"/>
          <path d="M480 100 V112 H468" class="ln"/><path d="M312 112 H300 V100" class="ln"/>
          <line x1="384" y1="75" x2="396" y2="75" class="ln"/>
          <line x1="390" y1="69" x2="390" y2="81" class="ln"/>
          <rect x="308" y="70" width="6" height="6" class="fillw">${REDUCED ? "" : `<animateTransform attributeName="transform" type="translate" values="0 0; 96 22; 40 -18; 130 6; 0 0" dur="12s" repeatCount="indefinite"/>`}</rect>
          <text x="560" y="52" class="svgmono">X +132.44</text>
          <text x="560" y="80" class="svgmono">Y -007.19</text>
          <text x="560" y="108" class="svgmono svgdim">Z +004.02</text>
          <rect x="690" y="44" width="7" height="7" class="fillw">${REDUCED ? "" : `<animate attributeName="opacity" values="1;0.15;1" dur="1.4s" repeatCount="indefinite"/>`}</rect>
          <rect x="690" y="70" width="7" height="7" class="fillw">${REDUCED ? "" : `<animate attributeName="opacity" values="1;0.15;1" dur="1.4s" begin="0.45s" repeatCount="indefinite"/>`}</rect>
          <rect x="690" y="96" width="7" height="7" class="fillw">${REDUCED ? "" : `<animate attributeName="opacity" values="1;0.15;1" dur="1.4s" begin="0.9s" repeatCount="indefinite"/>`}</rect>`,
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
        const ol = $("#pillOutline");
        if (ol && st.outline) ol.setAttribute("d", st.outline);   // 外框形状随状态变
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
  /* ---------- 图片懒加载：img[data-src] 近视口才真正加载 ---------- */
  const lazyIO = "IntersectionObserver" in window
    ? new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          const img = en.target;
          if (img.dataset.src) { img.src = img.dataset.src; img.removeAttribute("data-src"); }
          img.classList.remove("lazyimg");
          lazyIO.unobserve(img);
        });
      }, { rootMargin: "200px 400px" })   // 竖向提前 200px、横向(marquee)提前 400px
    : null;
  function observeLazy(root) {
    const imgs = $$("img[data-src]", root || document);
    if (!lazyIO) { imgs.forEach((i) => { i.src = i.dataset.src; i.removeAttribute("data-src"); }); return; }
    imgs.forEach((i) => lazyIO.observe(i));
  }

  function cardHTML(work, fileId, lbGroup, lbIndex, eager) {
    const hasImg = work.src && String(work.src).trim() !== "";
    const dims = work.w && work.h ? ` width="${Number(work.w)}" height="${Number(work.h)}"` : "";
    // 首屏可见的图直接加载；其余用 data-src + IntersectionObserver 懒加载（近视口才拉）
    const imgTag = eager
      ? `<img src="${esc(work.src)}" alt="${esc(work.title)}"${dims} decoding="async" loading="eager" fetchpriority="high" />`
      : `<img data-src="${esc(work.src)}" alt="${esc(work.title)}"${dims} decoding="async" class="lazyimg" />`;
    const inner = hasImg ? imgTag : phHTML(lbIndex, fileId);
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
  // 长按取景是自定义手势：禁掉系统长按菜单（iOS 复制/存储、Android contextmenu）
  if (lb) lb.addEventListener("contextmenu", (e) => e.preventDefault());
  const galleries = {}; // group -> [{src, cap}]
  let lbState = { group: null, index: 0, lastFocus: null };
  let lbRestoringFocus = false; // 灯箱关闭还焦点时为真：strip 的 kb 模式要忽略这次 focusin
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
  let lbSwapT = 0;       // 未完成的换图定时器：新一次翻页/关闭时取消
  let lbRenderSeq = 0;   // 渲染序号：只有最新一次换图允许落地
  let lbFullToken = 0;
  let lbObjURL = null;     // 当前原图的 blob URL，切图/关闭时释放
  let lbLoadTimer = 0;
  const stillOn = (it) => {
    const items = galleries[lbState.group];
    return items && items[lbState.index] === it;
  };
  function showLoadingBar(frac, txt) {
    const el = $("#lbLoading"); if (!el) return;
    el.classList.add("show");
    const fill = $("#lbLoadingFill"); if (fill) fill.style.width = `${Math.round(frac * 100)}%`;
    const t = $("#lbLoadingText"); if (t && txt) t.textContent = txt;
  }
  function hideLoadingBar() {
    clearTimeout(lbLoadTimer);
    const el = $("#lbLoading"); if (el) el.classList.remove("show");
  }
  // 渐进升级：先显缩略图(it.src)，再用 fetch 带进度加载原图(it.full)，
  // 完成且仍停在同一张时无缝换上。token 防止快速翻页换错图。
  async function upgradeToFull(it) {
    if (!it.full || it.full === it.src) return;
    const token = ++lbFullToken;
    hideLoadingBar();
    // 延迟 180ms 再显示进度条：缓存命中时秒回，不闪
    clearTimeout(lbLoadTimer);
    lbLoadTimer = setTimeout(() => { if (token === lbFullToken) showLoadingBar(0, "LOADING"); }, 180);
    try {
      const resp = await fetch(it.full);
      if (token !== lbFullToken || !resp.ok || !resp.body) throw 0;
      const total = +(resp.headers.get("content-length") || 0);
      const reader = resp.body.getReader();
      const chunks = []; let received = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        if (token !== lbFullToken) { try { reader.cancel(); } catch (e) {} return; }
        chunks.push(value); received += value.length;
        if (total) {
          const pct = received / total;
          showLoadingBar(pct, `LOADING ${Math.round(pct * 100)}% · ${(received / 1048576).toFixed(1)}/${(total / 1048576).toFixed(1)}MB`);
        }
      }
      if (token !== lbFullToken || !stillOn(it)) { hideLoadingBar(); return; }
      const url = URL.createObjectURL(new Blob(chunks));
      if (lbObjURL) URL.revokeObjectURL(lbObjURL);
      lbObjURL = url;
      lbImg.src = url;              // 换成原图；同尺寸显示，变清晰
      hideLoadingBar();
    } catch (e) {
      if (token !== lbFullToken) return;
      hideLoadingBar();
      if (stillOn(it)) lbImg.src = it.full;   // 回退：让浏览器自己加载
    }
  }
  function lbRender(instant, dir = 1) {
    const items = galleries[lbState.group];
    const it = items[lbState.index];
    lbCap.innerHTML = `FILE: <em>${esc(it.cap)}</em>`;
    const cnt = $("#lbCount");
    if (cnt) cnt.textContent = `${pad2(lbState.index + 1)} / ${pad2(items.length)}`;
    const pf = $("#lbProgressFill");
    if (pf) pf.style.width = `${((lbState.index + 1) / items.length) * 100}%`;
    lbFullToken++;                               // 让上一张未完成的升级作废
    const seq = ++lbRenderSeq;
    clearTimeout(lbSwapT);                       // 上一次换图还没落地就作废
    if (instant) {
      lbImg.src = it.src;
      lbImg.alt = it.cap;
      lbImg.style.opacity = "1";
      lbImg.style.transform = "";
      upgradeToFull(it);
      return;
    }
    // 正常加载过渡：淡出 → 换图 → 淡入。
    // 不再用"过渡中丢弃翻页"的锁 —— 连续快速滑动每一下都响应，
    // seq 保证乱序的 load 回调不会把旧图/旧透明度写回来。
    lbImg.style.transition = "opacity 0.18s ease";
    lbImg.style.transform = "";
    lbImg.style.opacity = "0";
    const swap = () => {
      if (seq !== lbRenderSeq) return;
      lbImg.src = it.src;
      lbImg.alt = it.cap;
      let entered = false;
      const enter = () => {
        if (entered || seq !== lbRenderSeq) return;
        entered = true;
        lbImg.style.opacity = "1";
        upgradeToFull(it);                       // 缩略图淡入后再升级高清
      };
      if (lbImg.complete) enter();
      else {
        lbImg.addEventListener("load", enter, { once: true });
        lbImg.addEventListener("error", enter, { once: true });
      }
    };
    lbSwapT = setTimeout(swap, 170);
  }
  function lbNav(dir) {
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
    // ESC 关灯箱是键盘输入，还焦点会命中 :focus-visible，
    // 误触发 strip 的 kb 模式把 marquee 永久冻住 —— 标记跳过
    lbRestoringFocus = true;
    const f = lbState.lastFocus;
    if (f && f.isConnected && f.offsetParent !== null) f.focus({ preventScroll: true });
    else { const t = $(".tab.is-active"); if (t) t.focus({ preventScroll: true }); }
    lbRestoringFocus = false;
    lbFullToken++;            // 中止进行中的原图下载
    lbRenderSeq++;            // 作废未落地的换图，防止关闭后旧 swap 再写 src
    clearTimeout(lbSwapT);
    hideLoadingBar();
    clearTimeout(lbHideT);
    lbHideT = setTimeout(() => {
      lb.hidden = true; lbImg.src = "";
      if (lbObjURL) { URL.revokeObjectURL(lbObjURL); lbObjURL = null; }
    }, 240);
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
      // 手机布局用按住放大（见 lb-zoomview 模块），点击不开桌面镜片
      if (window.matchMedia("(max-width: 860px)").matches) return;
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
    let Z = 3.5;                       // 当前倍率（滚轮可调）
    const ZMIN = 2, ZMAX = 6, R = 180; // 倍率限位 2–6×；镜片半径 180px（镜片 360px）

    // 首次进入灯箱的放大镜引导提示（每次页面加载只提示一次）
    const magHint = $("#lbMagHint");
    let magHintDone = false, magHintT = 0;
    const hideMagHint = () => { if (magHint) { clearTimeout(magHintT); magHint.classList.remove("show"); } };
    let on = false, raf = 0, rect = null, visible = false;
    let cx = 0, cy = 0, tx = 0, ty = 0;

    const lensSrc = $("#lbLensSrc");
    const measure = () => {
      rect = lbImg.getBoundingClientRect();
      if (lensSrc) {
        const want = lbImg.currentSrc || lbImg.src;
        if (lensSrc.src !== want) lensSrc.src = want;  // 只在换图时重设，避免重复加载
        lensSrc.style.width = `${rect.width * Z}px`;    // 高度 auto 保持比例；仅缩放时触发
      }
    };
    // 全部用 transform 定位（GPU 合成，不重绘）：镜片 + 镜内放大画面同步平移
    const place = () => {
      lens.style.transform = `translate3d(${cx - R}px, ${cy - R}px, 0)`;
      if (lensSrc) lensSrc.style.transform = `translate3d(${R - cx * Z}px, ${R - cy * Z}px, 0)`;
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

    const zoomLabel = () => `${Z.toFixed(1).replace(/\.0$/, "")}×`;
    const syncZoomUI = () => {
      const num = $("#lbLensZoomNum"), arc = $("#lbHudArc"),
            fac = $("#lbZoomFactor"), hint = $("#lbHint");
      if (num) num.textContent = zoomLabel();
      if (arc) arc.style.strokeDashoffset = `${100 * (1 - (Z - ZMIN) / (ZMAX - ZMIN))}`;
      if (fac) fac.textContent = zoomLabel();
      if (hint) hint.textContent = on
        ? `WHEEL: ${zoomLabel()} (${ZMIN}–${ZMAX}×) ✳︎ CLICK TO EXIT`
        : "CLICK IMAGE TO MAGNIFY ✳︎ WHEEL TO ZOOM";
    };

    function setLoupe(next, e) {
      on = next;
      lbZoomOn = next;
      syncBtn();
      syncZoomUI();
      lbFrame.classList.toggle("lens-on", next);
      document.body.classList.toggle("lens-cursor", next); // 镜片激活时隐藏自定义光标
      if (next) {
        hideMagHint();
        measure();
        if (e && e.clientX !== undefined) track(e);
      } else {
        hideLens();
        cancelAnimationFrame(raf); raf = 0;
      }
    }
    lbZoomToggle = (e) => setLoupe(!on, e);

    loupeBtn.addEventListener("click", () => setLoupe(!on));

    lbFrame.addEventListener("wheel", (e) => {
      if (!on) return;
      e.preventDefault(); // 镜片激活时滚轮调倍率，不滚页面
      Z = Math.min(ZMAX, Math.max(ZMIN, Z + (e.deltaY < 0 ? 0.5 : -0.5)));
      measure();
      place();
      syncZoomUI();
    }, { passive: false });
    lbFrame.addEventListener("pointermove", track);
    lbFrame.addEventListener("pointerdown", track);
    lbFrame.addEventListener("pointerleave", hideLens);
    lbFrame.addEventListener("pointerenter", (e) => {
      if (on) { measure(); track(e); return; }
      // 放大镜关闭时：首次进入弹出引导提示（跟随光标位置）
      if (magHintDone || !magHint) return;
      magHintDone = true;
      magHint.style.left = `${e.clientX}px`;
      magHint.style.top = `${e.clientY}px`;
      magHint.classList.add("show");
      clearTimeout(magHintT);
      magHintT = setTimeout(hideMagHint, 2800);
    });
    lbFrame.addEventListener("pointerdown", hideMagHint, { passive: true });
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
    observeLazy(track);   // 复制出来的克隆图也挂懒加载
    return true;
  }
  function setupMarquees() {
    if (REDUCED || TOUCH) { marqueesDone = true; return; }
    let ok = true;
    $$("#projects .strip").forEach((s) => { if (!fillStrip(s)) ok = false; });
    marqueesDone = ok;
  }

  /* ---------- 触屏自动滚动 ----------
     桌面用 CSS transform marquee；触屏改成原生 overflow-x 滑动 + 这里的慢速
     scrollLeft 自增，保留手动滑动的同时也会自己走。
     暂停判定用 touch 事件而不是 pointer 事件：浏览器接管滚动手势后
     pointerup 不会再来（只有 pointercancel），touchend 却始终会派发。
     手指还按着 / 滚动未静止（含惯性）期间绝不写 scrollLeft ——
     iOS 上手势进行中写 scrollLeft 会直接杀掉当前手势，表现为拖不动、卡住。
     复制一份内容做无缝循环；离屏 / 不在作品页时不滚，省电。 */
  function setupTouchAutoScroll() {
    $$("#projects .strip").forEach((strip) => {
      const track = $(".track", strip);
      const half = track && $(".half", track);
      if (!track || !half) return;
      if (!track.dataset.dup) {        // 复制一份用于无缝回卷（幂等）
        const clone = half.cloneNode(true);
        clone.setAttribute("aria-hidden", "true");
        $$("[tabindex]", clone).forEach((el) => el.removeAttribute("tabindex"));
        track.appendChild(clone);
        track.dataset.dup = "1";
        observeLazy(track);   // 克隆图懒加载
      }

      // 手指跟踪：只记"从这条 strip 上开始"的触点 id（touch 事件全程
      // 派发给起点元素）。不用 e.touches.length —— 那是全屏计数，
      // 双指缩放时另一根手指不在 strip 上，计数会永久卡在 >0。
      const fingers = new Set();
      let lastInput = 0, onView = true;
      strip.addEventListener("touchstart", (e) => {
        for (const t of e.changedTouches) fingers.add(t.identifier);
        lastInput = performance.now();
      }, { passive: true });
      const endTouch = (e) => {
        for (const t of e.changedTouches) fingers.delete(t.identifier);
        lastInput = performance.now();
      };
      strip.addEventListener("touchend", endTouch, { passive: true });
      strip.addEventListener("touchcancel", endTouch, { passive: true });

      if ("IntersectionObserver" in window) {
        new IntersectionObserver(
          (es) => es.forEach((en) => { onView = en.isIntersecting; }),
          { rootMargin: "60px" }
        ).observe(strip);
      }

      // 用户滚动检测不监听 scroll 事件：iOS 对程序写入的 scroll 事件
      // 派发时机不可控，自动滚动会把自己的事件当成用户输入而自我饿死。
      // 改为每帧比对 scrollLeft 与上一帧位置的漂移（惯性/拖动都会漂移）。
      // posF 是浮点镜像：每帧 +0.5px 的写入在整数取整的实现下会丢步。
      let last = 0, posF = -1;
      const tick = (t) => {
        const dt = last ? t - last : 0; last = t;
        const cur = strip.scrollLeft;
        if (posF < 0) posF = cur;
        if (Math.abs(cur - posF) > 1.5) lastInput = t;   // 不是我们写的移动
        const idle = fingers.size === 0 && t - lastInput > 1500;
        if (idle && onView && dt < 100 && portfolioVisible()) {
          posF += dt * 0.03;                        // ~30px/s，与桌面一致
          const wrap = half.offsetWidth;
          if (wrap > 0 && posF >= wrap) posF -= wrap;
          strip.scrollLeft = posF;
        } else {
          posF = cur;                               // 非自动期间跟随实际位置
        }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }
  function portfolioVisible() {
    const v = $("#view-portfolio");
    return v && v.classList.contains("is-active");
  }

  /* ---------- 桌面拖拽检索 ----------
     鼠标按住作品条左右拖动翻看。原理：按下时读出 marquee 当前位移，
     切换成滚动容器并用 scrollLeft 复现同一画面（.dragging 类）；
     拖动中利用克隆半区做无缝回卷；松手把 scrollLeft 换算回 marquee
     相位（负 animation-delay），从当前位置无缝续播。 */
  function setupStripDrag(strip) {
    const track = $(".track", strip);
    const half = track && $(".half", track);
    if (!track || !half) return;
    let dragging = false, moved = false, startX = 0, startSL = 0;
    // 原生图片拖拽会抢走 scrub 手势
    strip.addEventListener("dragstart", (e) => e.preventDefault());
    strip.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      dragging = true; moved = false;
      startX = e.clientX;
      const tr = getComputedStyle(track).transform;
      const offset = tr && tr !== "none" ? -new DOMMatrixReadOnly(tr).e : 0;
      strip.classList.add("dragging");    // animation:none + overflow-x:auto
      // kb（键盘滚动）模式下本来就是 scrollLeft 布局，位置直接沿用
      if (!REDUCED && !strip.classList.contains("kb")) strip.scrollLeft = offset;
      startSL = strip.scrollLeft;         // clamp 后的实际落点
      // 注意：这里不能 setPointerCapture —— capture 会让后续 click
      // 重定向到 strip 本身，卡片点击（灯箱）就全失效了。
      // 真正开始拖动（越过阈值）后才在 pointermove 里捕获。
    });
    strip.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 4) {
        moved = true;
        try { strip.setPointerCapture(e.pointerId); } catch { /* 老浏览器 */ }
      }
      let sl = startSL - dx;
      const hw = half.offsetWidth;
      // 有克隆半区（周期 = hw）才能无缝回卷；基准同步平移避免跳变
      if (hw > 0 && $(".half[aria-hidden]", track)) {
        if (sl < 30) { sl += hw; startSL += hw; }
        else if (sl > hw + 30) { sl -= hw; startSL -= hw; }
      }
      strip.scrollLeft = sl;
    });
    const end = () => {
      if (!dragging) return;
      dragging = false;
      if (!REDUCED && !strip.classList.contains("kb")) {
        const hw = half.offsetWidth;
        // 不能读 computed animationDuration：.dragging 的 animation:none
        // 会把它重置为 0s —— 直接读 fillStrip 写入的 --dur
        const dur = parseFloat(track.style.getPropertyValue("--dur")) || 60;
        if (hw > 0) {
          const frac = (strip.scrollLeft % hw) / hw;
          const p = track.classList.contains("rev") ? 1 - frac : frac;
          // 移除 .dragging 会重启动画：负 delay 让新实例直接从相位 p 开始
          track.style.animationDelay = `${(-p * dur).toFixed(3)}s`;
        }
        strip.scrollLeft = 0; // kb / REDUCED 模式保持 scrollLeft 布局，不归零
      }
      strip.classList.remove("dragging");
    };
    strip.addEventListener("pointerup", end);
    strip.addEventListener("pointercancel", end);
    // 兜底：越过阈值前尚未 capture，指针移出条外松手时 strip 收不到
    // pointerup，.dragging 会卡住冻结 marquee —— window 层必收
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    // 拖过就吞掉随之而来的 click：松手不应打开灯箱（捕获期先于 document 委托）
    strip.addEventListener("click", (e) => {
      if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; }
    }, true);
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
        if (hasImg) gallery.push({ src: w.src, full: w.full, cap: `${w.title} / ${p.title}` });
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
      setupStripDrag(strip); // 桌面：鼠标按住拖动检索
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
        if (lbRestoringFocus || !e.target.matches(":focus-visible")) return;
        strip.classList.add("kb");
        e.target.scrollIntoView({ block: "nearest", inline: "nearest" });
      });
      strip.addEventListener("focusout", (e) => {
        if (strip.contains(e.relatedTarget)) return;
        strip.classList.remove("kb");
        strip.scrollLeft = 0;
      });
    });

    // 触屏：原生滑动 + 慢速自动滚动
    if (TOUCH && !REDUCED) setupTouchAutoScroll();

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

    observeLazy(wrap);   // 挂懒加载：仅近视口的缩略图才真正下载

    // stats（FILES = 作品集 + fanart/委托，整站文件数）
    const files = PROJECTS.reduce((n, p) => n + p.works.length, 0) + FANART.length;
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


  /* ---------- archive（fan art / commission / original） ---------- */
  let fanFilter = "ALL";
  // 筛选维度是作品类型 cat（一个维度）；圈名 fandom 只留在卡片标注里
  function fanCats() {
    const counts = new Map();
    FANART.forEach((w) => counts.set(w.cat, (counts.get(w.cat) || 0) + 1));
    // 数量多的在前，同数保持数据顺序
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([cat, n]) => ({ cat, n }));
  }
  function renderFanart() {
    const grid = $("#fanartGrid");
    if (!grid) return;
    const list = FANART.filter((w) => fanFilter === "ALL" || w.cat === fanFilter);
    const gallery = [];
    grid.innerHTML = list.map((w, i) => {
      const fileId = `FA-${pad2(i + 1)}`;
      const hasImg = w.src && String(w.src).trim() !== "";
      let lbIndex = i;
      if (hasImg) {
        lbIndex = gallery.length;
        gallery.push({ src: w.src, full: w.full, cap: `${w.title} / ${w.fandom}` });
      }
      return cardHTML({ title: `${w.title} / ${w.fandom}`, src: w.src }, fileId, "fan", lbIndex);
    }).join("");
    galleries["fan"] = gallery;
    observeLazy(grid);   // 缩略图懒加载
    // 右侧计数跟随当前筛选：ALL 显示总量+组数，筛选中显示 n/total
    const fm = $("#fanMeta");
    if (fm) fm.innerHTML = fanFilter === "ALL"
      ? `<span>${pad2(FANART.length)} FILES</span><span>${AST}</span><span>${fanCats().length} SETS</span>`
      : `<span>${esc(fanFilter)}</span><span>${AST}</span><span>${pad2(list.length)}/${pad2(FANART.length)} FILES</span>`;
    // 筛选结果播报给 SR
    const st = $("#fanartStatus");
    if (st) st.textContent = fanFilter === "ALL" ? `All · ${list.length} works` : `${fanFilter} · ${list.length} works`;
  }
  // hash 参数 → 筛选状态（#fanart/FAN%20ART 深链接、前进后退）
  function syncFanFilter(param) {
    const valid = new Set(FANART.map((w) => w.cat));
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
    const cats = [{ cat: "ALL", n: FANART.length }, ...fanCats()];
    bar.innerHTML =
      `<span class="fbar-label" aria-hidden="true">FILTER //</span>` +
      cats.map(({ cat, n }) =>
        `<button class="fbtn${cat === fanFilter ? " is-on" : ""}" aria-pressed="${cat === fanFilter}" data-f="${esc(cat)}">` +
        `<span class="f-name">${esc(cat)}</span><span class="f-count">${pad2(n)}</span></button>`
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
        // copy 类型：纯文本 + COPY 按钮（不做超链接）
        if (l.copy) {
          return `<button class="link-copy" type="button" data-copy="${esc(l.copy)}" aria-label="Copy ${esc(l.copy)}">` +
            `<span class="lc-label">${esc(l.label)}</span>` +
            `<span class="lc-value">${esc(l.copy)}</span>` +
            `<span class="lc-act" aria-hidden="true">COPY</span></button>`;
        }
        const u = String(l.url || "").trim();
        if (!u || u === "#") {
          return `<span class="dead" title="Link coming soon">${esc(l.label)}</span>`;
        }
        return `<a href="${esc(u)}" target="_blank" rel="noopener noreferrer">${esc(l.label)}</a>`;
      }).join("");
      $$(".link-copy", ll).forEach((b) => {
        let t = 0;
        b.addEventListener("click", async () => {
          const text = b.dataset.copy;
          try {
            await navigator.clipboard.writeText(text);
          } catch {
            // 非安全上下文/老浏览器回退
            const ta = document.createElement("textarea");
            ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
            document.body.appendChild(ta); ta.select();
            try { document.execCommand("copy"); } catch { /* 放弃：文本本身可见可手动选 */ }
            ta.remove();
          }
          b.classList.add("copied");
          const act = $(".lc-act", b);
          if (act) act.textContent = "COPIED ✓";
          clearTimeout(t);
          t = setTimeout(() => {
            b.classList.remove("copied");
            if (act) act.textContent = "COPY";
          }, 1500);
        });
      });
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

  /* ---------- 手机按住放大：下图按点 → 上方方块显示细节（mapping） ----------
     按住 ≥160ms 进入取景：上方 lb-zoomview 显示手指处的放大画面，
     图上同步画出取景框；快速横滑仍然是翻页 */
  (() => {
    if (!lb) return;
    const view = $("#lbZoomView");
    const zrect = $("#lbZoomRect");
    const frame = $("#lbFrame");
    if (!view || !frame) return;

    const MZ = 3; // 手机放大倍率
    const isMobile = () => window.matchMedia("(max-width: 860px)").matches;
    let holdT = 0, tracking = false, sx = 0, sy = 0, rect = null;

    const update = (e) => {
      if (!rect) return;
      const fx = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
      const fy = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
      const vw = view.clientWidth, vh = view.clientHeight;
      // 倍率至少铺满全屏（横图 3× 不够高时自动加倍），平移 clamp 防露黑边。
      // 尺寸向上取整 +2px 出血、位置取整：分数像素的 background 在高 DPR
      // 下取整后可能少画一列，露出底色 = 贴边一条黑色竖线
      const mz = Math.max(MZ, vw / rect.width, vh / rect.height);
      const bw = Math.ceil(rect.width * mz) + 2, bh = Math.ceil(rect.height * mz) + 2;
      const px = Math.round(Math.min(0, Math.max(vw - bw, vw / 2 - fx * bw)));
      const py = Math.round(Math.min(0, Math.max(vh - bh, vh / 2 - fy * bh)));
      view.style.backgroundImage = `url("${lbImg.currentSrc || lbImg.src}")`;
      view.style.backgroundSize = `${bw}px ${bh}px`;
      view.style.backgroundPosition = `${px}px ${py}px`;
      view.classList.add("live");
      if (zrect) {
        // 取景框：上方方块对应的图上区域（用实际倍率 mz，MZ 只是下限）
        const rw = vw / mz, rh = vh / mz;
        const rx = Math.min(rect.width - rw, Math.max(0, fx * rect.width - rw / 2));
        const ry = Math.min(rect.height - rh, Math.max(0, fy * rect.height - rh / 2));
        zrect.style.width = `${rw}px`;
        zrect.style.height = `${rh}px`;
        zrect.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
        zrect.classList.add("live");
      }
    };
    const stopTracking = () => {
      clearTimeout(holdT);
      if (tracking) {
        tracking = false;
        // pointerup 从 frame 冒泡到 stage，翻页判定在 stage 上：
        // 这里同步复位的话，检视时的横向移动会被当成 swipe 翻页。
        // 延迟到下一拍，让同一事件里 stage 先看到 zoom-on 再复位。
        setTimeout(() => { lbZoomOn = false; }, 0);
        view.classList.remove("live"); // 检视是全屏覆盖：松手立即收起
        if (zrect) zrect.classList.remove("live");
      }
    };
    const resetView = () => {
      stopTracking();
      view.classList.remove("live");
      view.style.backgroundImage = "";
      if (zrect) { zrect.classList.remove("live"); }
    };

    frame.addEventListener("pointerdown", (e) => {
      if (!isMobile()) return;
      sx = e.clientX; sy = e.clientY;
      clearTimeout(holdT);
      holdT = setTimeout(() => {
        tracking = true;
        lbZoomOn = true; // 取景时禁用滑动翻页
        rect = lbImg.getBoundingClientRect();
        update(e);
      }, 160);
    }, { passive: true });
    frame.addEventListener("pointermove", (e) => {
      if (!isMobile()) return;
      if (!tracking) {
        // 还没进入取景：明显位移视为滑动手势，取消按住计时
        if (Math.hypot(e.clientX - sx, e.clientY - sy) > 12) clearTimeout(holdT);
        return;
      }
      update(e);
    }, { passive: true });
    frame.addEventListener("pointerup", stopTracking, { passive: true });
    frame.addEventListener("pointercancel", stopTracking, { passive: true });

    // 换图 / 关闭时复位
    const _r = lbRender;
    lbRender = function (...a) {
      resetView(); _r(...a);
      // 放在 _r 之后：桌面 loupe 模块会在渲染链里写入自己的 hint 文案
      if (isMobile()) { const hint = $("#lbHint"); if (hint) hint.textContent = "PRESS & HOLD IMAGE TO INSPECT"; }
    };
    const _c = lbClose;
    lbClose = function () { resetView(); _c(); };
  })();

  /* ---------- 自定义光标：FUI 三角准星 ----------
     实心三角箭头 1:1 跟手（尖端=点击点）+ 描边三角拖尾跟随；
     悬停可点元素时拖尾翻转放大，按下收缩 */
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
      // 箭头不居中偏移：元素左上角 = 三角尖端 = 真实点击点
      dot.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
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
  renderFanartFilters();
  renderFanart();
  renderAbout();
  if (!applyHash()) switchView("portfolio", false);
  if (!bootShown) heroIntro(); // 无 boot 动画（回访/REDUCED）时立即跑 hero 入场
})();
