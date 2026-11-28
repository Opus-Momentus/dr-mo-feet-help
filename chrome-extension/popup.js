(() => {
  'use strict';

  const UTM = 'utm_source=chrome_extension&utm_medium=popup&utm_campaign=podiatrist_finder';
  const DIRECTORY_URL = `https://footbackpain.com/directory?${UTM}`;
  const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
  const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
  const STORAGE_KEY = 'fbp_podiatrist_finder_state_v1';

  // Starter featured listings synced with footbackpain.com/directory
  const FEATURED_PROVIDERS = [
    {
      id: 'fbp-podiatry-first-sydney',
      name: 'Podiatry First',
      type: 'Podiatrist',
      city: 'Sydney',
      state: 'NSW',
      postcode: '2000',
      address: 'Level 14, 88 Pitt St, Sydney NSW 2000',
      phone: '(02) 9134 9002',
      phoneHref: '+61291349002',
      website: 'https://www.podiatryfirst.com.au/',
      profileUrl: `https://footbackpain.com/directory/podiatry-first-sydney?${UTM}`,
      services: ['Gait analysis', 'Sports podiatry', 'General podiatry'],
      lat: -33.8667,
      lng: 151.2093,
      featured: true,
    },
    {
      id: 'fbp-melbourne-podiatry-clinic',
      name: 'Melbourne Podiatry Clinic',
      type: 'Podiatrist',
      city: 'Essendon',
      state: 'VIC',
      postcode: '3040',
      address: '1069 Mt Alexander Rd, Essendon VIC 3040',
      phone: '(03) 9993 0461',
      phoneHref: '+61399930461',
      website: 'https://www.melbournepodiatryclinic.net.au/',
      profileUrl: `https://footbackpain.com/directory/melbourne-podiatry-clinic?${UTM}`,
      services: ['Foot pain', 'Sports injuries', 'Rehabilitation'],
      lat: -37.7524,
      lng: 144.9158,
      featured: true,
    },
    {
      id: 'fbp-sydney-spine-and-sports',
      name: 'Sydney Spine & Sports Clinic',
      type: 'Chiropractor',
      city: 'Sydney',
      state: 'NSW',
      postcode: '2000',
      address: 'Mezzanine Level, 580 George Street, Sydney NSW 2000',
      phone: '0418 887 436',
      phoneHref: '+61418887436',
      website: 'https://www.sydneyspine.com.au/',
      profileUrl: `https://footbackpain.com/directory/sydney-spine-and-sports?${UTM}`,
      services: ['Chiropractic care', 'Back pain', 'Joint pain'],
      lat: -33.8753,
      lng: 151.2069,
      featured: true,
    },
    {
      id: 'fbp-back-in-care-melbourne',
      name: 'Back In Care Chiropractic',
      type: 'Chiropractor',
      city: 'Melbourne',
      state: 'VIC',
      postcode: '3000',
      address: '287 Spring Street, Melbourne VIC 3000',
      phone: '(03) 9663 9313',
      phoneHref: '+61396639313',
      website: 'https://www.backincare.com.au/',
      profileUrl: `https://footbackpain.com/directory/back-in-care-melbourne?${UTM}`,
      services: ['Chiropractic care', 'Posture assessment', 'Orthotics'],
      lat: -37.8096,
      lng: 144.9718,
      featured: true,
    },
  ];

  const form = document.getElementById('search-form');
  const locationInput = document.getElementById('location-input');
  const searchBtn = document.getElementById('search-btn');
  const geoBtn = document.getElementById('geo-btn');
  const filterTabs = Array.from(document.querySelectorAll('.tab'));
  const statusBar = document.getElementById('status-bar');
  const resultsList = document.getElementById('results-list');

  let state = {
    query: '',
    filter: 'podiatrist', // 'podiatrist' | 'all'
    coords: null, // { lat, lng, label }
    results: [],
  };

  function haversineKm(lat1, lng1, lat2, lng2) {
    const toRad = (deg) => (deg * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function formatDistance(km) {
    if (typeof km !== 'number' || Number.isNaN(km)) return '';
    if (km < 1) return `${Math.round(km * 1000)} m`;
    if (km < 10) return `${km.toFixed(1)} km`;
    return `${Math.round(km)} km`;
  }

  function normalizePhoneHref(raw) {
    if (!raw) return '';
    const cleaned = raw.replace(/[^\d+]/g, '');
    return cleaned || '';
  }

  function buildAddress(tags) {
    if (!tags) return '';
    if (tags['addr:full']) return tags['addr:full'];
    const street = [tags['addr:housenumber'], tags['addr:street']].filter(Boolean).join(' ');
    const locality = [tags['addr:suburb'] || tags['addr:city'], tags['addr:state'], tags['addr:postcode']]
      .filter(Boolean)
      .join(' ');
    return [street, locality].filter(Boolean).join(', ');
  }

  function mapsSearchUrl(queryText) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(queryText)}`;
  }

  function mapsDirectionsUrl(destination, originCoords) {
    const params = new URLSearchParams({ api: '1', destination });
    if (originCoords && typeof originCoords.lat === 'number' && typeof originCoords.lng === 'number') {
      params.set('origin', `${originCoords.lat},${originCoords.lng}`);
    }
    return `https://www.google.com/maps/dir/?${params.toString()}`;
  }

  function saveState() {
    const payload = {
      query: state.query,
      filter: state.filter,
      coords: state.coords,
      results: state.results.slice(0, 15),
    };
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ [STORAGE_KEY]: payload });
    } else {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      } catch (_) {
        // Ignore storage quota errors
      }
    }
  }

  function loadState() {
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get([STORAGE_KEY], (data) => {
          resolve(data ? data[STORAGE_KEY] : null);
        });
      } else {
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          resolve(raw ? JSON.parse(raw) : null);
        } catch (_) {
          resolve(null);
        }
      }
    });
  }

  function setLoading(isLoading, message = 'Finding nearby podiatrists…') {
    searchBtn.disabled = isLoading;
    geoBtn.disabled = isLoading;
    if (isLoading) {
      statusBar.classList.add('hidden');
      resultsList.innerHTML = '';
      const box = document.createElement('div');
      box.className = 'loading-box';
      const spinner = document.createElement('div');
      spinner.className = 'spinner';
      const text = document.createElement('span');
      text.textContent = message;
      box.append(spinner, text);
      resultsList.appendChild(box);
    }
  }

  function showStatus(text, isError = false, countText = '') {
    if (!text && !countText) {
      statusBar.classList.add('hidden');
      return;
    }
    statusBar.classList.remove('hidden');
    statusBar.classList.toggle('error', isError);
    statusBar.innerHTML = '';
    const left = document.createElement('span');
    left.textContent = text;
    statusBar.appendChild(left);
    if (countText) {
      const right = document.createElement('span');
      right.className = 'status-count';
      right.textContent = countText;
      statusBar.appendChild(right);
    }
  }

  function createPinIcon() {
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', '12');
    svg.setAttribute('height', '12');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    const path = document.createElementNS(svgNS, 'path');
    path.setAttribute('d', 'M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z');
    const circle = document.createElementNS(svgNS, 'circle');
    circle.setAttribute('cx', '12');
    circle.setAttribute('cy', '10');
    circle.setAttribute('r', '3');
    svg.append(path, circle);
    return svg;
  }

  function createExternalIcon() {
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', '11');
    svg.setAttribute('height', '11');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2.2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    const p1 = document.createElementNS(svgNS, 'path');
    p1.setAttribute('d', 'M7 17 17 7');
    const p2 = document.createElementNS(svgNS, 'path');
    p2.setAttribute('d', 'M7 7h10v10');
    svg.append(p1, p2);
    return svg;
  }

  function createExternalLink(href, label, className = 'action-link') {
    const a = document.createElement('a');
    a.className = className;
    a.href = href;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.textContent = label + ' ';
    a.appendChild(createExternalIcon());
    return a;
  }

  function renderResults() {
    const filtered = state.results.filter((item) => {
      if (state.filter === 'podiatrist') {
        return item.type === 'Podiatrist';
      }
      return true;
    });

    resultsList.innerHTML = '';

    if (!filtered.length) {
      showStatus('');
      const empty = document.createElement('div');
      empty.className = 'empty-card';
      const h3 = document.createElement('h3');
      h3.textContent = state.coords
        ? 'No clinics matched in this radius'
        : 'Search by suburb, postcode, or GPS';
      const p = document.createElement('p');
      p.textContent = state.coords
        ? 'Try switching to "All foot & back" or search Google Maps for more nearby podiatrists.'
        : 'Enter your location above or click "Use my current location" to find your closest podiatrist.';
      const actions = document.createElement('div');
      actions.className = 'empty-actions';

      const mapQuery = state.query
        ? `podiatrist near ${state.query}`
        : state.coords
          ? `podiatrist near ${state.coords.lat},${state.coords.lng}`
          : 'podiatrist near me';
      actions.appendChild(createExternalLink(mapsSearchUrl(mapQuery), 'Search Google Maps', 'btn-outline-sm'));
      actions.appendChild(createExternalLink(DIRECTORY_URL, 'footbackpain.com Directory', 'btn-outline-sm'));

      empty.append(h3, p, actions);
      resultsList.appendChild(empty);
      return;
    }

    const labelText = state.coords
      ? `Closest to ${state.coords.label || 'your location'}`
      : 'Featured on footbackpain.com';
    showStatus(labelText, false, `${filtered.length} ${filtered.length === 1 ? 'CLINIC' : 'CLINICS'}`);

    filtered.forEach((item) => {
      const card = document.createElement('article');
      card.className = 'provider-card';

      const top = document.createElement('div');
      top.className = 'card-top';
      const badge = document.createElement('span');
      badge.className = item.featured ? 'badge featured' : 'badge';
      badge.textContent = item.featured ? `Featured · ${item.type}` : item.type;
      top.appendChild(badge);

      if (typeof item.distanceKm === 'number') {
        const dist = document.createElement('span');
        dist.className = 'distance-pill';
        dist.textContent = `${formatDistance(item.distanceKm)} away`;
        top.appendChild(dist);
      }

      const h2 = document.createElement('h2');
      h2.textContent = item.name;

      const addr = document.createElement('p');
      addr.className = 'provider-address';
      addr.appendChild(createPinIcon());
      const addrSpan = document.createElement('span');
      addrSpan.textContent = item.address || 'Address not listed in OpenStreetMap';
      addr.appendChild(addrSpan);

      card.append(top, h2, addr);

      if (Array.isArray(item.services) && item.services.length) {
        const tags = document.createElement('div');
        tags.className = 'provider-tags';
        item.services.slice(0, 3).forEach((s) => {
          const span = document.createElement('span');
          span.textContent = s;
          tags.appendChild(span);
        });
        card.appendChild(tags);
      }

      const actions = document.createElement('div');
      actions.className = 'card-actions';

      const destination = item.address || `${item.lat},${item.lng}`;
      actions.appendChild(
        createExternalLink(mapsDirectionsUrl(destination, state.coords), 'Directions')
      );

      if (item.phone && item.phoneHref) {
        const call = document.createElement('a');
        call.className = 'action-link secondary';
        call.href = `tel:${item.phoneHref}`;
        call.textContent = item.phone;
        actions.appendChild(call);
      }

      if (item.profileUrl) {
        actions.appendChild(createExternalLink(item.profileUrl, 'footbackpain.com'));
      } else if (item.website) {
        actions.appendChild(createExternalLink(item.website, 'Website', 'action-link secondary'));
      }

      card.appendChild(actions);
      resultsList.appendChild(card);
    });

    // Bottom map fallback row
    const moreRow = document.createElement('div');
    moreRow.className = 'more-map-row';
    const moreText = document.createElement('span');
    moreText.textContent = 'Want more options?';
    const mapQuery = state.query
      ? `podiatrist near ${state.query}`
      : state.coords
        ? `podiatrist near ${state.coords.lat},${state.coords.lng}`
        : 'podiatrist near me';
    moreRow.append(moreText, createExternalLink(mapsSearchUrl(mapQuery), 'Open in Google Maps'));
    resultsList.appendChild(moreRow);
  }

  async function geocodeQuery(query) {
    const url = `${NOMINATIM_URL}?format=json&limit=1&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error('Geocoding service unavailable');
    const data = await res.json();
    if (!Array.isArray(data) || !data.length) {
      throw new Error(`Could not find "${query}". Try a city, suburb, or postcode.`);
    }
    const best = data[0];
    const shortLabel = (best.display_name || query).split(',').slice(0, 2).join(',').trim();
    return {
      lat: parseFloat(best.lat),
      lng: parseFloat(best.lon),
      label: shortLabel || query,
    };
  }

  async function queryOverpass(lat, lng, radiusMeters = 12000) {
    const query = `
      [out:json][timeout:12];
      (
        node["healthcare"="podiatrist"](around:${radiusMeters},${lat},${lng});
        way["healthcare"="podiatrist"](around:${radiusMeters},${lat},${lng});
        node["healthcare:speciality"~"podiatr",i](around:${radiusMeters},${lat},${lng});
        way["healthcare:speciality"~"podiatr",i](around:${radiusMeters},${lat},${lng});
        node["amenity"~"clinic|doctors|hospital"]["name"~"podiatr|foot|ankle",i](around:${radiusMeters},${lat},${lng});
        way["amenity"~"clinic|doctors|hospital"]["name"~"podiatr|foot|ankle",i](around:${radiusMeters},${lat},${lng});
        node["healthcare"]["name"~"podiatr|foot",i](around:${radiusMeters},${lat},${lng});
        node["healthcare"="chiropractor"](around:${radiusMeters},${lat},${lng});
        way["healthcare"="chiropractor"](around:${radiusMeters},${lat},${lng});
      );
      out center tags 40;
    `.trim();

    const res = await fetch(OVERPASS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body: `data=${encodeURIComponent(query)}`,
    });
    if (!res.ok) throw new Error('Clinic lookup service timed out');
    const data = await res.json();
    return Array.isArray(data.elements) ? data.elements : [];
  }

  function mapOverpassElements(elements, originLat, originLng) {
    const seen = new Set();
    const mapped = [];

    for (const el of elements) {
      const tags = el.tags || {};
      const name = tags.name || tags['name:en'];
      if (!name) continue;

      const elLat = typeof el.lat === 'number' ? el.lat : el.center?.lat;
      const elLng = typeof el.lon === 'number' ? el.lon : el.center?.lon;
      if (typeof elLat !== 'number' || typeof elLng !== 'number') continue;

      const dedupeKey = name.trim().toLowerCase();
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);

      const isChiro =
        tags.healthcare === 'chiropractor' ||
        /chiropract/i.test(tags['healthcare:speciality'] || '');

      const rawPhone = tags.phone || tags['contact:phone'] || '';
      const rawWebsite = tags.website || tags['contact:website'] || '';
      const validWebsite = /^https?:\/\//i.test(rawWebsite) ? rawWebsite : '';

      mapped.push({
        id: `osm-${el.type}-${el.id}`,
        name: name.trim(),
        type: isChiro ? 'Chiropractor' : 'Podiatrist',
        address: buildAddress(tags),
        phone: rawPhone,
        phoneHref: normalizePhoneHref(rawPhone),
        website: validWebsite,
        services: [],
        lat: elLat,
        lng: elLng,
        distanceKm: haversineKm(originLat, originLng, elLat, elLng),
        featured: false,
      });
    }

    return mapped;
  }

  function mergeWithFeatured(osmResults, originLat, originLng) {
    const featuredWithDist = FEATURED_PROVIDERS.map((fp) => ({
      ...fp,
      distanceKm: haversineKm(originLat, originLng, fp.lat, fp.lng),
    })).filter((fp) => fp.distanceKm <= 80); // include featured clinics within 80 km

    const featuredNames = new Set(featuredWithDist.map((f) => f.name.toLowerCase()));
    const filteredOsm = osmResults.filter((o) => !featuredNames.has(o.name.toLowerCase()));

    return [...featuredWithDist, ...filteredOsm]
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 15);
  }

  async function findNearCoords(coords) {
    state.coords = coords;
    setLoading(true, `Searching near ${coords.label || 'your location'}…`);

    try {
      let elements = await queryOverpass(coords.lat, coords.lng, 12000);
      if (elements.length < 3) {
        elements = await queryOverpass(coords.lat, coords.lng, 25000);
      }
      const osmMapped = mapOverpassElements(elements, coords.lat, coords.lng);
      state.results = mergeWithFeatured(osmMapped, coords.lat, coords.lng);
      saveState();
      renderResults();
    } catch (err) {
      // Fallback to featured directory sorted by distance if Overpass is unreachable
      const fallback = FEATURED_PROVIDERS.map((fp) => ({
        ...fp,
        distanceKm: haversineKm(coords.lat, coords.lng, fp.lat, fp.lng),
      })).sort((a, b) => a.distanceKm - b.distanceKm);
      state.results = fallback;
      renderResults();
      showStatus(
        'Live clinic lookup unavailable right now. Showing footbackpain.com directory & Google Maps link.',
        true
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleTextSearch(query) {
    const trimmed = query.trim();
    if (!trimmed) {
      locationInput.focus();
      return;
    }
    state.query = trimmed;
    setLoading(true, `Locating "${trimmed}"…`);

    try {
      const coords = await geocodeQuery(trimmed);
      await findNearCoords(coords);
    } catch (err) {
      setLoading(false);
      // Match featured providers by text if geocoding fails
      const q = trimmed.toLowerCase();
      state.coords = null;
      state.results = FEATURED_PROVIDERS.filter((fp) =>
        `${fp.name} ${fp.city} ${fp.state} ${fp.postcode} ${fp.address}`.toLowerCase().includes(q)
      );
      renderResults();
      showStatus(err.message || 'Could not locate that area.', true);
    }
  }

  function handleGeolocation() {
    if (!navigator.geolocation) {
      showStatus('Geolocation is not supported in this browser. Enter a suburb or postcode instead.', true);
      return;
    }
    setLoading(true, 'Getting your current location…');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          label: 'your location',
        };
        state.query = '';
        locationInput.value = '';
        await findNearCoords(coords);
      },
      (err) => {
        setLoading(false);
        const msg =
          err.code === 1
            ? 'Location access was denied. Enter a suburb or postcode above.'
            : 'Unable to determine your location. Enter a suburb or postcode above.';
        showStatus(msg, true);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    handleTextSearch(locationInput.value);
  });

  geoBtn.addEventListener('click', handleGeolocation);

  filterTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const nextFilter = tab.dataset.filter || 'podiatrist';
      state.filter = nextFilter;
      filterTabs.forEach((t) => {
        const active = t === tab;
        t.classList.toggle('active', active);
        t.setAttribute('aria-selected', String(active));
      });
      saveState();
      renderResults();
    });
  });

  // Initialize from saved state or show featured starter listings
  (async () => {
    const saved = await loadState();
    if (saved && Array.isArray(saved.results) && saved.results.length) {
      state = {
        query: saved.query || '',
        filter: saved.filter || 'podiatrist',
        coords: saved.coords || null,
        results: saved.results,
      };
      locationInput.value = state.query;
      filterTabs.forEach((t) => {
        const active = t.dataset.filter === state.filter;
        t.classList.toggle('active', active);
        t.setAttribute('aria-selected', String(active));
      });
      renderResults();
    } else {
      state.results = [...FEATURED_PROVIDERS];
      renderResults();
    }
  })();
})();
