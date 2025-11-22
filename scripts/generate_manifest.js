const fs = require('fs');
const path = require('path');

function parseFrontMatter(content) {
  const fm = {};
  if (content.startsWith('---')) {
    const end = content.indexOf('\n---', 3);
    if (end !== -1) {
      const block = content.slice(3, end + 1).trim();
      block.split(/\n/).forEach(line => {
        const m = line.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
        if (m) fm[m[1].trim()] = m[2].trim();
      });
      const rest = content.slice(end + 4);
      return {fm, body: rest};
    }
  }
  return {fm: {}, body: content};
}

function firstParagraph(text) {
  const parts = text.split(/\n{2,}/).map(s => s.trim()).filter(Boolean);
  return parts.length ? parts[0].replace(/\n/g, ' ') : '';
}

function buildManifest() {
  const dir = path.join(__dirname, '..', 'articles');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
  const items = files.map(file => {
    const full = path.join(dir, file);
    const content = fs.readFileSync(full, 'utf8');
    const {fm, body} = parseFrontMatter(content);
    const title = fm.title || path.basename(file, '.md');
    const date = fm.date || fs.statSync(full).mtime.toISOString().slice(0,10);
    const summary = fm.summary || firstParagraph(body).slice(0,200);
    const slug = fm.slug || path.basename(file, '.md');
    return {title, slug, file, date, summary};
  });
  // sort by date desc
  items.sort((a,b) => b.date.localeCompare(a.date));
  const outPath = path.join(dir, 'articles.json');
  fs.writeFileSync(outPath, JSON.stringify(items, null, 2) + '\n', 'utf8');
  console.log('Wrote', outPath);
}

try {
  buildManifest();
} catch (e) {
  console.error(e);
  process.exit(1);
}
