# 🔁 迭代流程 / Iteration Workflow

Skyler Portfolio 的标准协作流程。每轮改动都按这四步走。

---

## ① 本地开发 + localhost 预览

```bash
cd skyler-portfolio
git checkout main && git pull upstream main    # 先同步原仓库最新代码
git checkout -b feature-xxx                     # 开一个新分支

# ...改 js/data.js、把图片放进 assets/works/...

python3 -m http.server 8000                      # 起本地服务器
```

→ 浏览器打开 **http://localhost:8000** 刷新看效果,改到满意为止。

---

## ② 本地测试 OK → 发 PR

```bash
git add -A
git commit -m "描述这次改了什么"
git push -u origin feature-xxx                   # 推到自己的 fork

gh pr create --repo Aspen-Lab/skyler-portfolio --fill
```

→ PR 进入 `Aspen-Lab/skyler-portfolio`,等待 review。

---

## ③ Aspen review → 合并 → Vercel 自动部署

- Aspen 维护者在 GitHub 上 **Review → Merge** 该 PR。
- 合并进 `main` 后,**Vercel 自动构建并部署**(无需手动操作)。
- 约 1 分钟后线上更新。

---

## ④ 线上验证 secal72.com

→ 打开 **https://secal72.com** 确认改动已生效(建议 `Cmd+Shift+R` 强制刷新避开缓存)。

- ✅ 没问题 → 这轮迭代完成。
- ❌ 有问题 → 回到 ①,开新分支修复。

---

**一句话循环:**
`localhost 改 → 测试 → PR → Aspen 合并 → Vercel 自动上线 → secal72.com 验证 → 下一轮`

---

## Remote 约定

| remote | 指向 | 用途 |
|---|---|---|
| `origin` | 你的 fork | push 你的分支 |
| `upstream` | `Aspen-Lab/skyler-portfolio` | 拉取原仓库最新代码 |
