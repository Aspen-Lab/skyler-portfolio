# SKYLER ✳ VISUAL ARCHIVE

Skyler 的个人作品集网站。黑底 · 文字与线 · FUI/HUD 风格。

**结构**：顶部窄横向 bar 切换三个页面 —— `01 PORTFOLIO`（主页/作品集）/ `02 FANART` / `03 ABOUT ME`。
作品集按 project 分组，每个 project 标题下是一条自动滚动的作品条。

---

## 🖌 如何更新内容（只需要改一个文件）

所有内容都在 **`js/data.js`** 里，用任何文本编辑器打开就能改：

### 1. 添加作品图片

把图片放进 `assets/works/` 文件夹（建议按 project 建子文件夹），然后在 `data.js` 里填上路径：

```js
works: [
  { title: "我的新作品", src: "assets/works/p01/new-work.jpg" },
  { title: "还没画完的", src: "" },   // src 留空 = 显示占位图，不会报错
],
```

- 有 `src` 的作品可以点击放大（自动进入查看器，支持 ← → 切换）
- `src` 留空会显示 HUD 风格占位块，网站不会显得空

### 2. 添加 / 重命名 project

在 `PROJECTS` 数组里复制一段改名字即可。`state` 可以填 `ACTIVE` / `ONGOING` / `ARCHIVED`，会显示成不同的状态徽章。

### 3. Fanart

改 `FANART` 数组，`fandom` 字段会自动生成顶部的筛选按钮。

### 4. About Me

改 `ABOUT` —— 中英文简介、技能条（0–100）、社交链接、头像（`avatar` 填图片路径）。

---

## 💻 本地预览

直接双击 `index.html` 就能看。或者起个本地服务器：

```bash
python3 -m http.server 8000
# 打开 http://localhost:8000
```

## 🚀 部署

仓库已配置 GitHub Pages（main 分支根目录）。每次 `git push` 之后约 1 分钟自动更新线上版本。

---

MADE WITH ✳ FOR SKYLER · EST. 2026
