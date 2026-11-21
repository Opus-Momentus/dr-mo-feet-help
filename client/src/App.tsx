import React, { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Activity, Check, ChevronDown, Compass, ExternalLink, Footprints, Heart, MapPin, Menu, Phone, Search, ShieldCheck, Sparkles, X } from 'lucide-react';
import { articles, type SectionBlock } from './data/articles';
import { providers, type Provider } from './data/providers';
import { products } from './data/products';

const HERO = '/images/hero-walking.webp';
const GAIT = '/images/education-gait.webp';
const CARE = '/images/care-podiatry.webp';
const PODIME_AFFILIATE_URL = 'https://podime.com.au?bg_ref=bDQ1o6IXhD';

const externalProps = { target: '_blank', rel: 'noopener noreferrer' } as const;
const affiliateProps = { target: '_blank', rel: 'sponsored noopener noreferrer' } as const;

export const allRoutes = ['/', '/resources', ...articles.map(a => `/resources/${a.slug}`), '/directory', ...providers.map(p => `/directory/${p.slug}`), '/products', '/about'];

export function getMeta(path: string) {
  const article = articles.find(a => path === `/resources/${a.slug}`);
  const provider = providers.find(p => path === `/directory/${p.slug}`);
  if (article) return { title: article.metaTitle || `${article.title} | footbackpain`, description: article.metaDescription || article.summary };
  if (provider) return { title: `${provider.name} | footbackpain Directory`, description: `${provider.type} practice in ${provider.city}, ${provider.state}. Find contact details, location, and services.` };
  if (path === '/resources') return { title: 'Foot & Back Pain Resources | footbackpain', description: 'Understand foot mechanics, back pain, orthotics and your options for care with clear, evidence-informed resources.' };
  if (path === '/directory') return { title: 'Find a Podiatrist or Chiropractor | footbackpain', description: 'Explore podiatry and chiropractic practices by location and type, and find guidance on choosing a practitioner.' };
  if (path === '/products') return { title: 'Thoughtful Foot Comfort Products | footbackpain', description: 'Explore footwear, insoles and movement tools with practical guidance and transparent links.' };
  if (path === '/about') return { title: 'About & Editorial Standards | footbackpain', description: 'Learn about footbackpain, our approach to health information, privacy, terms and disclosures.' };
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
        <a key={`lnk-${linkIdx}`} href={url} {...affiliateProps} className="inline-affiliate-link">
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
          <a className="btn btn-dark" href={block.buttonUrl} {...affiliateProps}>
            {block.buttonLabel} <ArrowUpRight size={16}/>
          </a>
        </aside>
      );
  }
}

function Mark() { return <span className="brand-mark" aria-hidden="true"><svg viewBox="0 0 64 64" fill="none"><path d="M12 41c8 0 10-19 19-19 9 0 11 19 21 19" stroke="currentColor" strokeWidth="5" strokeLinecap="round"/><circle cx="32" cy="15" r="3" fill="currentColor"/></svg></span>; }
function Logo({ light = false }: {light?: boolean}) { return <a className={`logo ${light ? 'logo-light' : ''}`} href="/" aria-label="footbackpain home"><Mark/><span>footbackpain<span className="logo-dot">.</span></span></a>; }
function ArrowLink({ href, children, external = false, className = '' }: {href: string; children: React.ReactNode; external?: boolean; className?: string}) { return <a href={href} className={`text-link ${className}`} {...(external ? externalProps : {})}>{children} {external ? <ArrowUpRight size={15}/> : <ArrowRight size={15}/>}</a>; }

