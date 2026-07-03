/* ============================================================
   SKYLER — 站点数据
   ✳ Skyler 只需要改这个文件就能更新网站内容。
   ✳ 图片放进 assets/works/ 文件夹，然后把文件名填到 src 里。
   ✳ src 留空 ("") 时会显示好看的占位图，不会报错。
   ============================================================ */

const SITE = {
  name: "SKYLER",
  heroName: "SECAL72", // 主页大标题（留空则用 name）
  alias: "SKYLER",
  displayName: "ZHIYI PAN", // 署名行（显示在 hero 标签里）
  credential: "SCAD B.F.A. — ILLUSTRATION · CONCEPT DESIGN", // hero 标题下的学历强调行（打字机效果）
  tagline: "VISUAL ARCHIVE ✳ ILLUSTRATION ✳ FANART",
  est: "EST. 2026",
};

/* ------------------------------------------------------------
   作品集（主页）— 每个 project 一个滚动条
   state 可选: "ACTIVE" | "ONGOING" | "ARCHIVED"
   ------------------------------------------------------------ */
// 顺序 = 显示顺序 = id 顺序。src = 列表缩略图(快)；full = 灯箱原图(高清)。
// 注：SILENT BELL 的图实体仍在 p03/ 文件夹（避免重传），显示编号为 P-02。
const PROJECTS = [
  {
    id: "P-01",
    title: "LAST ORDER",
    ja: "オリジナル企画", // 标题旁的日文装饰小字
    year: "SPRING 2026",
    medium: "CHARACTER / PROP / ENVIRONMENT",
    state: "ACTIVE",
    works: [
      { title: "WEAPON DESIGN",                src: "assets/works/p01/thumb/01-weapon.jpg",        full: "assets/works/p01/01-weapon.jpg",        featured: true, w: 4800, h: 2700 },
      { title: "CHARACTER LINEUP",             src: "assets/works/p01/thumb/02-lineup.jpg",        full: "assets/works/p01/02-lineup.jpg",        w: 4800, h: 2700 },
      { title: "UNIT Y — SKETCHES",            src: "assets/works/p01/thumb/03-unit-y.jpg",        full: "assets/works/p01/03-unit-y.jpg",        w: 4800, h: 2700 },
      { title: "UNIT Z — SKETCHES",            src: "assets/works/p01/thumb/04-unit-z.jpg",        full: "assets/works/p01/04-unit-z.jpg",        w: 4800, h: 2700 },
      { title: "UNIT Z — TURNAROUND",          src: "assets/works/p01/thumb/05-turnaround.jpg",    full: "assets/works/p01/05-turnaround.jpg",    w: 4800, h: 2700 },
      { title: "PROP DESIGN",                  src: "assets/works/p01/thumb/06-prop-design.jpg",   full: "assets/works/p01/06-prop-design.jpg",   w: 6400, h: 3600 },
      { title: "PROP 01 — WHITE ECHO",         src: "assets/works/p01/thumb/07-prop-1.jpg",        full: "assets/works/p01/07-prop-1.jpg",        w: 6400, h: 3600 },
      { title: "PROP 02 — ABYSSAL ECHO",       src: "assets/works/p01/thumb/08-prop-2.jpg",        full: "assets/works/p01/08-prop-2.jpg",        w: 6400, h: 3600 },
      { title: "PROP 03 + VFX",                src: "assets/works/p01/thumb/09-vfx.jpg",           full: "assets/works/p01/09-vfx.jpg",           w: 6400, h: 3600 },
      { title: "ENVIRONMENT — CONCEPT ART",    src: "assets/works/p01/thumb/10-env-concept.jpg",   full: "assets/works/p01/10-env-concept.jpg",   w: 4800, h: 2700 },
      { title: "ENVIRONMENT — CONCEPT ART 2",  src: "assets/works/p01/thumb/11-env-concept-2.jpg", full: "assets/works/p01/11-env-concept-2.jpg", w: 4400, h: 2800 },
      { title: "ENVIRONMENT — DESIGN",         src: "assets/works/p01/thumb/12-env-design.jpg",    full: "assets/works/p01/12-env-design.jpg",    w: 4800, h: 2700 },
      { title: "STYLE FRAME",                  src: "assets/works/p01/thumb/13-style-frame.jpg",   full: "assets/works/p01/13-style-frame.jpg",   w: 4800, h: 2700 },
    ],
  },
  {
    id: "P-02",
    title: "SILENT BELL",
    ja: "サイレントベル",
    year: "SPRING 2026",
    medium: "CHARACTER / ENVIRONMENT / PROP",
    state: "ACTIVE",
    works: [
      { title: "CHARACTER LINEUP",              src: "assets/works/p03/thumb/01-lineup.jpg",           full: "assets/works/p03/01-lineup.jpg",           featured: true, w: 4800, h: 2700 },
      { title: "SULI — CHARACTER",              src: "assets/works/p03/thumb/02-suli.jpg",             full: "assets/works/p03/02-suli.jpg",             w: 4800, h: 2700 },
      { title: "ZHIXIA — CHARACTER",            src: "assets/works/p03/thumb/03-zhixia.jpg",           full: "assets/works/p03/03-zhixia.jpg",           w: 4800, h: 2700 },
      { title: "CANGHENG — CHARACTER",          src: "assets/works/p03/thumb/04-cangheng.jpg",         full: "assets/works/p03/04-cangheng.jpg",         w: 4800, h: 2700 },
      { title: "YANHE — CHARACTER",             src: "assets/works/p03/thumb/05-yanhe.jpg",            full: "assets/works/p03/05-yanhe.jpg",            w: 4800, h: 2700 },
      { title: "ENVIRONMENT — SPIRITUAL MARKET", src: "assets/works/p03/thumb/06-spiritual-market.jpg", full: "assets/works/p03/06-spiritual-market.jpg", w: 4800, h: 2700 },
      { title: "ENVIRONMENT — DIM SUM HOUSE",   src: "assets/works/p03/thumb/07-dim-sum-house.jpg",     full: "assets/works/p03/07-dim-sum-house.jpg",     w: 4800, h: 2700 },
      { title: "BOAT — CONCEPT",                src: "assets/works/p03/thumb/08-boat.jpg",             full: "assets/works/p03/08-boat.jpg",             w: 4800, h: 2700 },
      { title: "FUNCTIONAL PROP",               src: "assets/works/p03/thumb/09-functional-prop.jpg",  full: "assets/works/p03/09-functional-prop.jpg",  w: 4800, h: 2700 },
      { title: "CONCEPT ART",                   src: "assets/works/p03/thumb/10-concept-art.jpg",      full: "assets/works/p03/10-concept-art.jpg",      w: 6400, h: 3600 },
      { title: "CONCEPT ART 2",                 src: "assets/works/p03/thumb/11-concept-art-2.jpg",    full: "assets/works/p03/11-concept-art-2.jpg",    w: 6400, h: 3600 },
    ],
  },
  {
    id: "P-03",
    title: "CREATURE DESIGN",
    ja: "クリーチャーデザイン",
    year: "SPRING 2026",
    medium: "CHARACTER DESIGN · WORLDBUILDING",
    state: "ACTIVE",
    works: [
      { title: "BAIZE — BOOK SPREAD",     src: "assets/works/p02/thumb/01-baize-spread.jpg", full: "assets/works/p02/01-baize-spread.jpg", featured: true, w: 6800, h: 4400 },
      { title: "BAIZE — CHARACTER SHEET", src: "assets/works/p02/thumb/02-baize.jpg",        full: "assets/works/p02/02-baize.jpg",        w: 6800, h: 4400 },
      { title: "LEPTAILURUS PAVONINUS",   src: "assets/works/p02/thumb/03-leptailurus.jpg",  full: "assets/works/p02/03-leptailurus.jpg",  w: 6800, h: 4400 },
      { title: "OVIS CAMELOPARDALIS",     src: "assets/works/p02/thumb/04-ovis.jpg",         full: "assets/works/p02/04-ovis.jpg",         w: 6800, h: 4400 },
      { title: "RHINOLAGUS CAMPANULA",    src: "assets/works/p02/thumb/05-rhinolagus.jpg",   full: "assets/works/p02/05-rhinolagus.jpg",   w: 6800, h: 4400 },
    ],
  },
];

