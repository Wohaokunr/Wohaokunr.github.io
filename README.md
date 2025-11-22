# 我好困的个人博客（重构）

这是一个简单的静态个人博客示例，已将样式与脚本分离，便于维护与扩展。

- 入口页面: `index.html`
- 倒计时页面: `time.html`
- 样式: `css/style.css`
- 脚本: `js/main.js`

快速查看：在本地打开 `index.html` 即可。若要在临时本地服务器里查看（推荐），可以使用 Python 的简单 HTTP 服务器：

```bash
# 在仓库根目录运行
python3 -m http.server 8000
# 然后在浏览器打开 http://localhost:8000/
```

改动要点：
- 移除页面内联 CSS/JS，抽离为 `css/style.css` 和 `js/main.js`。
- 改善页面可访问性（aria-label、按钮）。
- 清理并替换不当或自伤类文本为中性/积极内容。

后续建议：
- 把更多文章内容放到单独的 Markdown 或 JSON，再通过小脚本渲染。
- 考虑添加简单的构建流程（例如使用 npm + parcel/vite）来管理资源和部署。

自动化与离线资源
- 仓库包含一个 GitHub Actions 工作流 `.github/workflows/vendor_and_manifest.yml`，它会在 `main` 分支 push 或手动触发时：
	1. 从 CDN 下载必要的前端库到 `vendor/`（`markdown-it`、`katex`、`highlight.js`）
	2. 扫描 `articles/` 下的 `.md` 文件并生成/更新 `articles/articles.json`
	3. 如有变化，会把生成的 `vendor/` 和 `articles/articles.json` 提交回仓库

 本地手动操作
- 生成文章清单（本地）：

```bash
node scripts/generate_manifest.js
# 这将在 articles/ 下写入或更新 articles.json
```

- 手动下载 vendor（可选）：

```bash
mkdir -p vendor/markdownit vendor/katex vendor/highlight
curl -sSL https://cdn.jsdelivr.net/npm/markdown-it@12.0.6/dist/markdown-it.min.js -o vendor/markdownit/markdown-it.min.js
curl -sSL https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js -o vendor/katex/katex.min.js
curl -sSL https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css -o vendor/katex/katex.min.css
curl -sSL https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/highlight.min.js -o vendor/highlight/highlight.min.js
curl -sSL https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/github.min.css -o vendor/highlight/github.min.css
```

注意：CI 工作流会自动完成上述下载与生成工作，手动操作仅在离线或测试时需要。
