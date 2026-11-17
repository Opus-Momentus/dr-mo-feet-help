export type Product = { name: string; category: string; description: string; merchant: string; url: string };

// Replace these direct merchant URLs with approved, trackable affiliate URLs after partnerships are established.
export const products: Product[] = [
  { name: 'New Balance 928v3', category: 'WALKING SHOES', description: 'A leather walking shoe with a removable footbed and a supportive midsole. Fit and comfort are personal.', merchant: 'New Balance', url: 'https://www.newbalance.com/pd/928v3/MW928V3-19761.html' },
  { name: 'Superfeet All-Purpose Support High Arch', category: 'INSOLES', description: 'A trim-to-fit replacement insole designed for shoes with removable insoles. Choose support to suit your feet.', merchant: 'Superfeet', url: 'https://www.superfeet.com/products/all-purpose-support-high-arch' },
  { name: 'THERABAND PRO Exercise Ball', category: 'MOVEMENT TOOLS', description: 'An exercise ball available in a range of sizes for balance and movement activities.', merchant: 'THERABAND', url: 'https://theraband.com/products/theraband-pro-series-exercise-ball' },
];