/* ------------------------------------------------------------
   FAN ART & COMMISSION — ARCHIVE 页下半部分
   ✳ fandom 是作品所属的圈子/标签，会自动生成筛选按钮；
     委托作品用 fandom: "COMMISSION"。
   ✳ 注意：fandom 名字会原样显示在页面上，发布前记得把
     FANDOM A/B/C 换成真实的圈名。
   ------------------------------------------------------------ */
// src = 列表缩略图；full = 灯箱原图。fandom 会生成筛选按钮。
const FANART = [
  { title: "DAYS OF RAINBOW",     fandom: "SKY",        src: "assets/works/fanart/thumb/01-sky-rainbow.jpg",      full: "assets/works/fanart/01-sky-rainbow.jpg" },
  { title: "DAYS OF RAINBOW II",  fandom: "SKY",        src: "assets/works/fanart/thumb/02-sky-rainbow-2.jpg",    full: "assets/works/fanart/02-sky-rainbow-2.jpg" },
  { title: "SEASON OF MIGRATION", fandom: "SKY",        src: "assets/works/fanart/thumb/03-sky-migration.jpg",    full: "assets/works/fanart/03-sky-migration.jpg" },
  { title: "SKY — FANART",        fandom: "SKY",        src: "assets/works/fanart/thumb/04-sky-fanart.jpg",       full: "assets/works/fanart/04-sky-fanart.jpg" },
  { title: "6TH ANNIVERSARY",     fandom: "SKY",        src: "assets/works/fanart/thumb/05-sky-6anniv.jpg",       full: "assets/works/fanart/05-sky-6anniv.jpg" },
  { title: "UNIT Z — POSTER",     fandom: "ORIGINAL",   src: "assets/works/fanart/thumb/06-unitz-poster.jpg",     full: "assets/works/fanart/06-unitz-poster.jpg" },
  { title: "ANGEL",               fandom: "COMMISSION", src: "assets/works/fanart/thumb/07-commission-angel.jpg", full: "assets/works/fanart/07-commission-angel.jpg" },
  { title: "UNTITLED",            fandom: "COMMISSION", src: "assets/works/fanart/thumb/08-untitled.jpg",         full: "assets/works/fanart/08-untitled.jpg" },
];

