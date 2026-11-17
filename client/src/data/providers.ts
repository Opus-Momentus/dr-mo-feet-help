export type Provider = {
  slug: string;
  name: string;
  type: 'Podiatrist' | 'Chiropractor';
  city: string;
  state: string;
  postcode: string;
  address: string;
  phone: string;
  phoneHref: string;
  website: string;
  services: string[];
  description: string;
};

// Public practice details are sourced from each practice's own website.
export const providers: Provider[] = [
  {
    slug: 'podiatry-first-sydney',
    name: 'Podiatry First',
    type: 'Podiatrist',
    city: 'Sydney', state: 'NSW', postcode: '2000',
    address: 'Level 14, 88 Pitt St, Sydney NSW 2000',
    phone: '(02) 9134 9002', phoneHref: '+61291349002',
    website: 'https://www.podiatryfirst.com.au/',
    services: ['Gait analysis', 'Sports podiatry', 'General podiatry'],
    description: 'A Sydney CBD podiatry practice offering general and sports podiatry, including biomechanical assessment and gait analysis.',
  },
  {
    slug: 'melbourne-podiatry-clinic',
    name: 'Melbourne Podiatry Clinic',
    type: 'Podiatrist',
    city: 'Essendon', state: 'VIC', postcode: '3040',
    address: '1069 Mt Alexander Rd, Essendon VIC 3040',
    phone: '(03) 9993 0461', phoneHref: '+61399930461',
    website: 'https://www.melbournepodiatryclinic.net.au/',
    services: ['Foot pain', 'Sports injuries', 'Rehabilitation'],
    description: 'An Essendon podiatry practice offering assessment and care for foot pain and sports injuries, as well as rehabilitation services.',
  },
  {
    slug: 'sydney-spine-and-sports',
    name: 'Sydney Spine & Sports Clinic',
    type: 'Chiropractor',
    city: 'Sydney', state: 'NSW', postcode: '2000',
    address: 'Mezzanine Level, 580 George Street, Sydney NSW 2000',
    phone: '0418 887 436', phoneHref: '+61418887436',
    website: 'https://www.sydneyspine.com.au/',
    services: ['Chiropractic care', 'Back pain', 'Joint pain'],
    description: 'A Sydney CBD chiropractic clinic offering assessment and care for back pain and other musculoskeletal concerns.',
  },
  {
    slug: 'back-in-care-melbourne',
    name: 'Back In Care Chiropractic',
    type: 'Chiropractor',
    city: 'Melbourne', state: 'VIC', postcode: '3000',
    address: '287 Spring Street, Melbourne VIC 3000',
    phone: '(03) 9663 9313', phoneHref: '+61396639313',
    website: 'https://www.backincare.com.au/',
    services: ['Chiropractic care', 'Posture assessment', 'Orthotics'],
    description: 'A Melbourne CBD chiropractic practice providing chiropractic care and posture assessment.',
  },
];
