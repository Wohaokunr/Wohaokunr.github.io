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
