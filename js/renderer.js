/* renderer.js
   - Loads articles list for index.html
   - Renders markdown in post.html with math (KaTeX) and syntax highlighting
*/

// Utility: fetch JSON with simple error handling
async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('网络请求失败: ' + res.status);
  return res.json();
}

// --- Index: render posts list ---
async function renderPostsList() {
  const container = document.getElementById('postsList');
  if (!container) return;
  try {
    const list = await fetchJson('articles/articles.json');
    container.innerHTML = '';
    list.forEach(item => {
      const card = document.createElement('article');
      card.className = 'post-card';
      card.innerHTML = `<h3><a href="post.html?post=${encodeURIComponent(item.slug)}">${escapeHtml(item.title)}</a></h3>
                        <p class="muted">${escapeHtml(item.date)} · ${escapeHtml(item.summary)}</p>`;
      container.appendChild(card);
    });
  } catch (e) {
    container.innerHTML = '<p>无法加载文章列表。</p>';
    console.error(e);
  }
}

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c]));
}

// --- Post rendering ---
async function renderPostFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('post');
  if (!slug) return;

  // load manifest to map slug -> file
  try {
    const list = await fetchJson('articles/articles.json');
    const entry = list.find(i => i.slug === slug);
    if (!entry) throw new Error('找不到对应文章');

    const mdRes = await fetch('articles/' + entry.file);
    if (!mdRes.ok) throw new Error('加载文章内容失败');
    let md = await mdRes.text();

    // Remove YAML frontmatter if present
    md = md.replace(/^---[\s\S]*?---\n?/, '');

    // Render markdown to HTML while handling math
    const html = renderMarkdownWithKaTeX(md);

    const contentEl = document.getElementById('postContent');
    const titleEl = document.getElementById('postTitle');
    if (titleEl) titleEl.textContent = entry.title || '文章';
    if (contentEl) contentEl.innerHTML = html;

    // Highlight code blocks
    if (window.hljs) contentEl.querySelectorAll('pre code').forEach((b) => window.hljs.highlightElement(b));
  } catch (e) {
    const contentEl = document.getElementById('postContent');
    if (contentEl) contentEl.innerHTML = '<p>加载文章失败。</p>';
    console.error(e);
  }
}

// Very small markdown -> html pipeline with KaTeX replacement
function renderMarkdownWithKaTeX(md) {
  // First, replace block math $$...$$ and inline $...$ with placeholders
  const blocks = [];
  // block math
  md = md.replace(/\$\$([\s\S]+?)\$\$/g, function(_, expr){
    try{
      const html = katex.renderToString(expr, {displayMode:true, throwOnError:false});
      return '\n' + html + '\n';
    }catch(e){
      return '\n<pre class="katex-error">'+escapeHtml(expr)+'</pre>\n';
    }
  });

  // inline math
  md = md.replace(/\$(.+?)\$/g, function(_, expr){
    // avoid matching code spans by a simple heuristic: if contains space at ends, skip
    try{
      const html = katex.renderToString(expr, {displayMode:false, throwOnError:false});
      return html;
    }catch(e){
      return '<code class="katex-error">'+escapeHtml(expr)+'</code>';
    }
  });

  // Now convert markdown (marked) to HTML
  const rendered = (window.marked ? marked.parse(md) : md);
  return rendered;
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', function(){
  renderPostsList();
  renderPostFromQuery();
});
