/* ============================================================
   SKYLER — 站点数据
   ✳ Skyler 只需要改这个文件就能更新网站内容。
   ✳ 图片放进 assets/works/ 文件夹，然后把文件名填到 src 里。
   ✳ src 留空 ("") 时会显示好看的占位图，不会报错。
   ============================================================ */

const SITE = {
  name: "SKYLER",
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
    title: "ORIGINAL WORKS",
    zh: "原创作品",
    year: "2024 — 2026",
    medium: "DIGITAL ILLUSTRATION",
    state: "ACTIVE",
    works: [
      { title: "UNTITLED_01", src: "" },
      { title: "UNTITLED_02", src: "" },
      { title: "UNTITLED_03", src: "" },
      { title: "UNTITLED_04", src: "" },
      { title: "UNTITLED_05", src: "" },
      { title: "UNTITLED_06", src: "" },
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
  bioZh:
    "这里写中文自我介绍。比如：插画师 / 同人创作者，喜欢文字与线条的融合，正在持续记录自己的审美积累。",
  bioEn:
    "Illustrator & fan artist. Collecting aesthetics where type meets line. This archive logs everything in transit.",
  skills: [
    ["ILLUSTRATION", 92],
    ["CHARACTER DESIGN", 86],
    ["TYPOGRAPHY", 74],
    ["ANIMATION", 58],
  ],
  links: [
    { label: "小红书 RED", url: "#" },
    { label: "X / TWITTER", url: "#" },
    { label: "PIXIV", url: "#" },
    { label: "E-MAIL", url: "mailto:hello@example.com" },
  ],
};
