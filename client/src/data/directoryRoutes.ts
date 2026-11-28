import { providers } from './providers';

export const AU_STATES_META = [
  { code: 'NSW', slug: 'nsw', name: 'New South Wales' },
  { code: 'VIC', slug: 'vic', name: 'Victoria' },
  { code: 'QLD', slug: 'qld', name: 'Queensland' },
  { code: 'SA', slug: 'sa', name: 'South Australia' },
  { code: 'WA', slug: 'wa', name: 'Western Australia' },
  { code: 'TAS', slug: 'tas', name: 'Tasmania' },
  { code: 'ACT', slug: 'act', name: 'Australian Capital Territory' },
  { code: 'NT', slug: 'nt', name: 'Northern Territory' },
] as const;

export function slugifyCity(city: string): string {
  return city
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export type LocalCityRoute = {
  stateCode: string;
  stateSlug: string;
  stateName: string;
  cityName: string;
  citySlug: string;
  path: string;
  count: number;
};

// Build indexable city landing pages for cities with >= 4 listings (plus state capitals)
const CAPITALS = new Set([
  'sydney',
  'melbourne',
  'brisbane',
  'adelaide',
  'perth',
  'hobart',
  'canberra',
  'darwin',
]);

export const localCityRoutes: LocalCityRoute[] = (() => {
  const map = new Map<string, { stateCode: string; cityName: string; count: number }>();
  for (const p of providers) {
    if (!p.state || !p.city) continue;
    const cSlug = slugifyCity(p.city);
    if (!cSlug) continue;
    const key = `${p.state}::${cSlug}`;
    const existing = map.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      map.set(key, { stateCode: p.state, cityName: p.city.trim(), count: 1 });
    }
  }

  const out: LocalCityRoute[] = [];
  for (const [, val] of map.entries()) {
    const stateMeta = AU_STATES_META.find(s => s.code === val.stateCode);
    if (!stateMeta) continue;
    const citySlug = slugifyCity(val.cityName);
    if (val.count >= 4 || CAPITALS.has(citySlug)) {
      out.push({
        stateCode: stateMeta.code,
        stateSlug: stateMeta.slug,
        stateName: stateMeta.name,
        cityName: val.cityName,
        citySlug,
        path: `/directory/${stateMeta.slug}/${citySlug}`,
        count: val.count,
      });
    }
  }
  return out.sort((a, b) => b.count - a.count);
})();

export const localStateRoutes = AU_STATES_META.map(s => ({
  ...s,
  path: `/directory/${s.slug}`,
  count: providers.filter(p => p.state === s.code).length,
}));

export type ParsedDirectoryRoute =
  | { kind: 'index' }
  | { kind: 'state'; stateCode: string; stateSlug: string; stateName: string }
  | { kind: 'city'; stateCode: string; stateSlug: string; stateName: string; cityName: string; citySlug: string }
  | { kind: 'provider'; slug: string };

export function parseDirectoryRoute(cleanPath: string): ParsedDirectoryRoute | null {
  if (cleanPath === '/directory') return { kind: 'index' };
  if (!cleanPath.startsWith('/directory/')) return null;

  const segments = cleanPath.slice('/directory/'.length).split('/').filter(Boolean);
  if (segments.length === 1) {
    const stateMeta = AU_STATES_META.find(s => s.slug === segments[0]);
    if (stateMeta) {
      return {
        kind: 'state',
        stateCode: stateMeta.code,
        stateSlug: stateMeta.slug,
        stateName: stateMeta.name,
      };
    }
    return { kind: 'provider', slug: segments[0] };
  }

  if (segments.length === 2) {
    const cityRoute = localCityRoutes.find(
      c => c.stateSlug === segments[0] && c.citySlug === segments[1]
    );
    if (cityRoute) {
      return {
        kind: 'city',
        stateCode: cityRoute.stateCode,
        stateSlug: cityRoute.stateSlug,
        stateName: cityRoute.stateName,
        cityName: cityRoute.cityName,
        citySlug: cityRoute.citySlug,
      };
    }
  }

  return null;
}