function Header() {
  const [open, setOpen] = useState(false);
  return <>
    <a className="skip-link" href="#main-content">Skip to content</a>
    <div className="topline"><span>A LITTLE MORE CLARITY, FROM THE GROUND UP</span><a href="/resources">EXPLORE THE CONNECTION <ArrowUpRight size={13}/></a></div>
    <header className="header"><div className="header-inner"><Logo/><nav className={open ? 'navigation navigation-open' : 'navigation'} aria-label="Main navigation"><a href="/resources">The connection</a><a href="/directory">Find a practitioner</a><a href="/products">Thoughtful picks</a><a href="/about">About us</a><a className="mobile-nav-cta" href="/directory">Find care near you <ArrowUpRight size={15}/></a></nav><a className="header-cta" href="/directory">Find care near you <ArrowUpRight size={15}/></a><button className="menu-toggle" onClick={() => setOpen(!open)} aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open}>{open ? <X size={23}/> : <Menu size={23}/>}</button></div></header>
  </>;
}
function Footer() { return <footer className="footer"><div className="wrap footer-top"><div className="footer-brand"><Logo light/><p>Better understanding for every step of your journey.</p></div><div><span className="footer-label">EXPLORE</span><a href="/resources">The connection</a><a href="/directory">Find a practitioner</a><a href="/products">Thoughtful picks</a></div><div><span className="footer-label">FOOTBACKPAIN</span><a href="/about">Our approach</a><a href="/about#editorial">Editorial principles</a><a href="/about#privacy">Privacy & terms</a></div><div className="footer-note"><span className="footer-label">A NOTE ON HEALTH</span><p>Information here is educational, not a diagnosis or a substitute for individual medical advice.</p></div></div><div className="wrap footer-bottom"><span>© {new Date().getFullYear()} footbackpain. Made for moving forward.</span><span>Take good care, from the ground up.</span></div></footer>; }

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

