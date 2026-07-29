/* ------------------------------------------------------------------
   Blog build script
   Reads Markdown files from /posts, renders them to /blog/<slug>.html,
   regenerates /blog/index.html, and regenerates /sitemap.xml.
   Run with:  npm run build

   Internal links are ROOT-ABSOLUTE (/blog/..., /assets/...). The site
   must be served from the domain root (it is, on S3 and http-server).
   ------------------------------------------------------------------ */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

const root = dirname(fileURLToPath(import.meta.url));
const POSTS_DIR = join(root, "posts");
const BLOG_DIR = join(root, "blog");

/* Canonical site URL — update here if the domain changes. */
const BASE = "http://portfolio3.knollitall.com";
const OG_IMAGE = `${BASE}/assets/img/face_2.jpg`;

/* Static pages included in the sitemap (besides the generated blog pages). */
const STATIC_PAGES = [
  { loc: `${BASE}/`, priority: "1.0" },
  { loc: `${BASE}/about.html`, priority: "0.7" },
  { loc: `${BASE}/blog/`, priority: "0.8" },
  { loc: `${BASE}/work/rms.html`, priority: "0.6" },
  { loc: `${BASE}/work/wms.html`, priority: "0.6" },
  { loc: `${BASE}/work/erp.html`, priority: "0.6" },
  { loc: `${BASE}/work/cloud.html`, priority: "0.6" },
  { loc: `${BASE}/work/security.html`, priority: "0.6" },
  { loc: `${BASE}/work/ai.html`, priority: "0.6" },
];

marked.setOptions({ mangle: false, headerIds: false });

const today = new Date().toISOString().slice(0, 10);

const fmtDate = (d) =>
  new Date(d + "T00:00:00").toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });

const esc = (s = "") =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const navBlog = `
      <nav class="cmds">
        <a href="/index.html">home</a>
        <a href="/index.html#work">work</a>
        <a href="/about.html">about</a>
        <a href="/blog/index.html" class="active">blog</a>
      </nav>`;

const footer = `
    <footer>
      <span class="prompt">%</span>
      <span>&copy; <span id="yr"></span> Kevin Knoll</span>
      <a href="/index.html">home</a>
      <a href="/blog/index.html">blog</a>
      <span class="spacer"></span>
      <a href="mailto:jagerathi@gmail.com">email</a>
    </footer>
  </div>
  <script>document.getElementById("yr").textContent = new Date().getFullYear();</script>
</body>
</html>
`;

/* Build the SEO <head> block (canonical + Open Graph + Twitter + optional JSON-LD/article meta). */
const seoBlock = ({ title, desc, url, type = "website", image = OG_IMAGE, articleMeta = "", jsonld = "" }) => `
  <link rel="canonical" href="${url}">
  <meta property="og:type" content="${type}">
  <meta property="og:site_name" content="Kevin Knoll">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${image}">${articleMeta}
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(desc)}">
  <meta name="twitter:image" content="${image}">${jsonld}`;

