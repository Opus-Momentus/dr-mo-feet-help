# Footbackpain.com

A single-page services and product directory for people with lower back pain, built around the link between foot health and back health. Plain HTML, CSS and JavaScript. No frameworks, no build step.

Live domain: https://footbackpain.com
Repo: https://github.com/Opus-Momentus/dr-mo-feet-help

## Run locally

Open `index.html` in a browser. No server is needed.

## Structure

```
index.html      Page markup and sections
css/styles.css  Styling; colour and width tokens in :root
js/data.js      Content: chain steps, categories, listings (edit this most)
js/app.js       Chain explorer, search and filters
assets/         favicon.svg
CNAME           Custom domain for GitHub Pages
```

## Add or change a listing

Edit `LISTINGS` in `js/data.js`:

```js
{ type: "service",            // "service" or "product"
  category: "Assessment",     // must match an entry in CATEGORIES
  name: "Your listing name",
  description: "What it is.",
  feet: "How it relates to foot health.",
  tags: ["tag one", "tag two"],
  url: "https://example.com" }
```

The sample listings are placeholders. Replace them with real ones before launch.

## Deploy with GitHub Pages

1. Push to the `main` branch.
2. In the repo, open Settings > Pages and choose "Deploy from a branch", `main`, `/ (root)`.
3. At your domain registrar, point `footbackpain.com` to GitHub Pages (see GitHub's custom domain docs). The `CNAME` file is already included.

## Notes

- Listing text is inserted with `textContent`, so listings cannot inject HTML.
- The footer carries a medical disclaimer. Keep it.