/* ------------------------------------------------------------
   ABOUT ME — avatar 留空会显示扫描动画占位
   ------------------------------------------------------------ */
const ABOUT = {
  avatar: "assets/avatar.jpg",
  // 主简介（英文，页面主要内容）— 讲个人与兴趣，不重复下方 work experience 里的 Garena
  bio:
    "Illustration student with a concentration in Concept Design — happiest inventing characters and the worlds they live in. I love creature design, drawing fan art for the games I grew up with, and painting in watercolor when I step away from the screen.",
  // 简介下方的日文装饰行
  bioDeco: "キャラクターデザイン ✳ ビジュアルストーリーテリング ✳ コンセプトアート",

  // bio 里要点亮的关键短语（必须与 bio 原文逐字一致；亮白显示，其余文字灰）
  bioHighlights: [
    "Concept Design",
    "inventing characters",
    "creature design",
    "watercolor",
  ],

  // About 页数据带：大字焦点块（n 大字 / label 小注），3–4 个最佳
  highlights: [
    { n: "GARENA",       label: "FREE FIRE · AOV — SHIPPED" },
    { n: "1ST×1 2ND×2",  label: "SCAD BEYOND THE DOT · 2024" },
    { n: "TOP 3%",       label: "GPA · 8 SEMESTERS" },
  ],

  // 经历：period / company / role / tag(小徽章) / note(一行简述，可留空)
  experience: [
    {
      period: "JUL — SEP 2025",
      company: "GARENA",
      role: "CONCEPT ARTIST",
      tag: "INTERNSHIP",
      note: "Concept designs for Free Fire & Arena of Valor. IP collaborations (Detective Conan, Jujutsu Kaisen). AI-assisted ideation pipeline.",
    },
    {
      period: "AUG 2021 — FEB 2022",
      company: "XING ART",
      role: "TEST ILLUSTRATOR",
      tag: "AIGC",
      note: "Core test illustrator in product prototype phase; project secured $300K early-stage funding from Miracle Plus.",
    },
    {
      period: "JUN 2020 — JUL 2021",
      company: "SCAD",
      role: "CHARACTER & VISUAL LEAD",
      tag: "IN-CLASS",
      note: "Led the character design team on game world-building course projects.",
    },
  ],

  education: {
    period: "2023 — 2026",
    school: "SAVANNAH COLLEGE OF ART AND DESIGN",
    degree: "B.F.A. ILLUSTRATION · CONCEPT DESIGN",
  },

  awards: [
    {
      period: "2024",
      title: "BEYOND THE DOT",
      sub: "SCAD ILLUSTRATION COMPETITION",
      detail: "1ST ×1 · 2ND ×2",
      note: "First student in SCAD history with three works simultaneously shortlisted & awarded.",
    },
    {
      period: "2023 — 2026",
      title: "SCAD MERIT SCHOLARSHIP",
      sub: "8 SEMESTERS · TOP 3% GPA",
      detail: "",
      note: "",
    },
  ],

  // 能力标签（FUI 芯片，不打分）
  skills: [
    "CHARACTER DESIGN",
    "VISUAL STORYTELLING",
    "NARRATIVE ILLUSTRATION",
    "COMPOSITION",
    "COLOR THEORY",
    "PROCREATE",
    "PHOTOSHOP",
    "CLIP STUDIO PAINT",
    "WATERCOLOR",
  ],
  // 链接：url 填完整网址（https:// 开头）；E-MAIL 改成 mailto:你的邮箱
  // url 留 "#" 或留空会显示成灰色不可点击的占位；不用的链接整行删掉
  links: [
    { label: "ARTSTATION", url: "https://www.artstation.com/secal72" },
    { label: "INSTAGRAM", url: "https://www.instagram.com/secal_072" },
    { label: "小红书 RED", url: "#" },
    { label: "E-MAIL", url: "mailto:secal72art@gmail.com" },
  ],
};
