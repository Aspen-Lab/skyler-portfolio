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
  zhName: "潘",
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
    zh: "原创世界观企划",
    year: "SPRING 2026",
    medium: "CHARACTER / PROP / ENVIRONMENT",
    state: "ACTIVE",
    works: [
      { title: "LAST ORDER — COVER", src: "assets/works/p01/01-cover.jpg" },
      { title: "CHARACTER LINEUP", src: "assets/works/p01/03-lineup.jpg" },
      { title: "UNIT Y", src: "assets/works/p01/04-unit-y.jpg" },
      { title: "UNIT Z", src: "assets/works/p01/05-unit-z.jpg" },
      { title: "UNIT Z — TURNAROUND", src: "assets/works/p01/06-turnaround.jpg" },
      { title: "ARCH-72", src: "assets/works/p01/07-arch-72.jpg" },
      { title: "PROP DESIGN — OVERVIEW", src: "assets/works/p01/08-prop-design.jpg" },
      { title: "PROP — WHITE ECHO", src: "assets/works/p01/09-white-echo.jpg" },
      { title: "PROP — ABYSSAL ECHO", src: "assets/works/p01/10-abyssal-echo.jpg" },
      { title: "PROP 3 — WEAPON", src: "assets/works/p01/11-prop-3.jpg" },
      { title: "PROP 3 + VFX", src: "assets/works/p01/12-prop-3-vfx.jpg" },
      { title: "ENVIRONMENT — CONCEPT ART", src: "assets/works/p01/13-env-concept.jpg" },
      { title: "ENVIRONMENT — BLUEPRINT", src: "assets/works/p01/14-env-blueprint.jpg" },
      { title: "STYLE FRAME", src: "assets/works/p01/15-style-frame.jpg" },
    ],
  },
  {
    id: "P-02",
    title: "COMMISSIONS",
    zh: "约稿记录",
    year: "2025 — 2026",
    medium: "CHARACTER / COVER ART",
    state: "ONGOING",
    works: [
      { title: "COMM_01", src: "" },
      { title: "COMM_02", src: "" },
      { title: "COMM_03", src: "" },
      { title: "COMM_04", src: "" },
      { title: "COMM_05", src: "" },
    ],
  },
  {
    id: "P-03",
    title: "SKETCH ARCHIVE",
    zh: "草稿档案",
    year: "2023 — 2026",
    medium: "SKETCH / STUDY / WIP",
    state: "ARCHIVED",
    works: [
      { title: "SKETCH_01", src: "" },
      { title: "SKETCH_02", src: "" },
      { title: "SKETCH_03", src: "" },
      { title: "SKETCH_04", src: "" },
      { title: "SKETCH_05", src: "" },
      { title: "SKETCH_06", src: "" },
      { title: "SKETCH_07", src: "" },
    ],
  },
];

/* ------------------------------------------------------------
   FANART — fandom 是作品所属的圈子/标签，会自动生成筛选按钮
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
];

/* ------------------------------------------------------------
   ABOUT ME — avatar 留空会显示扫描动画占位
   ------------------------------------------------------------ */
const ABOUT = {
  avatar: "",
  // ✳ 把下面这段换成你自己的中文自我介绍
  bioZh:
    "插画师 / 同人创作者，喜欢文字与线条的融合，正在持续记录自己的审美积累。",
  bioEn:
    "Illustrator & fan artist. Collecting aesthetics where type meets line. This archive logs everything in transit.",
  skills: [
    ["ILLUSTRATION", 92],
    ["CHARACTER DESIGN", 86],
    ["TYPOGRAPHY", 74],
    ["ANIMATION", 58],
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