const head = (title, desc, path, seo) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}">${seo}
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/css/style.css">
</head>
<body>
  <div class="shell">
    <div class="titlebar">
      <span class="dot r"></span><span class="dot y"></span><span class="dot g"></span>
      <span class="path">kevin@knoll: ~/${path}</span>${navBlog}
    </div>
    <div class="body">`;

/* ---- read + parse posts ---- */
const files = readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"));
const posts = files.map((file) => {
  const raw = readFileSync(join(POSTS_DIR, file), "utf8");
  const { data, content } = matter(raw);
  const slug = data.slug || file.replace(/\.md$/, "").replace(/^\d{4}-\d{2}-\d{2}-/, "");
  return {
    slug,
    title: data.title || slug,
    date: data.date || "1970-01-01",
    excerpt: data.excerpt || "",
    tags: data.tags || [],
    html: marked.parse(content),
  };
});
posts.sort((a, b) => (a.date < b.date ? 1 : -1));

/* ---- render each post ---- */
for (const p of posts) {
  const url = `${BASE}/blog/${p.slug}.html`;
  const tags = p.tags.length
    ? `<div class="tags">${p.tags.map((t) => `<span class="t">${esc(t)}</span>`).join("")}</div>`
    : "";
  const articleMeta =
    `\n  <meta property="article:published_time" content="${p.date}">` +
    `\n  <meta property="article:author" content="Kevin Knoll">` +
    p.tags.map((t) => `\n  <meta property="article:tag" content="${esc(t)}">`).join("");
  const ld = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: p.title,
    description: p.excerpt,
    datePublished: p.date,
    author: { "@type": "Person", name: "Kevin Knoll", url: `${BASE}/` },
    keywords: p.tags.join(", "),
    image: OG_IMAGE,
    url,
    mainEntityOfPage: url,
  };
  const jsonld = `\n  <script type="application/ld+json">\n  ${JSON.stringify(ld)}\n  </script>`;
  const seo = seoBlock({ title: p.title, desc: p.excerpt, url, type: "article", articleMeta, jsonld });

  const out =
    head(`${p.title} — Kevin Knoll`, p.excerpt, "blog/" + p.slug, seo) +
    `
      <a href="/blog/index.html" class="back">blog</a>
      <div class="section-label">% <span class="cmd">cat ${esc(p.slug)}.md</span></div>
      <h1>${esc(p.title)}</h1>
      <p class="post-meta">${fmtDate(p.date)}</p>
      ${tags}
      <article class="prose" style="margin-top:22px">
${p.html}
      </article>
      <a href="/blog/index.html" class="btn" style="margin-top:18px">&larr; all posts</a>
    </div>` +
    footer;
  writeFileSync(join(BLOG_DIR, p.slug + ".html"), out);
  console.log("wrote blog/" + p.slug + ".html");
}

/* ---- render blog index ---- */
const rows = posts
  .map(
    (p) => `        <a href="/blog/${esc(p.slug)}.html" class="post">
          <span class="post-date">${fmtDate(p.date)}</span>
          <span>
            <span class="post-title">${esc(p.title)}</span><br>
            <span class="post-excerpt">${esc(p.excerpt)}</span>
          </span>
        </a>`
  )
  .join("\n");

const blogSeo = seoBlock({
  title: "Blog — Kevin Knoll",
  desc: "Writing on architecture, AWS, and modernization by Kevin Knoll.",
  url: `${BASE}/blog/`,
});

const index =
  head("Blog — Kevin Knoll", "Writing on architecture, AWS, and modernization by Kevin Knoll.", "blog", blogSeo) +
  `
      <a href="/index.html" class="back">home</a>
      <div class="section-label">% <span class="cmd">ls -lt ./posts</span></div>
      <h1>Writing</h1>
      <p class="subtitle">Notes on architecture, AWS, and the long road of modernization.</p>
      <div class="postlist" style="margin-top:18px">
${rows}
      </div>
    </div>` +
  footer;

writeFileSync(join(BLOG_DIR, "index.html"), index);
console.log("wrote blog/index.html");

/* ---- regenerate sitemap.xml ---- */
const sitemapUrls = [
  ...STATIC_PAGES.map((s) => ({ loc: s.loc, lastmod: today, priority: s.priority })),
  ...posts.map((p) => ({ loc: `${BASE}/blog/${p.slug}.html`, lastmod: p.date, priority: "0.6" })),
];
const sitemap =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  sitemapUrls
    .map(
      (u) =>
        `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n    <priority>${u.priority}</priority>\n  </url>`
    )
    .join("\n") +
  `\n</urlset>\n`;
writeFileSync(join(root, "sitemap.xml"), sitemap);
console.log("wrote sitemap.xml");

console.log(`\nDone — ${posts.length} post(s).`);
