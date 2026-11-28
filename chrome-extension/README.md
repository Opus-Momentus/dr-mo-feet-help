# Podiatrist Finder — footbackpain.com Chrome Extension

A Manifest V3 Google Chrome extension that helps users find their closest podiatrist (or foot & back care clinic) using GPS or suburb/postcode search, with direct backlinks to **footbackpain.com** resources, directory listings, and product guides.

## Features

- **Find closest podiatrists**: Uses browser geolocation (`Use my current location`) or suburb/city/postcode search (via OpenStreetMap Nominatim + Overpass API) sorted by distance.
- **Featured `footbackpain.com` listings**: Highlights practices from the [footbackpain.com directory](https://footbackpain.com/directory) with direct profile links.
- **One-click actions**: Get Google Maps directions, call clinics directly, or visit their website / `footbackpain.com` profile.
- **Backlinks to `footbackpain.com`**: Header logo, directory pill, featured clinic cards, resource strip (`/resources`, `/directory`, `/products`), and footer (`List your practice`) all link to `footbackpain.com` with `utm_source=chrome_extension`.
- **Remembers last search**: Persists your recent search and filter preference via `chrome.storage.local`.

## Install in Chrome (Developer Mode)

1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** (toggle in the top-right corner).
3. Click **Load unpacked** and select this `chrome-extension` folder.
4. Pin **Podiatrist Finder — footbackpain.com** from the Extensions toolbar menu and click it to open the popup.

## Package for Chrome Web Store

Zip the contents of the `chrome-extension` directory (so `manifest.json` is at the root of the `.zip` archive) and upload it in the Chrome Web Store Developer Dashboard.
