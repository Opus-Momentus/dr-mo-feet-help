import React from 'react';
import { renderToString } from 'react-dom/server';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import App, { allRoutes, getMeta } from '../client/src/App';

const base = join(process.cwd(), 'dist/public');
const template = readFileSync(join(base, 'index.html'), 'utf8');
const escape = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
for (const route of allRoutes) {
  const { title, description } = getMeta(route);
  const content = renderToString(<App path={route} />);
  let html = template.replace(/<title>[^<]*<\/title>/, `<title>${escape(title)}</title>`)
    .replace(/<meta name="description" content="[^"]*"\s*\/>/, `<meta name="description" content="${escape(description)}" />`)
    .replace(/<meta property="og:title" content="[^"]*"\s*\/>/, `<meta property="og:title" content="${escape(title)}" />`)
    .replace(/<meta property="og:description" content="[^"]*"\s*\/>/, `<meta property="og:description" content="${escape(description)}" />`)
    .replace('<div id="root"></div>', `<div id="root">${content}</div>`);
  const folder = route === '/' ? base : join(base, route.slice(1));
  mkdirSync(folder, { recursive: true });
  writeFileSync(join(folder, 'index.html'), html);
}
console.log(`Prerendered ${allRoutes.length} public pages.`);
