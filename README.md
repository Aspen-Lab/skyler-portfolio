# SKYLER ✳ VISUAL ARCHIVE

Skyler 的个人作品集网站。黑底 · 文字与线 · FUI/HUD 风格。

**结构**：顶部窄横向 bar 切换三个页面 —— `01 PORTFOLIO`（主页/作品集）/ `02 ARCHIVE`（SKETCH ARCHIVE + FAN ART & COMMISSION）/ `03 ABOUT ME`。
作品集按 project 分组，每个 project 标题下是一条自动滚动的作品条。

---

## 🖌 如何更新内容（只需要改一个文件）

所有内容都在 **`js/data.js`** 里，用任何文本编辑器打开就能改：

### 1. 添加作品图片

把图片放进 `assets/works/` 文件夹（建议按 project 建子文件夹），然后在 `data.js` 里填上路径：

```js
works: [
  { title: "我的新作品", src: "assets/works/p01/new-work.jpg", w: 1914, h: 1074 },
  { title: "还没画完的", src: "" },   // src 留空 = 显示占位图，不会报错
],
```

- `w` / `h` 填图片的像素宽高（可不填，但填了页面加载时不会跳动）

- 有 `src` 的作品可以点击放大（自动进入查看器，支持 ← → 切换）
- `src` 留空会显示 HUD 风格占位块，网站不会显得空

### 2. 添加 / 重命名 project

在 `PROJECTS` 数组里复制一段改名字即可。`state` 可以填 `ACTIVE` / `ONGOING` / `ARCHIVED`，会显示成不同的状态徽章。

### 3. Archive（速写 + Fanart/委托）

`02 ARCHIVE` 页分两个板块：

- **SKETCH ARCHIVE**：改 `SKETCHES.works` 数组（年份/媒介在 `SKETCHES.year` / `SKETCHES.medium`）。
- **FAN ART & COMMISSION**：改 `FANART` 数组，`fandom` 字段会自动生成筛选按钮；
  委托作品把 `fandom` 填成 `"COMMISSION"` 即可。
  筛选状态会进网址（如 `#fanart/圈名`），可以直接把筛选后的链接分享给别人。

### 4. About Me

改 `ABOUT` —— 简介、经历 `experience`、学历 `education`、奖项 `awards`、
能力标签 `skills`、社交链接 `links`、头像（`avatar` 填图片路径）。

---

## 💻 本地预览

直接双击 `index.html` 就能看。或者起个本地服务器：

```bash
python3 -m http.server 8000
# 打开 http://localhost:8000
```

## 🚀 部署

- 仓库地址：https://github.com/Aspen-Lab/skyler-portfolio
- 线上网址：**https://aspen-lab.github.io/skyler-portfolio/**

已配置 GitHub Pages（main 分支根目录）。每次 `git push` 之后约 1 分钟自动更新线上版本：

```bash
git add -A
git commit -m "更新作品"
git push
```

不熟悉命令行的话，也可以直接在 GitHub 网页上进入仓库 → 点开文件 → ✏️ 编辑 `js/data.js`，或把图片拖进 `assets/works/` 文件夹上传，保存（Commit）后同样会自动发布。

---

MADE WITH ✳ FOR SKYLER · EST. 2026
