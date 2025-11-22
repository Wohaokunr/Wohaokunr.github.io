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

    // Render math in DOM text nodes (avoids touching code blocks)
    if (window.katex && contentEl) renderMathInElement(contentEl);

    // Highlight code blocks
    if (window.hljs && contentEl) contentEl.querySelectorAll('pre code').forEach((b) => window.hljs.highlightElement(b));
  } catch (e) {
    const contentEl = document.getElementById('postContent');
    if (contentEl) contentEl.innerHTML = '<p>加载文章失败。</p>';
    console.error(e);
  }
}

// Render markdown using markdown-it, then replace math expressions in text nodes
function renderMarkdownWithKaTeX(mdText) {
  const mdParser = (window.markdownit ? window.markdownit({html:true, linkify:true, typographer:true}) : null);
  const html = mdParser ? mdParser.render(mdText) : mdText;
  return html;
}

function renderMathInElement(root) {
  const blacklist = new Set(['CODE','PRE','A','SCRIPT','STYLE','TEXTAREA']);

  function isInBlackList(node) {
    while (node && node !== root) {
      if (node.nodeType === 1 && blacklist.has(node.tagName)) return true;
      node = node.parentNode;
    }
    return false;
  }

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);

  textNodes.forEach(textNode => {
    if (!textNode.nodeValue || isInBlackList(textNode.parentNode)) return;
    let s = textNode.nodeValue;
    // quick skip if no $ present
    if (s.indexOf('$') === -1) return;

    // Replace block math $$...$$ first
    let replaced = s.replace(/\$\$([\s\S]+?)\$\$/g, function(_, expr){
      try{
        return katex.renderToString(expr, {displayMode:true, throwOnError:false});
      }catch(e){
        return '<span class="katex-error">'+escapeHtml(expr)+'</span>';
      }
    });

    // Then inline math $...$
    replaced = replaced.replace(/\$(.+?)\$/g, function(_, expr){
      try{
        return katex.renderToString(expr, {displayMode:false, throwOnError:false});
      }catch(e){
        return '<code class="katex-error">'+escapeHtml(expr)+'</code>';
      }
    });

    if (replaced !== s) {
      // create fragment from replaced HTML and swap
      const span = document.createElement('span');
      span.innerHTML = replaced;
      textNode.parentNode.replaceChild(span, textNode);
    }
  });
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', function(){
  renderPostsList();
  renderPostFromQuery();
});
