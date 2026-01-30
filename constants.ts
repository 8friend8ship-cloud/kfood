import { Post, Product, Tag } from './types';

// Catalog of "Authentic" K-Items
export const PRODUCT_CATALOG: Product[] = [
  {
    id: 'p1',
    nameEn: 'Korean BBQ Grill Pan (Oil Drain)',
    nameKr: 'Samgyeopsal Bulpan',
    description: 'Essential for K-BBQ. Features a slope and hole to drain pork belly fat automatically.',
    priceUsd: 35.00,
    priceKr: 39000,
    category: 'tool',
    links: {
      global: 'https://amazon.com/s?k=korean+bbq+grill+pan',
      kr: 'https://coupang.com/np/search?q=삼겹살불판'
    },
    image: 'https://picsum.photos/id/200/100/100'
  },
  {
    id: 'p2',
    nameEn: 'Earthenware Pot',
    nameKr: 'Ttukbaegi',
    description: 'Breathable clay pot. Keeps Stew (Jjigae) boiling hot until the last spoonful.',
    priceUsd: 22.50,
    priceKr: 12000,
    category: 'tool',
    links: {
      global: 'https://amazon.com/s?k=korean+earthenware+pot',
      kr: 'https://coupang.com/np/search?q=뚝배기'
    },
    image: 'https://picsum.photos/id/201/100/100'
  },
  {
    id: 'p3',
    nameEn: 'BBQ Scissors',
    nameKr: 'Gogi Gawi',
    description: 'Heavy-duty curved scissors designed specifically for cutting thick meat effortlessly.',
    priceUsd: 12.00,
    priceKr: 5500,
    category: 'tool',
    links: {
      global: 'https://amazon.com/s?k=korean+bbq+scissors',
      kr: 'https://coupang.com/np/search?q=고기가위'
    },
    image: 'https://picsum.photos/id/202/100/100'
  },
  {
    id: 'p4',
    nameEn: 'Green Onion Slicer',
    nameKr: 'Pa-Chae-Kal',
    description: 'A hidden gem. Shreds green onions instantly for the perfect BBQ side salad.',
    priceUsd: 8.00,
    priceKr: 3000,
    category: 'tool',
    links: {
      global: 'https://amazon.com/s?k=green+onion+shredder',
      kr: 'https://coupang.com/np/search?q=파채칼'
    },
    image: 'https://picsum.photos/id/203/100/100'
  },
  {
    id: 'p5',
    nameEn: 'Ssamjang (Seasoned Soybean Paste)',
    nameKr: 'Ssamjang',
    description: 'The magic sauce for lettuce wraps. Savory, sweet, and slightly spicy.',
    priceUsd: 6.50,
    priceKr: 4500,
    category: 'ingredient',
    links: {
      global: 'https://amazon.com/s?k=ssamjang',
      kr: 'https://coupang.com/np/search?q=쌈장'
    },
    image: 'https://picsum.photos/id/204/100/100'
  }
];

// Mock Posts (The Feed)
export const MOCK_POSTS: Post[] = [
  {
    id: 'post1',
    title: 'Weekend Samgyeopsal Party at Home 🥓',
    author: 'KimCooks',
    imageUrl: 'https://images.unsplash.com/photo-1594967396068-45cb1d310123?q=80&w=1200&auto=format&fit=crop', // K-BBQ visual
    description: 'Nothing beats grilling pork belly on a proper slanted pan. The oil drains right out!',
    likes: 1240,
    tags: [
      { id: 't1', x: 50, y: 55, product: PRODUCT_CATALOG[0] }, // Grill
      { id: 't2', x: 75, y: 70, product: PRODUCT_CATALOG[2] }, // Scissors
      { id: 't3', x: 20, y: 80, product: PRODUCT_CATALOG[4] }, // Ssamjang
    ]
  },
  {
    id: 'post2',
    title: 'Rainy Day Kimchi Stew (Kimchi-Jjigae)',
    author: 'SeoulSister',
    imageUrl: 'https://images.unsplash.com/photo-1583563964958-f9b87063467e?q=80&w=1200&auto=format&fit=crop', // Stew visual
    description: 'The secret to the boiling sound is the Ttukbaegi. Authentic taste requires authentic heat retention.',
    likes: 850,
    tags: [
      { id: 't4', x: 50, y: 60, product: PRODUCT_CATALOG[1] }, // Ttukbaegi
    ]
  }
];