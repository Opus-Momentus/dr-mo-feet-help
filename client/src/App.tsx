import React, { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Activity, BadgeCheck, Calendar, Check, ChevronDown, Compass, ExternalLink, Footprints, Heart, MapPin, Menu, Phone, Search, ShieldCheck, Sparkles, X } from 'lucide-react';
import { articles, type SectionBlock } from './data/articles';
import { providers, type Provider } from './data/providers';
import { localCityRoutes, localStateRoutes, parseDirectoryRoute } from './data/directoryRoutes';
import { products } from './data/products';
import { DirectoryEnquirySection } from './components/DirectoryEnquirySection';
import { ProviderEnquiryForm } from './components/ProviderEnquiryForm';
import { MovementMap } from './components/MovementQuiz';
import { trackEvent } from './utils/analytics';

const HERO = '/images/hero-walking.webp';
const GAIT = '/images/education-gait.webp';
const CARE = '/images/care-podiatry.webp';
const PODIME_AFFILIATE_URL = 'https://podime.com.au?bg_ref=bDQ1o6IXhD';

const externalProps = { target: '_blank', rel: 'noopener noreferrer' } as const;
const affiliateProps = { target: '_blank', rel: 'sponsored noopener noreferrer' } as const;

export const allRoutes = [
  '/',
  '/resources',
  ...articles.map(a => `/resources/${a.slug}`),
  '/directory',
  ...localStateRoutes.map(s => s.path),
  ...localCityRoutes.map(c => c.path),
  ...providers.map(p => `/directory/${p.slug}`),
  '/products',
  '/about',
];

export function getMeta(path: string) {
  const clean = path.length > 1 ? path.replace(/\/$/, '') : path;
  const article = articles.find(a => clean === `/resources/${a.slug}`);
  const dirRoute = parseDirectoryRoute(clean);
  if (article) return { title: article.metaTitle || `${article.title} | footbackpain`, description: article.metaDescription || article.summary };
  if (dirRoute?.kind === 'state') {
    return {
      title: `Podiatrists & Chiropractors in ${dirRoute.stateName} (${dirRoute.stateCode}) | footbackpain`,
      description: `Browse podiatry and chiropractic practices across ${dirRoute.stateName}. Compare locations, services, and request an appointment.`,
    };
  }
  if (dirRoute?.kind === 'city') {
    return {
      title: `Podiatrists & Chiropractors in ${dirRoute.cityName}, ${dirRoute.stateCode} | footbackpain`,
      description: `Find podiatrists and chiropractors in ${dirRoute.cityName}, ${dirRoute.stateCode} for foot, gait, and lower back care.`,
    };
  }
  if (dirRoute?.kind === 'provider') {
    const provider = providers.find(p => p.slug === dirRoute.slug);
    if (provider) {
      return {
        title: `${provider.name} | footbackpain Directory`,
        description: `${provider.type} practice in ${[provider.city, provider.state].filter(Boolean).join(', ') || 'Australia'}. Find contact details, location, and services.`,
      };
    }
  }
  if (clean === '/resources') return { title: 'Foot & Back Pain Resources | footbackpain', description: 'Understand foot mechanics, back pain, orthotics and your options for care with clear, evidence-informed resources.' };
  if (clean === '/directory') return { title: 'Find a Podiatrist or Chiropractor | footbackpain', description: 'Explore podiatry and chiropractic practices across Australia by state, city, and discipline.' };
  if (clean === '/products') return { title: 'Thoughtful Foot Comfort Products | footbackpain', description: 'Explore footwear, insoles and movement tools with practical guidance and transparent links.' };
  if (clean === '/about') return { title: 'About & Editorial Standards | footbackpain', description: 'Learn about footbackpain, our clinical editorial framework, privacy, terms and disclosures.' };
  return { title: 'footbackpain | Foot health, back pain & better movement', description: 'Explore the possible connection between your feet and back, find practical resources, and discover podiatrists and chiropractors near you.' };
}

function renderFormattedSpan(text: string, keyPrefix: string): React.ReactNode[] {
  const tokenRegex = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
  const parts = text.split(tokenRegex);
  return parts.filter(p => p.length > 0).map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={`${keyPrefix}-b-${idx}`}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={`${keyPrefix}-i-${idx}`}>{part.slice(1, -1)}</em>;
    }
    return <React.Fragment key={`${keyPrefix}-t-${idx}`}>{part}</React.Fragment>;
  });
}

function renderRichText(text: string): React.ReactNode {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let linkIdx = 0;

  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(...renderFormattedSpan(text.slice(lastIndex, match.index), `seg-${linkIdx}`));
    }
    const label = match[1];
    const url = match[2].trim();
    const isAffiliate = url.includes('podime.com.au');
    const isExternal = url.startsWith('http://') || url.startsWith('https://');

    if (isAffiliate) {
      nodes.push(
        <a
          key={`lnk-${linkIdx}`}
          href={url}
          {...affiliateProps}
          className="inline-affiliate-link"
          onClick={() => trackEvent('affiliate_click', { url, label, placement: 'inline_article' })}
        >
          {renderFormattedSpan(label, `lbl-${linkIdx}`)}
        </a>
      );
    } else if (isExternal) {
      nodes.push(
        <a key={`lnk-${linkIdx}`} href={url} {...externalProps} className="inline-ext-link">
          {renderFormattedSpan(label, `lbl-${linkIdx}`)}
        </a>
      );
    } else {
      nodes.push(
        <a key={`lnk-${linkIdx}`} href={url} className="inline-int-link">
          {renderFormattedSpan(label, `lbl-${linkIdx}`)}
        </a>
      );
    }

    lastIndex = match.index + match[0].length;
    linkIdx++;
  }

  if (lastIndex < text.length) {
    nodes.push(...renderFormattedSpan(text.slice(lastIndex), 'tail'));
  }

  return nodes;
}

