import React from 'react';
import { renderToString } from 'react-dom/server';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import App, { allRoutes, getMeta } from '../client/src/App';
import { articles } from '../client/src/data/articles';
import { providers } from '../client/src/data/providers';
import { parseDirectoryRoute } from '../client/src/data/directoryRoutes';

const SITE_URL = 'https://footbackpain.com';
const BUILD_DATE = new Date().toISOString().slice(0, 10);
const base = join(process.cwd(), 'dist/public');
const template = readFileSync(join(base, 'index.html'), 'utf8');
const escape = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const stripMarkdown = (text: string) =>
  text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1');

for (const route of allRoutes) {
  const { title, description } = getMeta(route);
  const article = articles.find(a => route === `/resources/${a.slug}`);
  const canonicalUrl = route === '/' ? `${SITE_URL}/` : `${SITE_URL}${route}/`;
  const content = renderToString(<App path={route} />);

  let extraHead = `\n    <link rel="canonical" href="${escape(canonicalUrl)}" />\n    <meta property="og:url" content="${escape(canonicalUrl)}" />`;

  if (article) {
    const fullHeroUrl = `${SITE_URL}${article.heroImage}`;

    const graph: Record<string, unknown>[] = [
      {
        '@type': 'Article',
        headline: article.title,
        description,
        image: [fullHeroUrl],
        inLanguage: 'en-AU',
        author: {
          '@type': 'Organization',
          name: article.author || 'footbackpain Editorial Team',
          url: `${SITE_URL}/`,
        },
        publisher: {
          '@type': 'Organization',
          name: 'footbackpain',
          url: `${SITE_URL}/`,
        },
        ...(article.publishDate ? { datePublished: article.publishDate, dateModified: article.publishDate } : {}),
        ...(article.keywords ? { keywords: article.keywords.join(', ') } : {}),
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': canonicalUrl,
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'The connection', item: `${SITE_URL}/resources/` },
          { '@type': 'ListItem', position: 3, name: article.title, item: canonicalUrl },
        ],
      },
    ];

    if (article.faqs && article.faqs.length > 0) {
      graph.push({
        '@type': 'FAQPage',
        mainEntity: article.faqs.map(f => ({
          '@type': 'Question',
          name: f.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: stripMarkdown(f.answer),
          },
        })),
      });
    }

    const jsonLd = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c');
    extraHead += `\n    <script type="application/ld+json">${jsonLd}</script>`;
  } else {
    const dirRoute = parseDirectoryRoute(route);
    if (dirRoute?.kind === 'provider') {
      const provider = providers.find(p => p.slug === dirRoute.slug);
      if (provider) {
        const stateSlug = provider.state ? provider.state.toLowerCase() : '';
        const breadcrumbs = [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'Directory', item: `${SITE_URL}/directory/` },
          ...(stateSlug
            ? [{ '@type': 'ListItem', position: 3, name: provider.state, item: `${SITE_URL}/directory/${stateSlug}/` }]
            : []),
          {
            '@type': 'ListItem',
            position: stateSlug ? 4 : 3,
            name: provider.name,
            item: canonicalUrl,
          },
        ];
        const clinicGraph: Record<string, unknown>[] = [
          {
            '@type': 'MedicalClinic',
            name: provider.name,
            description: provider.description,
            url: canonicalUrl,
            ...(provider.website ? { sameAs: [provider.website] } : {}),
            ...(provider.phone ? { telephone: provider.phoneHref || provider.phone } : {}),
            medicalSpecialty: provider.type === 'Podiatrist' ? 'Podiatric' : 'Chiropractic',
            address: {
              '@type': 'PostalAddress',
              streetAddress: provider.address,
              ...(provider.city ? { addressLocality: provider.city } : {}),
              ...(provider.state ? { addressRegion: provider.state } : {}),
              ...(provider.postcode ? { postalCode: provider.postcode } : {}),
              addressCountry: 'AU',
            },
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: breadcrumbs,
          },
        ];
        const jsonLd = JSON.stringify({ '@context': 'https://schema.org', '@graph': clinicGraph }).replace(/</g, '\\u003c');
        extraHead += `\n    <script type="application/ld+json">${jsonLd}</script>`;
      }
    } else if (dirRoute?.kind === 'state' || dirRoute?.kind === 'city') {
      const breadcrumbs = [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Directory', item: `${SITE_URL}/directory/` },
        { '@type': 'ListItem', position: 3, name: dirRoute.stateName, item: `${SITE_URL}/directory/${dirRoute.stateSlug}/` },
        ...(dirRoute.kind === 'city'
          ? [{ '@type': 'ListItem', position: 4, name: dirRoute.cityName, item: canonicalUrl }]
          : []),
      ];
      const collectionGraph = [
        {
          '@type': 'CollectionPage',
          name: title,
          description,
          url: canonicalUrl,
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: breadcrumbs,
        },
      ];
      const jsonLd = JSON.stringify({ '@context': 'https://schema.org', '@graph': collectionGraph }).replace(/</g, '\\u003c');
      extraHead += `\n    <script type="application/ld+json">${jsonLd}</script>`;
    }
  }

  let html = template
    .replace(/<title>[^<]*<\/title>/, `<title>${escape(title)}</title>`)
    .replace(/<meta name="description" content="[^"]*"\s*\/>/, `<meta name="description" content="${escape(description)}" />`)
    .replace(/<meta property="og:title" content="[^"]*"\s*\/>/, `<meta property="og:title" content="${escape(title)}" />`)
    .replace(/<meta property="og:description" content="[^"]*"\s*\/>/, `<meta property="og:description" content="${escape(description)}" />`)
    .replace('</head>', `${extraHead}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${content}</div>`);

  if (article) {
    const fullHeroUrl = `${SITE_URL}${article.heroImage}`;
    html = html
      .replace(/<meta property="og:image" content="[^"]*"\s*\/>/, `<meta property="og:image" content="${escape(fullHeroUrl)}" />`)
      .replace(/\n?\s*<meta property="og:image:width" content="[^"]*"\s*\/>/, '')
      .replace(/\n?\s*<meta property="og:image:height" content="[^"]*"\s*\/>/, '')
      .replace(/<meta name="twitter:image" content="[^"]*"\s*\/>/, `<meta name="twitter:image" content="${escape(fullHeroUrl)}" />`)
      .replace(/<meta property="og:type" content="website"\s*\/>/, '<meta property="og:type" content="article" />');
    if (article.keywords && article.keywords.length > 0) {
      html = html.replace(
        /<meta name="keywords" content="[^"]*"\s*\/>/,
        `<meta name="keywords" content="${escape(article.keywords.join(', '))}" />`
      );
    }
  }

  const folder = route === '/' ? base : join(base, route.slice(1));
  mkdirSync(folder, { recursive: true });
  writeFileSync(join(folder, 'index.html'), html);
}

const sitemapXml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...allRoutes.map(route => {
    const loc = route === '/' ? `${SITE_URL}/` : `${SITE_URL}${route}/`;
    const article = articles.find(a => route === `/resources/${a.slug}`);
    const lastmod = article?.publishDate || BUILD_DATE;
    const priority =
      route === '/'
        ? '1.0'
        : route === '/resources' || route === '/directory'
          ? '0.9'
          : route.startsWith('/resources/') || /^\/directory\/[a-z]{2,3}(\/|$)/.test(route)
            ? '0.8'
            : '0.7';
    return `  <url><loc>${loc}</loc><lastmod>${lastmod}</lastmod><priority>${priority}</priority></url>`;
  }),
  '</urlset>',
  '',
].join('\n');

writeFileSync(join(base, 'sitemap.xml'), sitemapXml);
writeFileSync(join(base, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);

console.log(`Prerendered ${allRoutes.length} public pages + sitemap.xml + robots.txt.`);
