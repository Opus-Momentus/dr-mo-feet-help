# footbackpain

A responsive health-information directory about the possible relationship between feet, movement and back pain. It includes educational resources, Australian starter practice listings and product recommendations. The website is built with React, TypeScript and Vite. The images used by the site are included in `client/public/images`; the site does not require Manus services or an API key to run.

## Run locally

Install Node.js 20.19 or newer (Node 22 is recommended). Open a terminal in the extracted `footbackpain-website` folder and run:

```bash
npm ci
npm run dev
```

Open the local URL printed in the terminal, normally `http://127.0.0.1:5173`. Stop the server with Ctrl+C. To check types and make a production build:

```bash
npm run check
npm run build
npm run preview
```

The build is written to `dist/public`. It contains prerendered pages, images, CSS and JavaScript. Serve it using a static web host rather than opening `index.html` directly as a file.

## Upload the source to GitHub

The ZIP contains the project source and a lockfile; it intentionally excludes `node_modules`, Git history and build output. For an existing local clone, copy the contents of `footbackpain-website` into the repository directory, then run from that directory:

```bash
git status
git add .
git commit -m "Add footbackpain website"
git push
```

If you are creating a new repository, first create an empty repository on GitHub, then follow GitHub's instructions to initialise or connect your local folder and push it. Do not upload `node_modules`.

## Hosting considerations

Publish the contents of `dist/public` to a static hosting service after building. Configure it to serve `index.html` inside each prerendered page directory. The current links and asset paths assume the site is hosted at the root of its domain. A GitHub Pages *project site* hosted under `https://username.github.io/repository-name/` needs a base-path adjustment before deployment; a root-domain deployment does not. The site uses Google Fonts with system fallbacks and sends visitors to external sites for maps, sources, practices and products.

## Editing content

- `client/src/data/articles.ts`: educational articles, sources and related links.
- `client/src/data/providers.ts`: practice information and profile content. Check registration, contact details and fees independently before publishing.
- `client/src/data/products.ts`: product descriptions and merchant URLs. These are currently direct merchant links, **not affiliate links**. Add your approved tracking URLs and update the on-page disclosure before claiming affiliate commissions.
- `client/src/App.tsx`: page layouts, navigation and website text.
- `client/src/index.css`: styling and responsive layouts.
- `client/public/images/`: the included website imagery.
- `scripts/prerender.tsx`: generates static pages for the routes defined by the site.

The health content is general information, not medical advice. Review the clinical content, editorial policy, privacy notice and terms for your audience and jurisdiction before launching.