const movementAreas = [
  { name: 'Feet', text: 'Your feet meet the ground and adapt as you move. Foot comfort, footwear and individual foot function may be useful things to discuss with a professional.' },
  { name: 'Ankles', text: 'The ankles help your feet move through each step. If ankle pain or limited movement is affecting you, a clinician can assess what is relevant.' },
  { name: 'Knees', text: 'Your knees move in coordination with the rest of your legs. A change in how you walk can have many explanations, including pain or a change in activity.' },
  { name: 'Hips', text: 'The hips help support and control movement. Strength, mobility, comfort and your daily activities can all be part of a broader assessment.' },
  { name: 'Lower back', text: 'Back pain is common and can have many contributors. A qualified professional can help you understand your symptoms and discuss suitable next steps.' },
];
function MovementMap() {
  const [selected, setSelected] = useState(0);
  return <div className="movement-map"><div className="movement-map-intro"><span className="card-kicker">THE MOVEMENT MAP</span><h3>Connected, from the ground up.</h3><p>Explore the areas involved in everyday movement. This is a starting point, not a diagnosis.</p></div><div className="movement-map-content"><div className="movement-tabs" aria-label="Explore areas of the body">{movementAreas.map((area, i) => <button type="button" aria-pressed={selected === i} className={selected === i ? 'active' : ''} onClick={() => setSelected(i)} key={area.name}>{area.name}</button>)}</div><div className="movement-explainer"><span>0{selected + 1}</span><div><strong>{movementAreas[selected].name}</strong><p>{movementAreas[selected].text}</p></div><ArrowUpRight size={17}/></div></div></div>;
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
function ProviderCard({provider}: {provider: Provider}) { return <article className="provider-card"><div className="provider-card-top"><span className="provider-icon"><MapPin size={19}/></span><span className="provider-tag">{provider.type}</span></div><h3>{provider.name}</h3><p className="provider-location"><MapPin size={15}/> {provider.city}, {provider.state} {provider.postcode}</p><p className="provider-description">{provider.description}</p><div className="provider-services">{provider.services.slice(0,2).map(s => <span key={s}>{s}</span>)}</div><div className="provider-bottom"><a href={`/directory/${provider.slug}`}>View practice <ArrowRight size={16}/></a><a href={provider.website} {...externalProps} aria-label={`Visit ${provider.name} website`}><ExternalLink size={16}/></a></div></article>; }
function ProductCard({product, index}: {product: typeof products[number]; index: number}) { const Icon = [Footprints, Activity, Sparkles][index % 3]; const linkAttrs = product.sponsored ? affiliateProps : externalProps; return <article className="product-card"><div className={`product-art product-art-${index % 3}`}><Icon size={58} strokeWidth={1.05}/><span className="product-art-label">{product.sponsored ? <>PODIATRIST-DESIGNED<br/>PARTNER PICK</> : <>A LITTLE SUPPORT<br/>FOR EVERY DAY</>}</span></div><div className="product-copy"><div className="card-meta">{product.category}{product.sponsored ? ' · AFFILIATE' : ''}</div><h3>{product.name}</h3><p>{product.description}</p><a className="read-link" href={product.url} {...linkAttrs}>{product.sponsored ? `Shop ${product.merchant}` : `Visit ${product.merchant}`} <ArrowUpRight size={16}/></a></div></article>; }

function Home() { return <>
  <section className="hero"><div className="wrap hero-grid"><div className="hero-copy"><div className="eyebrow"><span className="eyebrow-dot"/> A FRESH PERSPECTIVE ON PAIN</div><h1>Feel better,<br/><em>from the ground up.</em></h1><p className="hero-description">Your feet and your back may be more connected than you think. Let's make sense of how you move—and find a little more ease along the way.</p><div className="hero-actions"><a className="btn btn-dark" href="/resources">Explore the connection <ArrowUpRight size={17}/></a><a className="btn btn-outline" href="/directory">Find a practitioner <ArrowRight size={17}/></a></div><div className="hero-small"><span className="small-icon"><Heart size={15}/></span><span>Thoughtful information for real life.</span></div></div><div className="hero-visual"><div className="hero-image-frame"><img src={HERO} alt="A person walking along a sunlit coastal path"/></div><div className="floating-note"><span className="floating-icon"><Activity size={22}/></span><div><span>EVERY STEP COUNTS</span><strong>Small steps. A better understanding.</strong></div></div><div className="hero-image-index">01 / 03 <span/> MOVE WITH MORE EASE</div></div></div><div className="wrap hero-bottom"><div><span className="mini-sun">✳</span> YOUR BODY IS CONNECTED</div><p>A little knowledge can be a good first step.</p><a href="#connection" aria-label="Scroll to the foot and back connection"><ArrowDown size={17}/></a></div></section>
  <section className="connection section" id="connection"><div className="wrap"><div className="section-heading split-heading"><div><SectionLabel number="01">THE FOOT–BACK CONNECTION</SectionLabel><h2>Let's look at the<br/><em>whole picture.</em></h2></div><div className="heading-aside"><p>How you walk and move can affect how your body feels. For some people, foot function may be one piece of the back-pain puzzle—but it is rarely the whole story.</p><ArrowLink href="/resources/surprising-link-between-back-pain-and-foot-pain">Understand the connection</ArrowLink></div></div><div className="pathway"><a href="/resources/foot-alignment-and-lower-back-pain-kinetic-chain"><span className="path-number">01</span><span className="path-icon"><Footprints size={25}/></span><h3>Start with your feet</h3><p>Get to know the way your feet support everyday movement.</p><ArrowUpRight size={18}/></a><a href="/resources/signs-lower-back-pain-connected-to-your-feet"><span className="path-number">02</span><span className="path-icon"><Activity size={25}/></span><h3>Notice the patterns</h3><p>Learn what to pay attention to and when to seek help.</p><ArrowUpRight size={18}/></a><a href="/directory"><span className="path-number">03</span><span className="path-icon"><Compass size={25}/></span><h3>Find your next step</h3><p>Connect with a qualified professional in your area.</p><ArrowUpRight size={18}/></a></div><MovementMap/></div></section>
  <section className="resources-section section"><div className="wrap"><div className="section-heading row-heading"><div><SectionLabel number="02">KNOWLEDGE IS A GOOD FIRST STEP</SectionLabel><h2>A little more <em>understanding.</em></h2><p>Clear, considered reading for the questions on your mind.</p></div><ArrowLink href="/resources" className="heading-link">Explore all resources</ArrowLink></div><div className="article-grid">{articles.slice(0,3).map((article, index) => <ArticleCard article={article} index={index} image key={article.slug}/>)}</div></div></section>
  <section className="directory-band"><div className="wrap directory-band-grid"><div><SectionLabel number="03">GOOD CARE, CLOSE TO HOME</SectionLabel><h2>You don't have to<br/><em>figure it out alone.</em></h2><p>Finding the right person to talk to can make all the difference. Explore local podiatry and chiropractic practices, and take the next step with confidence.</p><div className="directory-checks"><span><Check size={15}/> Search by location</span><span><Check size={15}/> Explore care options</span></div></div><div className="directory-search-card"><span className="card-kicker">YOUR NEXT STEP STARTS HERE</span><h3>Find a practitioner</h3><p>Search our starting selection of Australian practices, or explore more options on a map.</p><SearchForm/><p className="search-footnote"><MapPin size={14}/> Start with your suburb, city or postcode</p></div></div></section>
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
              {article.hasAffiliateLinks && <> Contains affiliate links to <a href={PODIME_AFFILIATE_URL} {...affiliateProps}>PodiMe Foot Care</a>—we may earn a small commission at no extra cost to you.</>}
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
              <p>Explore PodiMe&apos;s podiatrist-designed orthotic innersoles, offloaders, Poron heel pads and bunion care—delivered Australia-wide.</p>
              <a className="aside-podime-btn" href={PODIME_AFFILIATE_URL} {...affiliateProps}>
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

function Directory() {
  const [location, setLocation] = useState('');
  const [type, setType] = useState('All practitioners');
  const [formKey, setFormKey] = useState(0);
  useEffect(() => { const query = new URLSearchParams(window.location.search); setLocation(query.get('location') || ''); const requestedType = query.get('type'); setType(requestedType === 'Podiatrist' || requestedType === 'Chiropractor' ? requestedType : 'All practitioners'); setFormKey(1); }, []);
  const filtered = useMemo(() => providers.filter(p => { const q = location.trim().toLowerCase(); const searchable = `${p.name} ${p.city} ${p.state} ${p.postcode} ${p.address}`.toLowerCase(); return (!q || searchable.includes(q)) && (type === 'All practitioners' || p.type === type); }), [location, type]);
  const mapsQuery = `${type === 'All practitioners' ? 'podiatrists and chiropractors' : type} ${location || 'near me'}`;
  return <main id="main-content"><div className="page-hero directory-hero"><div className="wrap"><div className="breadcrumb"><a href="/">HOME</a> / FIND CARE</div><SectionLabel>FIND YOUR NEXT STEP</SectionLabel><h1>Good care starts <em>with a conversation.</em></h1><p>Explore a starting selection of local practices, then find the person who feels right for you.</p><SearchForm key={formKey} initialLocation={location} initialType={type} onSearch={(l,t) => { setLocation(l); setType(t); }}/></div></div><section className="section directory-results"><div className="wrap"><div className="results-heading"><div><SectionLabel>EXPLORE PRACTICES</SectionLabel><h2>Find care <em>near you.</em></h2><p>Our initial listings cover selected Australian practices. Details can change, so please confirm directly.</p></div><span className="results-count" role="status" aria-live="polite">{filtered.length} {filtered.length === 1 ? 'PRACTICE' : 'PRACTICES'}</span></div>{filtered.length ? <div className="provider-grid">{filtered.map(p => <ProviderCard provider={p} key={p.slug}/>)}</div> : <div className="empty-state"><MapPin size={28}/><h3>No listings in this selection</h3><p>Try another location or practitioner type. You can also search a map for more practices.</p></div>}<div className="more-options"><div><h3>Looking somewhere else?</h3><p>Our directory is a starting point, not a complete list. Search a map for more practitioners in your area.</p></div><a className="btn btn-outline" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`} {...externalProps}>Search Google Maps <ArrowUpRight size={16}/></a></div><div className="directory-notice"><ShieldCheck size={20}/><p>Listings are based on public practice information, not an endorsement or a verification of individual registration. In Australia, check your practitioner's registration on the <a href="https://www.ahpra.gov.au/Registration/Registers-of-Practitioners" {...externalProps}>Ahpra register</a>, and confirm services and fees with the practice.</p></div></div></section></main>;
}
function ProviderPage({slug}: {slug: string}) { const p = providers.find(item => item.slug === slug); if (!p) return <NotFound/>; return <main id="main-content"><div className="page-hero profile-hero"><div className="wrap"><a className="back-link" href="/directory"><ArrowLeft size={15}/> Back to directory</a><span className="provider-tag">{p.type}</span><h1>{p.name}</h1><p><MapPin size={18}/> {p.city}, {p.state} {p.postcode}</p></div></div><div className="wrap profile-layout"><div><SectionLabel>ABOUT THIS PRACTICE</SectionLabel><h2>Care, closer to you.</h2><p className="profile-description">{p.description}</p><h3>Services listed by the practice</h3><div className="provider-services profile-services">{p.services.map(s => <span key={s}>{s}</span>)}</div><div className="profile-disclaimer"><ShieldCheck size={20}/><p>Practice information comes from its public website and may change. This listing is not an endorsement or verification of individual registration. Please confirm details, fees and suitability directly. In Australia, check registration with <a href="https://www.ahpra.gov.au/Registration/Registers-of-Practitioners" {...externalProps}>Ahpra</a>.</p></div></div><aside className="contact-card"><span className="card-kicker">PRACTICE DETAILS</span><h3>Get in touch</h3><div><MapPin size={18}/><span>{p.address}</span></div><div><Phone size={18}/><a href={`tel:${p.phoneHref}`}>{p.phone}</a></div><a className="btn btn-dark" href={p.website} {...externalProps}>Visit practice website <ArrowUpRight size={16}/></a><a className="directions-link" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.address)}`} {...externalProps}>Get directions <ArrowUpRight size={15}/></a></aside></div></main>; }
function Products() { return <main id="main-content"><div className="page-hero product-hero"><div className="wrap"><div className="breadcrumb"><a href="/">HOME</a> / THOUGHTFUL PICKS</div><SectionLabel>THE EVERYDAY EDIT</SectionLabel><h1>Little things for <em>the way you move.</em></h1><p>Explore a few practical starting points for everyday foot comfort. The best choice is always the one that fits your needs.</p></div></div><section className="section"><div className="wrap"><div className="product-intro"><div><SectionLabel>CHOOSE WHAT WORKS FOR YOU</SectionLabel><h2>Support, <em>on your terms.</em></h2></div><p>These are product examples, not a promise of pain relief. If you're unsure what might suit you, ask a qualified professional.</p></div><div className="disclosure disclosure-box"><strong>Our link disclosure</strong><br/>Items marked Affiliate (including PodiMe Foot Care) use affiliate links—we may earn a small commission at no extra cost to you if you purchase. Other links go directly to merchants without commission.</div><div className="product-grid">{products.map((p,i) => <ProductCard product={p} index={i} key={p.name}/>)}</div><SafetyNotice/></div></section></main>; }
function About() { return <main id="main-content"><div className="page-hero"><div className="wrap"><div className="breadcrumb"><a href="/">HOME</a> / ABOUT</div><SectionLabel>OUR APPROACH</SectionLabel><h1>Better questions.<br/><em>More confident steps.</em></h1><p>footbackpain is a starting point for understanding the possible connections between foot health, movement and back pain.</p></div></div><div className="wrap about-layout"><nav aria-label="About this site"><a href="#editorial">Editorial principles</a><a href="#disclosure">Product disclosure</a><a href="#privacy">Privacy</a><a href="#terms">Terms of use</a></nav><div className="prose"><section id="editorial"><SectionLabel>OUR PROMISE</SectionLabel><h2>Information with care.</h2><p>We believe health information should feel clear, balanced and useful. We use reputable published sources and link to them so you can read further. We distinguish associations from proven causes and don't make promises of a cure.</p><p>Back pain is complex, and your circumstances are individual. Our articles are educational and are not a substitute for advice from your own qualified healthcare professional. We do not claim that content has been individually medically reviewed.</p></section><section id="disclosure"><h2>Product & directory transparency.</h2><p>Where articles or product picks include affiliate links (such as PodiMe Foot Care), we clearly disclose that we may earn a small commission at no extra cost to you. Other merchant links are non-affiliate links. We do not claim guaranteed clinical results.</p><p>Directory listings use public practice information. A listing is not an endorsement or a check of individual professional registration. Check details and fees directly with the practice and verify registration with the appropriate regulator.</p></section><section id="privacy"><h2>Privacy.</h2><p>Search terms entered in the directory are used in your browser to filter the displayed listings; we don't store them in an account. When you follow a link to an external site, that site's own privacy policy applies. The hosting platform may collect basic operational analytics.</p></section><section id="terms"><h2>Terms of use.</h2><p>footbackpain provides general information only. It is not intended to diagnose or treat a condition, replace professional advice, or provide emergency services. External websites and their content are controlled by their respective owners. We encourage you to independently confirm information before making care or purchasing decisions.</p></section><SafetyNotice compact/></div></div></main>; }
function NotFound() { return <main id="main-content" className="not-found wrap"><SectionLabel>PAGE NOT FOUND</SectionLabel><h1>Looks like we took a <em>wrong turn.</em></h1><p>Let's get you back on the right path.</p><a className="btn btn-dark" href="/">Back to the beginning <ArrowRight size={16}/></a></main>; }

export default function App({path = '/'}: {path?: string}) {
  const clean = path.length > 1 ? path.replace(/\/$/, '') : path;
  let page: React.ReactNode;
  if (clean === '/') page = <main id="main-content"><Home/></main>;
  else if (clean === '/resources') page = <Resources/>;
  else if (clean.startsWith('/resources/')) page = <ResourcePage slug={clean.split('/')[2]}/>;
  else if (clean === '/directory') page = <Directory/>;
  else if (clean.startsWith('/directory/')) page = <ProviderPage slug={clean.split('/')[2]}/>;
  else if (clean === '/products') page = <Products/>;
  else if (clean === '/about') page = <About/>;
  else page = <NotFound/>;
  return <><Header/>{page}<Footer/></>;
}
