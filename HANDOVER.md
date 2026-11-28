# footbackpain.com — Technical & Asset Handover Guide

This document summarizes the site architecture, monetization hooks, analytics events, and transfer steps for an acquiring business.

## 1. Architecture & Hosting
- **Stack:** React 19, TypeScript, Vite 7, static prerendering (`scripts/prerender.tsx`) into `dist/public`.
- **No backend required:** The site builds to static HTML/CSS/JS + `sitemap.xml` + `robots.txt`.
- **Deployment:** `.github/workflows/deploy.yml`.

## 2. Configurable Form & Lead Routing
All directory enquiries (new listings, listing claims, Featured upgrades) and patient callback requests post to:
- `import.meta.env.VITE_ENQUIRY_ENDPOINT` (defaults to `https://formsubmit.co/ajax/mcmoandrew@gmail.com`).

When transferring ownership, set `VITE_ENQUIRY_ENDPOINT` in your build environment (for example to a buyer-owned address like `directory@footbackpain.com`) with zero code changes.

## 3. Directory Monetization (`client/src/data/providers.ts`)
Each `Provider` record supports:
- `featured?: boolean` — sorts the clinic to the top of directory search results and displays a **Featured** badge.
- `verified?: boolean` — displays a **Verified** badge.
- `bookingUrl?: string` — adds a primary **Book online** CTA button on the clinic's profile page.

Practices can request a Featured & Verified upgrade directly via the **Featured & Verified tier** option in `DirectoryEnquirySection.tsx`. Patients can submit callback/appointment enquiries on any clinic's profile page (`ProviderEnquiryForm.tsx`).

## 4. GTM / GA4 Conversion Events (`client/src/utils/analytics.ts`)
Google Tag Manager (`GTM-WX4CV3TX` in `client/index.html`) receives structured `dataLayer` events:
- `affiliate_click` — clicks on affiliate links (inline article, article CTA box, aside card, product card).
- `outbound_product_click` — clicks on non-affiliate merchant links.
- `provider_website_click` — clicks to a clinic's website from directory cards or profile pages.
- `provider_phone_click` — clicks on `tel:` links on clinic profile pages.
- `provider_directions_click` — clicks on Google Maps directions links.
- `provider_booking_click` — clicks on a featured clinic's `bookingUrl`.
- `provider_lead_submitted` — patient appointment/callback enquiry submissions.
- `directory_enquiry_submitted` — clinic listing new/claim/featured submissions.
- `movement_quiz_completed` — completions of the interactive 3-step self-check quiz.

## 5. SEO & Structured Data (`scripts/prerender.tsx`)
- **Articles:** `Article`, `BreadcrumbList`, and `FAQPage` JSON-LD.
- **Directory Profiles (`/directory/<slug>`):** `MedicalClinic` and `BreadcrumbList` JSON-LD.
- **State & City Pages (`/directory/<state>` & `/directory/<state>/<city>`):** `CollectionPage` and `BreadcrumbList` JSON-LD.
- **Sitemap (`sitemap.xml`):** Automatically generated with article `publishDate` / build-date `lastmod`.
