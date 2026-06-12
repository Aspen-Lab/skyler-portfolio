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
const PROJECTS = [
  {
    id: "P-01",
    title: "LAST ORDER",
    ja: "オリジナル企画", // 标题旁的日文装饰小字
    year: "SPRING 2026",
    medium: "CHARACTER / PROP / ENVIRONMENT",
    state: "ACTIVE",
    works: [
      { title: "WEAPON DESIGN",                src: "assets/works/p01/11-prop-3.jpg?v=2",         featured: true, w: 1920, h: 1080 },
      { title: "CHARACTER LINEUP",            src: "assets/works/p01/03-lineup.jpg?v=2",         w: 1920, h: 1080 },
      { title: "UNIT Y — SKETCHES",           src: "assets/works/p01/04-unit-y.jpg?v=2",         w: 1920, h: 1080 },
      { title: "UNIT Z — SKETCHES",           src: "assets/works/p01/05-unit-z.jpg?v=2",         w: 1920, h: 1080 },
      { title: "UNIT Z — TURNAROUND",         src: "assets/works/p01/06-turnaround.jpg?v=2",     w: 1920, h: 1080 },
      { title: "PROP DESIGN",                 src: "assets/works/p01/08-prop-design.jpg?v=2",    w: 1920, h: 1080 },
      { title: "PROP 01 — WHITE ECHO",        src: "assets/works/p01/09-white-echo.jpg?v=2",     w: 1920, h: 1080 },
      { title: "PROP 02 — ABYSSAL ECHO",      src: "assets/works/p01/10-abyssal-echo.jpg?v=2",   w: 1920, h: 1080 },
      { title: "PROP 03 + VFX",               src: "assets/works/p01/12-prop-3-vfx.jpg?v=2",     w: 1920, h: 1080 },
      { title: "ENVIRONMENT — CONCEPT ART",   src: "assets/works/p01/13-env-concept.jpg?v=2",    w: 1920, h: 1080 },
      { title: "ENVIRONMENT — CONCEPT ART 2", src: "assets/works/p01/13b-env-concept-2.jpg?v=2", w: 1920, h: 1222 },
      { title: "ENVIRONMENT — DESIGN",        src: "assets/works/p01/14-env-blueprint.jpg?v=2",  w: 1920, h: 1080 },
      { title: "STYLE FRAME",                 src: "assets/works/p01/15-style-frame.jpg?v=2",    w: 1920, h: 1080 },
    ],
  },
  {
    id: "P-02",
    title: "CREATURE DESIGN",
    ja: "クリーチャーデザイン",
    year: "SPRING 2026",
    medium: "CHARACTER DESIGN · WORLDBUILDING",
    state: "ACTIVE",
    works: [
      { title: "BAIZE — BOOK SPREAD", src: "assets/works/p02/02-baize-spread.jpg", featured: true, w: 1920, h: 1242 },
      { title: "BAIZE — CHARACTER SHEET",  src: "assets/works/p02/01-baize.jpg", w: 1920, h: 1242 },
      { title: "LEPTAILURUS PAVONINUS",    src: "assets/works/p02/03-leptailurus.jpg", w: 1920, h: 1242 },
      { title: "OVIS CAMELOPARDALIS",      src: "assets/works/p02/04-ovis.jpg", w: 1920, h: 1242 },
      { title: "RHINOLAGUS CAMPANULA",     src: "assets/works/p02/05-rhinolagus.jpg", w: 1920, h: 1242 },
    ],
  },
];

/* ------------------------------------------------------------
   SKETCH ARCHIVE — ARCHIVE 页上半部分（速写/习作/WIP）
   ✳ 和别处一样：src 留空 ("") 显示占位图。
   ------------------------------------------------------------ */
const SKETCHES = {
  ja: "スケッチアーカイブ",
  year: "2023 — 2026",
  medium: "SKETCH / STUDY / WIP",
  works: [
    { title: "SKETCH_01", src: "" },
    { title: "SKETCH_02", src: "" },
    { title: "SKETCH_03", src: "" },
    { title: "SKETCH_04", src: "" },
    { title: "SKETCH_05", src: "" },
    { title: "SKETCH_06", src: "" },
    { title: "SKETCH_07", src: "" },
  ],
};

/* ------------------------------------------------------------
   FAN ART & COMMISSION — ARCHIVE 页下半部分
   ✳ fandom 是作品所属的圈子/标签，会自动生成筛选按钮；
     委托作品用 fandom: "COMMISSION"。
   ✳ 注意：fandom 名字会原样显示在页面上，发布前记得把
     FANDOM A/B/C 换成真实的圈名。
   ------------------------------------------------------------ */
const FANART = [
  { title: "FA_001", fandom: "FANDOM A", src: "" },
  { title: "FA_002", fandom: "FANDOM A", src: "" },
  { title: "FA_003", fandom: "FANDOM B", src: "" },
  { title: "FA_004", fandom: "FANDOM B", src: "" },
  { title: "FA_005", fandom: "FANDOM C", src: "" },
  { title: "FA_006", fandom: "FANDOM A", src: "" },
  { title: "FA_007", fandom: "FANDOM C", src: "" },
  { title: "FA_008", fandom: "FANDOM B", src: "" },
  { title: "CM_001", fandom: "COMMISSION", src: "" },
  { title: "CM_002", fandom: "COMMISSION", src: "" },
  { title: "CM_003", fandom: "COMMISSION", src: "" },
];

/* ------------------------------------------------------------
   ABOUT ME — avatar 留空会显示扫描动画占位
   ------------------------------------------------------------ */
const ABOUT = {
  avatar: "assets/avatar.jpg",
  // 主简介（英文，页面主要内容）
  bio:
    "Illustration student with a concentration in Concept Design, passionate about character design and narrative-driven visual storytelling for games. Experienced in concept art production for live-service mobile titles at Garena, with strengths in style adaptation, iterative visual development, and cross-team collaboration.",
  // 简介下方的日文装饰行
  bioDeco: "キャラクターデザイン ✳ ビジュアルストーリーテリング ✳ コンセプトアート",

  // bio 里要点亮的关键短语（必须与 bio 原文逐字一致；亮白显示，其余文字灰）
  bioHighlights: [
    "Concept Design",
    "character design",
    "narrative-driven visual storytelling",
    "Garena",
  ],

  // About 页数据带：大字焦点块（n 大字 / label 小注），3–4 个最佳
  highlights: [
    { n: "GARENA",  label: "FREE FIRE · AOV — SHIPPED" },
    { n: "TGC",     label: "SKY 6TH ANNIV. OFFICIAL ART" },
    { n: "1ST ×1",  label: "BEYOND THE DOT · 2024" },
    { n: "TOP 3%",  label: "GPA · 8 SEMESTERS" },
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
