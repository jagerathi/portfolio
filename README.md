# Kevin Knoll — portfolio + blog

A static site with a "terminal" theme. No framework, no backend — just HTML/CSS/JS
plus a small Node script that turns Markdown into blog pages. Hosts cleanly on S3.

## Structure

```
index.html            Homepage (terminal hero, services, work, about teaser)
about.html            Full about page
work/                 Project case studies (rms, wms, erp, cloud)
blog/                 Generated blog (index + one page per post) — do not hand-edit
posts/                Blog posts as Markdown — THIS is where you write
assets/
  css/style.css       The whole theme lives here
  js/main.js          Typing effect + active-nav highlight
  img/                Images
build.mjs             Builds the blog from posts/
package.json          Dependencies (marked, gray-matter)
```

## Writing a new blog post

1. Create a file in `posts/`, e.g. `posts/2026-07-01-my-title.md`.
2. Start it with frontmatter, then write the body in Markdown:

   ```markdown
   ---
   title: "My post title"
   date: "2026-07-01"
   excerpt: "One-sentence summary shown on the blog index."
   tags: ["aws", "architecture"]
   slug: "my-title"
   ---

   Your post body in **Markdown**.
   ```

3. Run the build:

   ```bash
   npm install   # first time only
   npm run build
   ```

   This regenerates everything under `blog/`. Commit/upload the result.

## Local preview

Internal links are root-absolute (`/blog/...`, `/assets/...`), so the site must be viewed
through a web server, not by double-clicking the files (a `file://` URL resolves `/` to your
drive root and everything 404s).

Use `http-server`, which always serves `index.html` at `/` and serves real file paths with
no rewrites or clean-URL rewriting. From the project folder:

```bash
cd "C:\Users\jager\Claude\Projects\Portfolio Site"
npx http-server -p 3000
```

Then open `http://localhost:3000/`.

Notes:

- Run the `cd` first — `http-server` serves whatever folder it's launched from, so the root
  must be this folder (you should see `index.html`, `blog/`, `work/`, and `assets/` listed if
  you browse the root, not a `Portfolio Site` folder).
- After adding or editing a post, run `npm run build` first, then refresh the browser.
- Avoid the `serve` package here: its default clean-URL/trailing-slash handling rewrites paths
  and can 404 the blog links. `http-server` does not. (`serve.json` in this folder only affects
  `serve` and is otherwise unused — safe to delete.)

## Editing the rest of the site

`index.html`, `about.html`, and the files in `work/` are plain HTML — edit them directly.
All colors and styling are in `assets/css/style.css` (see the variables at the top to
retune the palette).

## Deploying to S3

Upload everything **except** the source/build files (`node_modules/`, `posts/`, `build.mjs`,
`package*.json`, `serve.json`). The set the site actually serves is:

```
index.html  about.html  work/  blog/  assets/  robots.txt  sitemap.xml
```

Example sync (adjust bucket name). Run it from **inside** this folder so paths land at the
bucket root (otherwise the homepage 404s with `NoSuchKey`):

```bash
npm run build
aws s3 sync . s3://YOUR-BUCKET \
  --exclude "node_modules/*" --exclude "posts/*" \
  --exclude "build.mjs" --exclude "package*.json" --exclude "serve.json" \
  --exclude ".git/*" --exclude "README.md"
```

Confirm the files landed at the root (not under a subfolder):

```bash
aws s3 ls s3://YOUR-BUCKET/      # should list index.html, blog/, work/, assets/
```

Keep the bucket configured for static website hosting with `index.html` as the index
document.

## SEO

Every page has a unique `<title>`, meta description, `<link rel="canonical">`, and Open
Graph + Twitter Card tags (so shared links preview nicely). The homepage carries `Person`
JSON-LD and each post carries `BlogPosting` JSON-LD. `robots.txt` and `sitemap.xml` live at
the root; `npm run build` regenerates `sitemap.xml` automatically from the posts.

If the domain ever changes, update `BASE` at the top of `build.mjs`, rerun the build, and
update the canonical/OG URLs in the hand-written pages (`index.html`, `about.html`,
`work/*.html`) and in `robots.txt`.

Two things to do once it's live:

- **Serve over HTTPS.** The plain S3 website endpoint is HTTP-only; the canonical/OG URLs are
  written as `http://portfolio3.knollitall.com`. Putting CloudFront + an ACM certificate in
  front of the bucket gives you HTTPS (a ranking factor) — switch the `http://` URLs to
  `https://` afterward.
- **Submit the sitemap** in Google Search Console (`http://portfolio3.knollitall.com/sitemap.xml`)
  so pages get indexed.

## Notes

- The three posts currently in `posts/` are starter drafts based on your project history.
  Edit or replace them freely.
- Images were carried over from the previous Angular site and compressed/resized for the web.