function renderSectionBlock(block: SectionBlock, idx: number): React.ReactNode {
  switch (block.type) {
    case 'p':
      return <p key={idx}>{renderRichText(block.text)}</p>;
    case 'h3':
      return <h3 key={idx}>{renderRichText(block.text)}</h3>;
    case 'ul':
      return <ul key={idx}>{block.items.map((item, i) => <li key={i}>{renderRichText(item)}</li>)}</ul>;
    case 'ol':
      return <ol key={idx}>{block.items.map((item, i) => <li key={i}>{renderRichText(item)}</li>)}</ol>;
    case 'table':
      return (
        <div className="article-table-wrap" key={idx}>
          <table className="article-table">
            <thead>
              <tr>{block.headers.map((h, i) => <th scope="col" key={i}>{renderRichText(h)}</th>)}</tr>
            </thead>
            <tbody>
              {block.rows.map((row, rIdx) => (
                <tr key={rIdx}>{row.map((cell, cIdx) => <td key={cIdx}>{renderRichText(cell)}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'cta':
      return (
        <aside className="article-cta-box" aria-label="Featured foot support recommendation" key={idx}>
          <span className="card-kicker">PODIATRY-DESIGNED SUPPORT · AFFILIATE PARTNER</span>
          <h3>{block.heading}</h3>
          {block.paragraphs.map((cp, i) => <p key={i}>{renderRichText(cp)}</p>)}
          <a
            className="btn btn-dark"
            href={block.buttonUrl}
            {...affiliateProps}
            onClick={() => trackEvent('affiliate_click', { url: block.buttonUrl, label: block.buttonLabel, placement: 'article_cta' })}
          >
            {block.buttonLabel} <ArrowUpRight size={16}/>
          </a>
        </aside>
      );
  }
}

function Mark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <svg viewBox="0 0 100 104" fill="none">
        <path className="mark-leg" d="M27 20C13 35 13 54 22 69C26 75 33 76 36 73C29 70 25 60 25 46C25 34 27 26 29 21C29 19 27 20 27 20Z"/>
        <path className="mark-leg" d="M53 7C53 15 49 20 42 26C37 31 38 42 39 51C41 61 53 69 69 75C78 79 86 80 91 81C94 82 93 86 89 86C78 86 66 81 52 74C37 66 32 56 32 42C32 30 36 22 44 16C47 13 48 9 49 6C51 4 53 7 53 7Z"/>
        <path className="mark-accent" d="M42 28C48 26 53 32 52 41C46 40 41 35 42 28Z"/>
        <path className="mark-sole" d="M16 74C10 83 14 95 28 96C38 97 47 93 58 94C68 95 79 96 88 94C93 93 93 89 89 88C78 88 65 88 52 84C39 81 29 77 21 73C18 71 16 74 16 74Z"/>
      </svg>
    </span>
  );
}
function Logo({ light = false }: {light?: boolean}) { return <a className={`logo ${light ? 'logo-light' : ''}`} href="/" aria-label="footbackpain home"><Mark/><span>footbackpain<span className="logo-tld">.com</span></span></a>; }
function ArrowLink({ href, children, external = false, className = '' }: {href: string; children: React.ReactNode; external?: boolean; className?: string}) { return <a href={href} className={`text-link ${className}`} {...(external ? externalProps : {})}>{children} {external ? <ArrowUpRight size={15}/> : <ArrowRight size={15}/>}</a>; }

function Header() {
  const [open, setOpen] = useState(false);
  return <>
    <a className="skip-link" href="#main-content">Skip to content</a>
    <div className="topline"><span>A LITTLE MORE CLARITY, FROM THE GROUND UP</span><a href="/resources">EXPLORE THE CONNECTION <ArrowUpRight size={13}/></a></div>
    <header className="header"><div className="header-inner"><Logo/><nav className={open ? 'navigation navigation-open' : 'navigation'} aria-label="Main navigation"><a href="/resources">The connection</a><a href="/directory">Find a practitioner</a><a href="/directory#list-your-practice">List your practice</a><a href="/products">Thoughtful picks</a><a href="/about">About us</a><a className="mobile-nav-cta" href="/directory">Find care near you <ArrowUpRight size={15}/></a></nav><a className="header-cta" href="/directory">Find care near you <ArrowUpRight size={15}/></a><button className="menu-toggle" onClick={() => setOpen(!open)} aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open}>{open ? <X size={23}/> : <Menu size={23}/>}</button></div></header>
  </>;
}
function Footer() { return <footer className="footer"><div className="wrap footer-top"><div className="footer-brand"><Logo light/><p>Better understanding for every step of your journey.</p></div><div><span className="footer-label">EXPLORE</span><a href="/resources">The connection</a><a href="/directory">Find a practitioner</a><a href="/directory#list-your-practice">List your practice</a><a href="/products">Thoughtful picks</a></div><div><span className="footer-label">FOOTBACKPAIN</span><a href="/about">Our approach</a><a href="/about#editorial">Editorial principles</a><a href="/about#privacy">Privacy & terms</a></div><div className="footer-note"><span className="footer-label">A NOTE ON HEALTH</span><p>Information here is educational, not a diagnosis or a substitute for individual medical advice.</p></div></div><div className="wrap footer-bottom"><span>© {new Date().getFullYear()} footbackpain. Made for moving forward.</span><span>Take good care, from the ground up.</span></div></footer>; }

function SafetyNotice({ compact = false }: {compact?: boolean}) { return <div className={`safety ${compact ? 'safety-compact' : ''}`}><ShieldCheck size={20}/><div><strong>A note on your health</strong><p>Back pain has many possible causes. This information is educational and is not a diagnosis. Seek urgent medical care for new bladder or bowel problems, numbness around the groin, severe or worsening leg weakness, pain after a significant injury, or fever with severe back symptoms. <a href="/resources/surprising-link-between-back-pain-and-foot-pain#faq">Know when to seek care</a>.</p></div></div>; }

function SearchForm({ initialLocation = '', initialType = 'All practitioners', onSearch }: { initialLocation?: string; initialType?: string; onSearch?: (location: string, type: string) => void }) {
  const [location, setLocation] = useState(initialLocation);
  const [type, setType] = useState(initialType);
  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (onSearch) onSearch(location, type);
    else window.location.href = `/directory?location=${encodeURIComponent(location)}&type=${encodeURIComponent(type)}`;
  }
  return <form className="search-form" onSubmit={submit}><label className="search-location"><MapPin size={19}/><span className="sr-only">City, suburb or postcode</span><input placeholder="City, suburb or postcode" value={location} onChange={e => setLocation(e.target.value)} /></label><label className="search-type"><span className="sr-only">Practitioner type</span><select value={type} onChange={e => setType(e.target.value)}><option>All practitioners</option><option>Podiatrist</option><option>Chiropractor</option></select><ChevronDown size={16}/></label><button className="btn btn-dark" type="submit">Search <Search size={17}/></button></form>;
}

function SectionLabel({children, number}: {children: React.ReactNode; number?: string}) { return <div className="section-label">{number && <span>{number}</span>}<i/> {children}</div>; }
function ArticleCard({ article, index = 0, image = false }: {article: typeof articles[number]; index?: number; image?: boolean}) {
  const imgIdx = index % 3;
  return <a href={`/resources/${article.slug}`} className={`article-card ${image ? 'article-card-image' : ''}`}>
    {image && (
      <div className={`article-image article-image-${imgIdx}`}>
        {article.heroImage
          ? <img src={article.heroImage} alt={article.heroAlt} loading="lazy" />
          : imgIdx === 0
            ? <img src={GAIT} alt="Walking shoes on a sunlit path"/>
            : imgIdx === 1
              ? <div className="abstract-arches"><span/><span/><span/></div>
              : <img src={CARE} alt="A healthcare professional discussing foot health with a patient"/>}
      </div>
    )}
    <div className="article-card-body"><div className="card-meta">{article.category} <span>·</span> {article.readTime}</div><h3>{article.title}</h3><p>{article.summary}</p><span className="read-link">Read the article <ArrowUpRight size={16}/></span></div>
  </a>;
}
function formatProviderLocation(p: Provider) {
  const region = [p.state, p.postcode].filter(Boolean).join(' ');
  return [p.city, region].filter(Boolean).join(', ');
}
function ProviderCard({provider}: {provider: Provider}) {
  return (
    <article className={`provider-card ${provider.featured ? 'provider-card-featured' : ''}`}>
      <div className="provider-card-top">
        <span className="provider-icon"><MapPin size={19}/></span>
        <div className="provider-tags-group">
          {provider.featured && <span className="provider-tag provider-tag-featured"><Sparkles size={11}/> Featured</span>}
          {provider.verified && <span className="provider-tag provider-tag-verified"><BadgeCheck size={11}/> Verified</span>}
          <span className="provider-tag">{provider.type}</span>
        </div>
      </div>
      <h3>{provider.name}</h3>
      <p className="provider-location"><MapPin size={15}/> {formatProviderLocation(provider) || provider.address}</p>
      <p className="provider-description">{provider.description}</p>
      <div className="provider-services">{provider.services.slice(0,2).map(s => <span key={s}>{s}</span>)}</div>
      <div className="provider-bottom">
        <a href={`/directory/${provider.slug}`}>View practice <ArrowRight size={16}/></a>
        {provider.website && (
          <a
            href={provider.website}
            {...externalProps}
            aria-label={`Visit ${provider.name} website`}
            onClick={() => trackEvent('provider_website_click', { provider_slug: provider.slug, provider_name: provider.name, placement: 'directory_card' })}
          >
            <ExternalLink size={16}/>
          </a>
        )}
      </div>
    </article>
  );
}
function ProductCard({product, index}: {product: typeof products[number]; index: number}) {
  const Icon = [Footprints, Activity, Sparkles][index % 3];
  const linkAttrs = product.sponsored ? affiliateProps : externalProps;
  return (
    <article className="product-card">
      <div className={`product-art product-art-${index % 3}`}>
        <Icon size={58} strokeWidth={1.05}/>
        <span className="product-art-label">{product.sponsored ? <>PODIATRIST-DESIGNED<br/>PARTNER PICK</> : <>A LITTLE SUPPORT<br/>FOR EVERY DAY</>}</span>
      </div>
      <div className="product-copy">
        <div className="card-meta">{product.category}{product.sponsored ? ' · AFFILIATE' : ''}</div>
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <a
          className="read-link"
          href={product.url}
          {...linkAttrs}
          onClick={() =>
            trackEvent(product.sponsored ? 'affiliate_click' : 'outbound_product_click', {
              product_name: product.name,
              merchant: product.merchant,
              url: product.url,
              placement: 'product_card',
            })
          }
        >
          {product.sponsored ? `Shop ${product.merchant}` : `Visit ${product.merchant}`} <ArrowUpRight size={16}/>
        </a>
      </div>
    </article>
  );
}

function Home() { return <>
  <section className="hero"><div className="wrap hero-grid"><div className="hero-copy"><div className="eyebrow"><span className="eyebrow-dot"/> A FRESH PERSPECTIVE ON PAIN</div><h1>Feel better,<br/><em>from the ground up.</em></h1><p className="hero-description">Your feet and your back may be more connected than you think. Let's make sense of how you move, and find a little more ease along the way.</p><div className="hero-actions"><a className="btn btn-dark" href="/resources">Explore the connection <ArrowUpRight size={17}/></a><a className="btn btn-outline" href="/directory">Find a practitioner <ArrowRight size={17}/></a></div><div className="hero-small"><span className="small-icon"><Heart size={15}/></span><span>Thoughtful information for real life.</span></div></div><div className="hero-visual"><div className="hero-image-frame"><img src={HERO} alt="A person walking along a sunlit coastal path"/></div><div className="floating-note"><span className="floating-icon"><Activity size={22}/></span><div><span>EVERY STEP COUNTS</span><strong>Small steps. A better understanding.</strong></div></div><div className="hero-image-index">01 / 03 <span/> MOVE WITH MORE EASE</div></div></div><div className="wrap hero-bottom"><div><span className="mini-sun">✳</span> YOUR BODY IS CONNECTED</div><p>A little knowledge can be a good first step.</p><a href="#connection" aria-label="Scroll to the foot and back connection"><ArrowDown size={17}/></a></div></section>
  <section className="connection section" id="connection"><div className="wrap"><div className="section-heading split-heading"><div><SectionLabel number="01">THE FOOT &amp; BACK CONNECTION</SectionLabel><h2>Let's look at the<br/><em>whole picture.</em></h2></div><div className="heading-aside"><p>How you walk and move can affect how your body feels. For some people, foot function may be one piece of the back-pain puzzle, though it is rarely the whole story.</p><ArrowLink href="/resources/surprising-link-between-back-pain-and-foot-pain">Understand the connection</ArrowLink></div></div><div className="pathway"><a href="/resources/foot-alignment-and-lower-back-pain-kinetic-chain"><span className="path-number">01</span><span className="path-icon"><Footprints size={25}/></span><h3>Start with your feet</h3><p>Get to know the way your feet support everyday movement.</p><ArrowUpRight size={18}/></a><a href="/resources/signs-lower-back-pain-connected-to-your-feet"><span className="path-number">02</span><span className="path-icon"><Activity size={25}/></span><h3>Notice the patterns</h3><p>Learn what to pay attention to and when to seek help.</p><ArrowUpRight size={18}/></a><a href="/directory"><span className="path-number">03</span><span className="path-icon"><Compass size={25}/></span><h3>Find your next step</h3><p>Connect with a qualified professional in your area.</p><ArrowUpRight size={18}/></a></div><MovementMap/></div></section>
  <section className="resources-section section"><div className="wrap"><div className="section-heading row-heading"><div><SectionLabel number="02">KNOWLEDGE IS A GOOD FIRST STEP</SectionLabel><h2>A little more <em>understanding.</em></h2><p>Clear, considered reading for the questions on your mind.</p></div><ArrowLink href="/resources" className="heading-link">Explore all resources</ArrowLink></div><div className="article-grid">{articles.slice(0,3).map((article, index) => <ArticleCard article={article} index={index} image key={article.slug}/>)}</div></div></section>
  <section className="directory-band"><div className="wrap directory-band-grid"><div><SectionLabel number="03">GOOD CARE, CLOSE TO HOME</SectionLabel><h2>You don't have to<br/><em>figure it out alone.</em></h2><p>Finding the right person to talk to can make all the difference. Explore local podiatry and chiropractic practices, and take the next step with confidence.</p><div className="directory-checks"><span><Check size={15}/> Search by location</span><span><Check size={15}/> Explore care options</span></div><p className="directory-practitioner-cta">Are you an Australian practitioner? <ArrowLink href="/directory#list-your-practice">Enquire to list your practice</ArrowLink></p></div><div className="directory-search-card"><span className="card-kicker">YOUR NEXT STEP STARTS HERE</span><h3>Find a practitioner</h3><p>Search our starting selection of Australian practices, or explore more options on a map.</p><SearchForm/><p className="search-footnote"><MapPin size={14}/> Start with your suburb, city or postcode</p></div></div></section>
  <section className="section product-preview"><div className="wrap"><div className="section-heading row-heading"><div><SectionLabel number="04">A LITTLE EVERYDAY SUPPORT</SectionLabel><h2>Thoughtful picks for <em>moving well.</em></h2><p>Simple tools and essentials worth getting to know.</p></div><ArrowLink href="/products" className="heading-link">Explore all picks</ArrowLink></div><div className="product-grid">{products.slice(0,3).map((p, i) => <ProductCard product={p} index={i} key={p.name}/>)}</div><p className="disclosure">Items marked Affiliate earn a small commission at no extra cost to you when purchased through our link. Products are not a standalone treatment for back pain. <a href="/about#disclosure">Our disclosure</a></p></div></section>
  <section className="closing"><div className="wrap closing-inner"><div className="closing-star">✳</div><div><div className="eyebrow">A BETTER PLACE TO BEGIN</div><h2>One step at a time.<br/><em>We're here for the journey.</em></h2><p>Good information. Thoughtful choices. A little more confidence in what comes next.</p><a className="btn btn-dark" href="/resources">Start exploring <ArrowUpRight size={17}/></a></div></div></section>
</>; }

function Resources() { return <main id="main-content"><div className="page-hero"><div className="wrap"><div className="breadcrumb"><a href="/">HOME</a> / THE CONNECTION</div><SectionLabel>THE FOOTBACKPAIN GUIDE</SectionLabel><h1>Understand the <em>connection.</em></h1><p>Clear, practical information to help you better understand your feet, your back, and the way you move.</p></div></div><section className="section"><div className="wrap"><div className="library-intro"><span>THE RESOURCE LIBRARY</span><span>{articles.length.toString().padStart(2,'0')} GUIDES</span></div><div className="article-grid article-grid-library">{articles.map((article, index) => <ArticleCard article={article} index={index % 3} image key={article.slug}/>)}</div><SafetyNotice/></div></section></main>; }

function ResourcePage({slug}: {slug: string}) {
  const article = articles.find(a => a.slug === slug);
  if (!article) return <NotFound/>;
  const related = articles.filter(a => article.related.includes(a.slug));
  const introParas = article.intro.split('\n\n').filter(p => p.trim().length > 0);

  return (
    <main id="main-content">
      <div className="article-hero">
        <div className="wrap article-hero-inner">
          <a className="back-link" href="/resources"><ArrowLeft size={15}/> All resources</a>
          <div className="card-meta">
            {article.category} <span>·</span> {article.readTime}
            {article.author && <> <span>·</span> {article.author}</>}
          </div>
          <h1>{article.title}</h1>
          <div className="article-intro-group">
            {introParas.map((para, idx) => <p className="article-intro-p" key={idx}>{renderRichText(para)}</p>)}
          </div>
          <div className="article-disclaimer">
            <ShieldCheck size={17}/>
            <span>
              Educational information, not a medical diagnosis or treatment.
              {article.hasAffiliateLinks && (
                <>
                  {' '}Contains affiliate links to{' '}
                  <a
                    href={PODIME_AFFILIATE_URL}
                    {...affiliateProps}
                    onClick={() => trackEvent('affiliate_click', { url: PODIME_AFFILIATE_URL, label: 'PodiMe Foot Care', placement: 'article_disclaimer' })}
                  >
                    PodiMe Foot Care
                  </a>
                  ; we may earn a small commission at no extra cost to you.
                </>
              )}
            </span>
          </div>
          {article.heroImage && (
            <figure className="article-hero-figure">
              <img src={article.heroImage} alt={article.heroAlt} />
            </figure>
          )}
        </div>
      </div>

      <div className="wrap article-layout">
        <article className="prose">
          <p className="article-lead">{article.summary}</p>

          {article.takeaways && article.takeaways.length > 0 && (
            <div className="takeaways-box" role="note" aria-label="Key takeaways">
              <span className="card-kicker">KEY TAKEAWAYS</span>
              <ul>
                {article.takeaways.map((item, idx) => <li key={idx}>{renderRichText(item)}</li>)}
              </ul>
            </div>
          )}

          {article.sections.map(s => (
            <section key={s.heading}>
              <h2>{s.heading}</h2>
              {s.blocks && s.blocks.length > 0
                ? s.blocks.map((block, bIdx) => renderSectionBlock(block, bIdx))
                : s.paragraphs.map((p, i) => <p key={i}>{renderRichText(p)}</p>)}
            </section>
          ))}

          {article.faqs && article.faqs.length > 0 && (
            <section className="faq-section" id="faq">
              <h2>Frequently asked questions</h2>
              {article.faqs.map((f, idx) => (
                <div className="faq-entry" key={idx}>
                  <h3>{f.question}</h3>
                  <p>{renderRichText(f.answer)}</p>
                </div>
              ))}
            </section>
          )}

          <SafetyNotice compact/>

          <section className="sources">
            <h2>Sources & further reading</h2>
            <p>These sources can help you explore the clinical insights and guidance behind this topic.</p>
            {article.sources.map(s => <a key={s.url} href={s.url} {...externalProps}>{s.label}<ArrowUpRight size={15}/></a>)}
          </section>
        </article>

        <aside className="article-aside">
          {article.hasAffiliateLinks && (
            <div className="aside-card-podime">
              <span className="card-kicker">AUSTRALIAN PODIATRY SUPPORT</span>
              <h3>Support tired arches &amp; heels at home</h3>
              <p>Explore PodiMe&apos;s podiatrist-designed orthotic innersoles, offloaders, Poron heel pads, and bunion care, delivered Australia-wide.</p>
              <a
                className="aside-podime-btn"
                href={PODIME_AFFILIATE_URL}
                {...affiliateProps}
                onClick={() => trackEvent('affiliate_click', { url: PODIME_AFFILIATE_URL, label: 'Shop PodiMe range', placement: 'article_aside' })}
              >
                Shop PodiMe range <ArrowUpRight size={15}/>
              </a>
            </div>
          )}
          <div className="aside-card">
            <span className="card-kicker">A GOOD NEXT STEP</span>
            <h3>Have questions about your movement?</h3>
            <p>A qualified health professional can help you look at your individual circumstances.</p>
            <ArrowLink href="/directory">Find a practitioner</ArrowLink>
          </div>
          <div className="aside-note">
            <span>OUR APPROACH</span>
            <p>Thoughtful information, useful questions, and no one-size-fits-all answers.</p>
            <a href="/about#editorial">Our editorial principles →</a>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="section related-section">
          <div className="wrap">
            <div className="section-heading row-heading">
              <div><SectionLabel>KEEP EXPLORING</SectionLabel><h2>More to <em>understand.</em></h2></div>
              <ArrowLink href="/resources">All resources</ArrowLink>
            </div>
            <div className="article-grid">
              {related.map((a, i) => <ArticleCard article={a} index={i} image key={a.slug}/>)}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

function Directory({
  initialStateCode = '',
  initialStateName = '',
  initialCityName = '',
}: {
  initialStateCode?: string;
  initialStateName?: string;
  initialCityName?: string;
}) {
  const [location, setLocation] = useState(initialCityName || '');
  const [type, setType] = useState('All practitioners');
  const [formKey, setFormKey] = useState(0);
  const [visibleCount, setVisibleCount] = useState(48);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const qLoc = query.get('location');
    if (qLoc !== null) setLocation(qLoc);
    const requestedType = query.get('type');
    setType(requestedType === 'Podiatrist' || requestedType === 'Chiropractor' ? requestedType : 'All practitioners');
    setFormKey(1);
  }, []);

  const filtered = useMemo(() => {
    const q = location.trim().toLowerCase();
    return providers
      .filter(p => {
        if (initialStateCode && p.state !== initialStateCode) return false;
        const searchable = `${p.name} ${p.city} ${p.state} ${p.postcode} ${p.address}`.toLowerCase();
        return (!q || searchable.includes(q)) && (type === 'All practitioners' || p.type === type);
      })
      .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
  }, [location, type, initialStateCode]);

  const visible = filtered.slice(0, visibleCount);
  const stateCities = useMemo(
    () => (initialStateCode ? localCityRoutes.filter(c => c.stateCode === initialStateCode).slice(0, 12) : []),
    [initialStateCode]
  );
  const locationContext = initialCityName
    ? `${initialCityName}, ${initialStateCode}`
    : initialStateName || 'Australia';
  const mapsQuery = `${type === 'All practitioners' ? 'podiatrists and chiropractors' : type} ${location || locationContext}`;

  return (
    <main id="main-content">
      <div className="page-hero directory-hero">
        <div className="wrap">
          <div className="breadcrumb">
            <a href="/">HOME</a> / <a href="/directory">FIND CARE</a>
            {initialStateName && (
              <>
                {' '} / <a href={`/directory/${initialStateCode.toLowerCase()}`}>{initialStateCode}</a>
              </>
            )}
            {initialCityName && <> / {initialCityName.toUpperCase()}</>}
          </div>
          <SectionLabel>FIND YOUR NEXT STEP</SectionLabel>
          <h1>
            {initialCityName ? (
              <>Podiatrists &amp; Chiropractors in <em>{initialCityName}.</em></>
            ) : initialStateName ? (
              <>Find care in <em>{initialStateName}.</em></>
            ) : (
              <>Good care starts <em>with a conversation.</em></>
            )}
          </h1>
          <p>
            Explore Australian podiatry and chiropractic practices{initialStateName ? ` in ${locationContext}` : ''}, then find the person who feels right for you.
          </p>
          <SearchForm
            key={formKey}
            initialLocation={location}
            initialType={type}
            onSearch={(l, t) => {
              setLocation(l);
              setType(t);
              setVisibleCount(48);
            }}
          />
          <nav className="directory-state-pills" aria-label="Browse practices by Australian state">
            <a href="/directory" className={!initialStateCode ? 'active' : ''}>All Australia</a>
            {localStateRoutes.map(st => (
              <a
                key={st.code}
                href={st.path}
                className={initialStateCode === st.code ? 'active' : ''}
              >
                {st.code} ({st.count})
              </a>
            ))}
          </nav>
          {stateCities.length > 0 && (
            <nav className="directory-city-links" aria-label={`Popular locations in ${initialStateCode}`}>
              <span>Popular areas in {initialStateCode}:</span>
              {stateCities.map(c => (
                <a
                  key={c.path}
                  href={c.path}
                  className={initialCityName === c.cityName ? 'active' : ''}
                >
                  {c.cityName} ({c.count})
                </a>
              ))}
            </nav>
          )}
        </div>
      </div>

      <section className="section directory-results">
        <div className="wrap">
          <div className="results-heading">
            <div>
              <SectionLabel>EXPLORE PRACTICES</SectionLabel>
              <h2>Find care <em>near you.</em></h2>
              <p>Listings cover Australian practices from public directories and practice websites. Details can change, so please confirm directly.</p>
            </div>
            <span className="results-count" role="status" aria-live="polite">
              {filtered.length} {filtered.length === 1 ? 'PRACTICE' : 'PRACTICES'}
            </span>
          </div>

          {filtered.length ? (
            <>
              <div className="provider-grid">
                {visible.map(p => <ProviderCard provider={p} key={p.slug}/>)}
              </div>
              {filtered.length > visibleCount && (
                <div style={{display:'flex',justifyContent:'center',marginTop:'2rem'}}>
                  <button type="button" className="btn btn-outline" onClick={() => setVisibleCount(c => c + 48)}>
                    Show more practices ({filtered.length - visibleCount} remaining)
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <MapPin size={28}/>
              <h3>No listings in this selection</h3>
              <p>Try another location or practitioner type. You can also search a map for more practices.</p>
            </div>
          )}

          <div className="more-options">
            <div>
              <h3>Looking somewhere else?</h3>
              <p>Our directory is a starting point, not a complete list. Search a map for more practitioners in your area.</p>
            </div>
            <a className="btn btn-outline" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`} {...externalProps}>
              Search Google Maps <ArrowUpRight size={16}/>
            </a>
          </div>

          <div className="directory-notice">
            <ShieldCheck size={20}/>
            <p>Listings are based on public practice information, not an endorsement or a verification of individual registration. In Australia, check your practitioner's registration on the <a href="https://www.ahpra.gov.au/Registration/Registers-of-Practitioners" {...externalProps}>Ahpra register</a>, and confirm services and fees with the practice.</p>
          </div>
        </div>
      </section>
      <DirectoryEnquirySection/>
    </main>
  );
}

function ProviderPage({slug}: {slug: string}) {
  const p = providers.find(item => item.slug === slug);
  if (!p) return <NotFound/>;
  const statePath = p.state ? `/directory/${p.state.toLowerCase()}` : '/directory';
  return (
    <main id="main-content">
      <div className="page-hero profile-hero">
        <div className="wrap">
          <a className="back-link" href={statePath}><ArrowLeft size={15}/> Back to {p.state ? `${p.state} directory` : 'directory'}</a>
          <div className="provider-tags-group">
            {p.featured && <span className="provider-tag provider-tag-featured"><Sparkles size={11}/> Featured Practice</span>}
            {p.verified && <span className="provider-tag provider-tag-verified"><BadgeCheck size={11}/> Verified Listing</span>}
            <span className="provider-tag">{p.type}</span>
          </div>
          <h1>{p.name}</h1>
          <p><MapPin size={18}/> {formatProviderLocation(p) || p.address}</p>
        </div>
      </div>

      <div className="wrap profile-layout">
        <div>
          <SectionLabel>ABOUT THIS PRACTICE</SectionLabel>
          <h2>Care, closer to you.</h2>
          <p className="profile-description">{p.description}</p>
          <h3>Services listed by the practice</h3>
          <div className="provider-services profile-services">
            {p.services.map(s => <span key={s}>{s}</span>)}
          </div>
          <div className="profile-disclaimer">
            <ShieldCheck size={20}/>
            <p>Practice information comes from its public website and may change. This listing is not an endorsement or verification of individual registration. Please confirm details, fees and suitability directly. In Australia, check registration with <a href="https://www.ahpra.gov.au/Registration/Registers-of-Practitioners" {...externalProps}>Ahpra</a>. Is this your practice? <a href="/directory#claim-listing">Claim your listing</a> to update your description, phone number, pictures, or website.</p>
          </div>
          <ProviderEnquiryForm provider={p}/>
        </div>

        <aside className="contact-card">
          <span className="card-kicker">PRACTICE DETAILS</span>
          <h3>Get in touch</h3>
          <div><MapPin size={18}/><span>{p.address}</span></div>
          {p.phone && (
            <div>
              <Phone size={18}/>
              <a
                href={`tel:${p.phoneHref}`}
                onClick={() => trackEvent('provider_phone_click', { provider_slug: p.slug, provider_name: p.name })}
              >
                {p.phone}
              </a>
            </div>
          )}
          {p.bookingUrl && (
            <a
              className="btn btn-dark"
              href={p.bookingUrl}
              {...externalProps}
              onClick={() => trackEvent('provider_booking_click', { provider_slug: p.slug, provider_name: p.name })}
            >
              Book online <Calendar size={16}/>
            </a>
          )}
          {p.website && (
            <a
              className={`btn ${p.bookingUrl ? 'btn-outline' : 'btn-dark'}`}
              href={p.website}
              {...externalProps}
              onClick={() => trackEvent('provider_website_click', { provider_slug: p.slug, provider_name: p.name, placement: 'profile_page' })}
            >
              Visit practice website <ArrowUpRight size={16}/>
            </a>
          )}
          <a
            className="directions-link"
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.address)}`}
            {...externalProps}
            onClick={() => trackEvent('provider_directions_click', { provider_slug: p.slug, provider_name: p.name })}
          >
            Get directions <ArrowUpRight size={15}/>
          </a>
        </aside>
      </div>
    </main>
  );
}
function Products() { return <main id="main-content"><div className="page-hero product-hero"><div className="wrap"><div className="breadcrumb"><a href="/">HOME</a> / THOUGHTFUL PICKS</div><SectionLabel>THE EVERYDAY EDIT</SectionLabel><h1>Little things for <em>the way you move.</em></h1><p>Explore a few practical starting points for everyday foot comfort. The best choice is always the one that fits your needs.</p></div></div><section className="section"><div className="wrap"><div className="product-intro"><div><SectionLabel>CHOOSE WHAT WORKS FOR YOU</SectionLabel><h2>Support, <em>on your terms.</em></h2></div><p>These are product examples, not a promise of pain relief. If you're unsure what might suit you, ask a qualified professional.</p></div><div className="disclosure disclosure-box"><strong>Our link disclosure</strong><br/>Items marked Affiliate (including PodiMe Foot Care) use affiliate links, meaning we may earn a small commission at no extra cost to you if you purchase. Other links go directly to merchants without commission.</div><div className="product-grid">{products.map((p,i) => <ProductCard product={p} index={i} key={p.name}/>)}</div><SafetyNotice/></div></section></main>; }
function About() { return <main id="main-content"><div className="page-hero"><div className="wrap"><div className="breadcrumb"><a href="/">HOME</a> / ABOUT</div><SectionLabel>OUR APPROACH</SectionLabel><h1>Better questions.<br/><em>More confident steps.</em></h1><p>footbackpain is a starting point for understanding the possible connections between foot health, movement and back pain.</p></div></div><div className="wrap about-layout"><nav aria-label="About this site"><a href="#editorial">Editorial principles</a><a href="#disclosure">Product disclosure</a><a href="#privacy">Privacy</a><a href="#terms">Terms of use</a></nav><div className="prose"><section id="editorial"><SectionLabel>OUR PROMISE</SectionLabel><h2>Information with care.</h2><p>We believe health information should feel clear, balanced and useful. Every guide is researched against peer-reviewed musculoskeletal literature and public clinical guidelines, with primary sources linked directly on each page so you can read further. We distinguish associations from proven causes and never make promises of a cure.</p><p>Back pain is complex, and your circumstances are individual. Our articles are educational resources designed to help you ask better questions. They are not a diagnosis or a substitute for personalised care from an Ahpra-registered podiatrist, chiropractor, physiotherapist, or GP. Each guide displays its publication date and is scheduled for periodic editorial review.</p></section><section id="disclosure"><h2>Product & directory transparency.</h2><p>Where articles or product picks include affiliate links (such as PodiMe Foot Care), we clearly disclose that we may earn a small commission at no extra cost to you. Other merchant links are non-affiliate links. We do not claim guaranteed clinical results.</p><p>Directory listings use public practice information. A listing is not an endorsement or a check of individual professional registration. Check details and fees directly with the practice and verify registration with the appropriate regulator.</p></section><section id="privacy"><h2>Privacy.</h2><p>Search terms entered in the directory are used in your browser to filter the displayed listings; we don't store them in an account. When you follow a link to an external site, that site's own privacy policy applies. The hosting platform may collect basic operational analytics.</p></section><section id="terms"><h2>Terms of use.</h2><p>footbackpain provides general information only. It is not intended to diagnose or treat a condition, replace professional advice, or provide emergency services. External websites and their content are controlled by their respective owners. We encourage you to independently confirm information before making care or purchasing decisions.</p></section><SafetyNotice compact/></div></div></main>; }
function NotFound() { return <main id="main-content" className="not-found wrap"><SectionLabel>PAGE NOT FOUND</SectionLabel><h1>Looks like we took a <em>wrong turn.</em></h1><p>Let's get you back on the right path.</p><a className="btn btn-dark" href="/">Back to the beginning <ArrowRight size={16}/></a></main>; }

export default function App({path = '/'}: {path?: string}) {
  const clean = path.length > 1 ? path.replace(/\/$/, '') : path;
  const dirRoute = parseDirectoryRoute(clean);
  let page: React.ReactNode;
  if (clean === '/') page = <main id="main-content"><Home/></main>;
  else if (clean === '/resources') page = <Resources/>;
  else if (clean.startsWith('/resources/')) page = <ResourcePage slug={clean.split('/')[2]}/>;
  else if (dirRoute?.kind === 'index') page = <Directory/>;
  else if (dirRoute?.kind === 'state') page = <Directory initialStateCode={dirRoute.stateCode} initialStateName={dirRoute.stateName}/>;
  else if (dirRoute?.kind === 'city') page = <Directory initialStateCode={dirRoute.stateCode} initialStateName={dirRoute.stateName} initialCityName={dirRoute.cityName}/>;
  else if (dirRoute?.kind === 'provider') page = <ProviderPage slug={dirRoute.slug}/>;
  else if (clean === '/products') page = <Products/>;
  else if (clean === '/about') page = <About/>;
  else page = <NotFound/>;
  return <><Header/>{page}<Footer/></>;
}
