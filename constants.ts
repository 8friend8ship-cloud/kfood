import { Post, Product, Theme, Author, Tag } from './types';

// Collection: Themes
export const THEMES: Theme[] = [
  {
    id: 'all',
    title: 'All',
    icon: '🍽️',
    description: 'Everything K-Kitchen',
    keywords: [],
    gradient: 'from-gray-800 to-gray-900'
  },
  {
    id: 'theme_noodle_01',
    title: 'Ramyun Heaven',
    icon: '🍜',
    description: 'Slurp the best noodles',
    keywords: ['Ramen', 'Noodle', 'Samyang', 'Buldak', 'Pot', 'Shin', 'Neoguri', 'Chapagetti'],
    gradient: 'from-yellow-500 to-orange-400'
  },
  {
    id: 'theme_bbq_01',
    title: 'Home K-BBQ',
    icon: '🥩',
    description: 'Grill like a pro at home',
    keywords: ['Grill', 'BBQ', 'Scissors', 'Pork', 'Ssamjang', 'Galbi', 'Bulgogi', 'Lid'],
    gradient: 'from-orange-500 to-amber-500'
  },
  {
    id: 'theme_snack_01',
    title: 'K-Snack Bar',
    icon: '🍪',
    description: 'Sweet & Salty Treats',
    keywords: ['Snack', 'Chip', 'Cookie', 'Choco', 'Jelly', 'Drink', 'Milk'],
    gradient: 'from-pink-400 to-rose-400'
  },
  {
    id: 'theme_sauce_01',
    title: 'Sauce Pantry',
    icon: '🌶️',
    description: 'The Soul of Korean Taste',
    keywords: ['Gochujang', 'Doenjang', 'Soy', 'Sauce', 'Oil', 'Powder', 'Paste'],
    gradient: 'from-red-700 to-red-900'
  },
  {
    id: 'theme_stew_01',
    title: 'Cozy Stews',
    icon: '🥘',
    description: 'Comfort food for rainy days',
    keywords: ['Pot', 'Ttukbaegi', 'Stew', 'Soup', 'Kimchi'],
    gradient: 'from-emerald-600 to-teal-600'
  }
];

// Helper to generate Amazon Search Link
const amz = (keyword: string) => `https://amazon.com/s?k=${encodeURIComponent(keyword)}`;
const coupang = (keyword: string) => `https://coupang.com/np/search?q=${encodeURIComponent(keyword)}`;

// GHOST PROTOCOL: Virtual Influencers (Personas)
export const GHOST_AUTHORS: Author[] = [
    { id: "user_mama_kim", name: "Mama Kim", title: "Home Cook Master", followers: 12500, avatar: "https://i.pravatar.cc/150?u=mama" },
    { id: "user_seoul_eats", name: "Seoul Eats", title: "K-Food Hunter", followers: 8900, avatar: "https://i.pravatar.cc/150?u=seoul" },
    { id: "user_chef_lee", name: "Chef Lee", title: "Professional Chef", followers: 45000, avatar: "https://i.pravatar.cc/150?u=chef" },
    { id: "user_spicy_girl", name: "Spicy Girl", title: "Mukbang Streamer", followers: 23200, avatar: "https://i.pravatar.cc/150?u=spicy" },
    { id: "user_camping_dad", name: "Camping Dad", title: "Outdoor Cooking", followers: 5600, avatar: "https://i.pravatar.cc/150?u=camp" }
];


// Catalog of "Authentic" K-Items
export const PRODUCT_CATALOG: Product[] = [
  // --- KILLER ITEM (Authentic Culture) ---
  {
    id: 'tool_sotddukeong',
    nameEn: 'Cast Iron Cauldron Lid (Sot-ddu-keong)',
    nameKr: '솥뚜껑 불판',
    searchKeyword: 'Korean Cast Iron BBQ Pan Cauldron Lid',
    description: 'The ultimate K-BBQ flex. Grills meat on a massive cast iron lid, retaining heat and draining oil perfectly.',
    priceUsd: 59.99,
    priceKr: 55000,
    category: 'tool',
    links: { global: amz('Korean Cast Iron BBQ Pan'), kr: coupang('솥뚜껑 불판') },
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=600',
    isBestseller: true,
    productTags: ["Authentic", "Heavy Duty", "Camping"],
    bestVideoUrl: "https://www.youtube.com/results?search_query=Sot-ddu-keong+BBQ+Mukbang"
  },

  // --- FEATURED PREMIUM ITEMS (High Margin) ---
  {
    id: 'ramyun_samyang_01',
    nameEn: 'Samyang Ramen (Original Flavor)',
    nameKr: '삼양라면',
    searchKeyword: 'Samyang Ramen Original Korean Instant Noodles 5 Pack',
    description: 'The mild and savory original taste of Korea. A classic staple since 1963.',
    priceUsd: 7.50,
    priceKr: 3500,
    category: 'ingredient',
    links: {
      global: 'https://amzn.to/4sZpzTw', 
      kr: 'https://coupang.com/vp/products/123456'
    },
    image: 'https://images.unsplash.com/photo-1615486511484-92e172cc416d?q=80&w=1200&auto=format&fit=crop',
    isBestseller: true,
    productTags: ["Noodle", "Mild", "Classic"],
    bestVideoUrl: "https://www.youtube.com/watch?v=1rY1h1v1o1o" // Example direct link
  },
  {
    id: 'tool_ttukbaegi_01',
    nameEn: 'Premium Korean Stone Bowl (Ttukbaegi)',
    nameKr: '뚝배기',
    searchKeyword: 'Korean Stone Bowl Earthenware Pot Bibimbap Jjigae',
    description: 'Essential for bubbling Kimchi Stew. Keeps food hot until the very last bite.',
    priceUsd: 24.99,
    priceKr: 15000,
    category: 'tool',
    links: {
      global: 'https://amzn.to/4qZ2jnh',
      kr: 'https://coupang.com/np/search?q=뚝배기'
    },
    image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&q=80&w=600',
    isBestseller: true,
    productTags: ["Earthenware", "Stew", "Bibimbap", "Hot"]
  },
  {
    id: 'tool_bbq_grill_01',
    nameEn: 'Authentic Korean BBQ Grill Pan',
    nameKr: '삼겹살 불판',
    searchKeyword: 'Korean BBQ Grill Pan Stove Top Oil Drain Nonstick',
    description: 'The secret to crispy Pork Belly. The slanted design drains excess fat automatically.',
    priceUsd: 32.99,
    priceKr: 39000,
    category: 'tool',
    links: {
      global: 'https://amzn.to/4r8azlb', 
      kr: 'https://coupang.com/np/search?q=삼겹살불판'
    },
    image: 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?auto=format&fit=crop&q=80&w=600',
    isBestseller: true,
    productTags: ["K-BBQ", "Pork Belly", "Party", "Camping"]
  },

  // --- K-INSTANT (Ramen & Noodles) ---
  {
    id: 'ramyun_shin',
    nameEn: 'Shin Ramyun (The Legend)',
    nameKr: '신라면',
    searchKeyword: 'Nongshim Shin Ramyun Spicy Pillow Pack',
    description: 'The distinct spicy beef broth that defines Korean Ramyun. #1 Best Seller.',
    priceUsd: 5.99,
    priceKr: 3000,
    category: 'ingredient',
    links: { global: amz('Nongshim Shin Ramyun Spicy'), kr: coupang('신라면') },
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Nongshim_Shin_Ramyun_2022.jpg/600px-Nongshim_Shin_Ramyun_2022.jpg'
  },
  {
    id: 'ramyun_buldak',
    nameEn: 'Buldak Fire Noodle (Original)',
    nameKr: '불닭볶음면',
    searchKeyword: 'Samyang Buldak Hot Chicken Flavor Ramen',
    description: 'Extreme spicy chicken flavor. Famous for the "Fire Noodle Challenge".',
    priceUsd: 6.99,
    priceKr: 4000,
    category: 'ingredient',
    links: { global: amz('Samyang Buldak Hot Chicken Ramen'), kr: coupang('불닭볶음면') },
    image: 'https://images.unsplash.com/photo-1627042633145-b780d842ba45?auto=format&fit=crop&q=80&w=600',
    bestVideoUrl: "https://www.youtube.com/results?search_query=Fire+Noodle+Challenge"
  },
  {
    id: 'ramyun_carbo',
    nameEn: 'Buldak Carbonara (Pink)',
    nameKr: '까르보 불닭',
    searchKeyword: 'Samyang Buldak Carbonara Ramen',
    description: 'Creamy and spicy. The perfect balance for those who want heat with flavor.',
    priceUsd: 7.50,
    priceKr: 4500,
    category: 'ingredient',
    links: { global: amz('Samyang Buldak Carbonara'), kr: coupang('까르보불닭') },
    image: 'https://images.unsplash.com/photo-1553163147-622ab57be0c7?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'ramyun_chapagetti',
    nameEn: 'Chapagetti (Black Bean)',
    nameKr: '짜파게티',
    searchKeyword: 'Nongshim Chapagetti Chajang Noodle',
    description: 'Instant Jajangmyeon. Savory black bean sauce noodles. Mix with Neoguri for Jjapaguri.',
    priceUsd: 6.50,
    priceKr: 3800,
    category: 'ingredient',
    links: { global: amz('Nongshim Chapagetti'), kr: coupang('짜파게티') },
    image: 'https://images.unsplash.com/photo-1629851608240-a10c2c2f483c?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'ramyun_neoguri',
    nameEn: 'Neoguri (Seafood Udon)',
    nameKr: '너구리',
    searchKeyword: 'Nongshim Neoguri Spicy Seafood Noodle',
    description: 'Chunky udon-style noodles in spicy seafood broth. Features a real piece of kelp.',
    priceUsd: 6.50,
    priceKr: 3800,
    category: 'ingredient',
    links: { global: amz('Nongshim Neoguri'), kr: coupang('너구리') },
    image: 'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'ramyun_jin_mild',
    nameEn: 'Jin Ramen (Mild)',
    nameKr: '진라면 순한맛',
    searchKeyword: 'Ottogi Jin Ramen Mild',
    description: 'A gentle, savory broth loaded with vegetables. Great for kids or non-spicy eaters.',
    priceUsd: 5.99,
    priceKr: 3000,
    category: 'ingredient',
    links: { global: amz('Ottogi Jin Ramen Mild'), kr: coupang('진라면 순한맛') },
    image: 'https://images.unsplash.com/photo-1623961990059-28356e22bc76?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'ramyun_bibim',
    nameEn: 'Paldo Bibim Men (Cold)',
    nameKr: '팔도 비빔면',
    searchKeyword: 'Paldo Bibim Men Cold Noodle',
    description: 'Refreshing cold noodles with sweet and spicy apple chili paste. Summer favorite.',
    priceUsd: 6.50,
    priceKr: 3500,
    category: 'ingredient',
    links: { global: amz('Paldo Bibim Men'), kr: coupang('팔도비빔면') },
    image: 'https://images.unsplash.com/photo-1625243144883-7c3a1d957d54?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'ramyun_gomtang',
    nameEn: 'Gomtang (Beef Bone)',
    nameKr: '사리곰탕',
    searchKeyword: 'Nongshim Gomtang Beef Bone Soup',
    description: 'Non-spicy, milky white beef bone broth. Rich, savory, and comforting.',
    priceUsd: 6.50,
    priceKr: 3500,
    category: 'ingredient',
    links: { global: amz('Nongshim Gomtang'), kr: coupang('사리곰탕') },
    image: 'https://images.unsplash.com/photo-1596450504847-5264b9bb9697?auto=format&fit=crop&q=80&w=600'
  },
  
  // --- K-INGREDIENTS (Fresh & Basic) ---
  {
    id: 'ingredient_egg_01',
    nameEn: 'Fresh Grade A Large Eggs',
    nameKr: '신선란',
    searchKeyword: 'Fresh Grade A Large Eggs',
    description: 'Fresh organic brown eggs. The essential finishing touch for authentic Ramyun and Bibimbap.',
    priceUsd: 5.99,
    priceKr: 7000,
    category: 'ingredient',
    links: { global: 'https://amzn.to/4bXGyiX', kr: coupang('신선란') },
    image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'ingredient_beef_brisket',
    nameEn: 'Beef Brisket (Sliced for Soup)',
    nameKr: '양지머리 (국거리)',
    searchKeyword: 'Fresh Beef Brisket Sliced for Hot Pot',
    description: 'Lean cuts of beef that make the broth rich and deep. Essential for Yukgaejang.',
    priceUsd: 15.99,
    priceKr: 20000,
    category: 'ingredient',
    links: { global: amz('Fresh Beef Brisket Sliced'), kr: coupang('양지머리') },
    image: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'ingredient_garlic_minced',
    nameEn: 'Minced Garlic',
    nameKr: '다진 마늘',
    searchKeyword: 'Minced Garlic Jar',
    description: 'The foundation of Korean cuisine. Use generously.',
    priceUsd: 4.99,
    priceKr: 3000,
    category: 'ingredient',
    links: { global: amz('Minced Garlic'), kr: coupang('다진 마늘') },
    image: 'https://images.unsplash.com/photo-1615477381421-12c82d8c9096?auto=format&fit=crop&q=80&w=600'
  },
  
  // --- K-FRESH (Vegetables & Toppings) ---
  {
    id: 'veg_green_onion',
    nameEn: 'Fresh Green Onions (Scallions)',
    nameKr: '대파 / 쪽파',
    searchKeyword: 'Fresh Green Onions',
    description: 'Essential topping for Ramyun and Kimchi Stew. Adds a crisp, fresh kick.',
    priceUsd: 2.99,
    priceKr: 3000,
    category: 'ingredient',
    links: { global: amz('Fresh Green Onions'), kr: coupang('대파') },
    image: 'https://images.unsplash.com/photo-1618888265008-591574a62174?w=400&q=80' // DATA FIX
  },
  {
    id: 'veg_bokchoy',
    nameEn: 'Fresh Bok Choy (Baby)',
    nameKr: '청경채',
    searchKeyword: 'Fresh Bok Choy',
    description: 'Crunchy and juicy. Perfect for adding texture to spicy noodle soups.',
    priceUsd: 3.99,
    priceKr: 2000,
    category: 'ingredient',
    links: { global: amz('Fresh Bok Choy'), kr: coupang('청경채') },
    image: 'https://images.unsplash.com/photo-1528796850122-96535d4dc9b8?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'veg_cilantro',
    nameEn: 'Fresh Cilantro (Coriander)',
    nameKr: '고수',
    searchKeyword: 'Fresh Cilantro Bunch',
    description: 'A polarizing but loved aromatic. Great for fusion tacos or spicy soups.',
    priceUsd: 1.99,
    priceKr: 3000,
    category: 'ingredient',
    links: { global: amz('Fresh Cilantro Bunch'), kr: coupang('고수') },
    image: 'https://images.unsplash.com/photo-1627995166649-165c27632663?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'topping_corn',
    nameEn: 'Sweet Corn Kernels (Canned)',
    nameKr: '스위트 콘',
    searchKeyword: 'Whole Kernel Sweet Corn Canned',
    description: 'Sweet and popping texture. The secret topping for "Bul-dak" noodles to cut the spice.',
    priceUsd: 1.50,
    priceKr: 1500,
    category: 'ingredient',
    links: { global: amz('Whole Kernel Sweet Corn Canned'), kr: coupang('스위트 콘') },
    image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&q=80&w=600'
  },

  // --- K-TOOLS ---
  {
    id: 'tool_gold_pot',
    nameEn: 'Nickel-Silver Ramen Pot',
    nameKr: '양은냄비',
    searchKeyword: 'Korean Aluminum Ramen Pot Gold',
    description: 'The iconic gold pot seen in K-Dramas. Conducts heat fast for perfect ramen texture.',
    priceUsd: 14.99,
    priceKr: 5000,
    category: 'tool',
    links: { global: 'https://amzn.to/49Mh1ba', kr: coupang('양은냄비') },
    image: 'https://t1.daumcdn.net/cfile/tistory/24294C4B56B0631320'
  },
  {
    id: 'tool_sujeo',
    nameEn: 'Premium Korean Stainless Steel Spoon & Chopsticks',
    nameKr: '수저 세트',
    searchKeyword: 'Korean Stainless Steel Chopsticks and Spoon Set',
    description: 'Essential for eating Ramyeon. Flat chopsticks + Long spoon.',
    priceUsd: 9.99,
    priceKr: 4000,
    category: 'tool',
    links: { global: 'https://amzn.to/4qS9Vbg', kr: coupang('수저세트') },
    image: 'https://images.unsplash.com/photo-1584269986326-681b49826352?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'tool_makgeolli_kettle',
    nameEn: 'Makgeolli Kettle Set',
    nameKr: '막걸리 주전자',
    searchKeyword: 'Korean Makgeolli Kettle and Bowl Set',
    description: 'Yellow aluminum kettle set for serving Rice Wine (Makgeolli).',
    priceUsd: 19.99,
    priceKr: 8000,
    category: 'tool',
    links: { global: amz('Makgeolli Kettle Set'), kr: coupang('막걸리 주전자') },
    image: 'https://images.unsplash.com/photo-1616259024097-47b853545b73?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'tool_scissors',
    nameEn: 'BBQ Meat Scissors',
    nameKr: '고기 가위',
    searchKeyword: 'Korean BBQ Meat Scissors Heavy Duty',
    description: 'Essential for K-BBQ. Cuts through thick pork belly and galbi effortlessly.',
    priceUsd: 12.00,
    priceKr: 5500,
    category: 'tool',
    links: { global: amz('Korean BBQ Scissors'), kr: coupang('고기 가위') },
    image: "https://images.unsplash.com/photo-1595475253503-6f4174352163?w=600&q=80",
  },
  {
    id: 'tool_tongs',
    nameEn: 'Self-Standing Tongs',
    nameKr: '집게',
    searchKeyword: 'Korean BBQ Tongs Stainless Steel Self Standing',
    description: 'Hygienic tongs that stand up on their own. Keep your table clean while grilling.',
    priceUsd: 9.99,
    priceKr: 3000,
    category: 'tool',
    links: { global: amz('Korean BBQ Tongs'), kr: coupang('고기 집게') },
    image: 'https://images.unsplash.com/photo-1594967396068-45cb1d310123?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'tool_rice_bowl',
    nameEn: 'Stainless Rice Bowl',
    nameKr: '공기밥 그릇',
    searchKeyword: 'Korean Stainless Steel Rice Bowl with Lid',
    description: 'Classic steel bowl with lid. Keeps rice warm and moist.',
    priceUsd: 11.99,
    priceKr: 3000,
    category: 'tool',
    links: { global: amz('Korean Rice Bowl Stainless'), kr: coupang('스텐 밥그릇') },
    image: 'https://images.unsplash.com/photo-1567123998818-42220478eb04?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'tool_soju_glass',
    nameEn: 'Soju Glass Set',
    nameKr: '소주잔',
    searchKeyword: 'Korean Soju Glass Set',
    description: 'Small glass cups for Soju. The perfect size for a "One-Shot".',
    priceUsd: 8.99,
    priceKr: 2000,
    category: 'tableware',
    links: { global: amz('Soju Glass Set'), kr: coupang('소주잔') },
    image: 'https://images.unsplash.com/photo-1596701062351-8c2c14d1fdd0?auto=format&fit=crop&q=80&w=600'
  },

  // --- K-SNACKS ---
  {
    id: 'snack_chocopie',
    nameEn: 'Choco Pie',
    nameKr: '초코파이',
    searchKeyword: 'Orion Choco Pie Marshmallow',
    description: 'The world-famous chocolate covered marshmallow cake.',
    priceUsd: 5.99,
    priceKr: 4000,
    category: 'snack',
    links: { global: amz('Orion Choco Pie'), kr: coupang('초코파이') },
    image: 'https://images.unsplash.com/photo-1605698802081-37d0d08b1b38?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'snack_seaweed',
    nameEn: 'Roasted Seaweed (Gim)',
    nameKr: '김',
    searchKeyword: 'Korean Roasted Seaweed Snack Sea Salt',
    description: 'Crispy, salty, and healthy. Eat it with rice or as a snack.',
    priceUsd: 9.99,
    priceKr: 5000,
    category: 'snack',
    links: { global: amz('Korean Seaweed Snack'), kr: coupang('조미김') },
    image: 'https://images.unsplash.com/photo-1606923829571-0f26e64f38ad?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'snack_shrimp',
    nameEn: 'Shrimp Cracker (Saewookkang)',
    nameKr: '새우깡',
    searchKeyword: 'Nongshim Shrimp Cracker',
    description: 'Salty shrimp flavored crackers. Korea\'s favorite snack for decades.',
    priceUsd: 3.99,
    priceKr: 1500,
    category: 'snack',
    links: { global: amz('Nongshim Shrimp Cracker'), kr: coupang('새우깡') },
    image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'snack_honeybutter',
    nameEn: 'Honey Butter Chip',
    nameKr: '허니버터칩',
    searchKeyword: 'Haitai Honey Butter Chip',
    description: 'The legendary potato chips with sweet honey and savory butter flavor.',
    priceUsd: 4.99,
    priceKr: 2000,
    category: 'snack',
    links: { global: amz('Honey Butter Chip'), kr: coupang('허니버터칩') },
    image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'snack_banana',
    nameEn: 'Banana Milk',
    nameKr: '바나나맛 우유',
    searchKeyword: 'Binggrae Banana Milk Drink',
    description: 'Sweet, creamy, and addictive. The jar shape is iconic.',
    priceUsd: 6.99,
    priceKr: 1400,
    category: 'snack',
    links: { global: amz('Binggrae Banana Milk'), kr: coupang('바나나맛 우유') },
    image: 'https://images.unsplash.com/photo-1602166723225-b873a436152a?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'snack_maxim',
    nameEn: 'Maxim Mocha Gold',
    nameKr: '맥심 모카골드',
    searchKeyword: 'Maxim Mocha Gold Instant Coffee Mix',
    description: 'The golden ratio of coffee, cream, and sugar. The soul food of Korean offices.',
    priceUsd: 15.99,
    priceKr: 12000,
    category: 'snack',
    links: { global: amz('Maxim Mocha Gold'), kr: coupang('맥심 모카골드') },
    image: 'https://images.unsplash.com/photo-1589395937827-04d3cb544627?auto=format&fit=crop&q=80&w=600'
  },

  // --- K-SAUCES ---
  {
    id: 'sauce_gochujang',
    nameEn: 'Gochujang (Red Paste)',
    nameKr: '고추장',
    searchKeyword: 'Gochujang Korean Hot Pepper Paste',
    description: 'Fermented chili paste. The backbone of spicy Korean cooking.',
    priceUsd: 8.99,
    priceKr: 5000,
    category: 'sauce',
    links: { global: amz('Gochujang'), kr: coupang('고추장') },
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'sauce_gochugaru',
    nameEn: 'Coarse Red Chili Flakes (Gochugaru)',
    nameKr: '고춧가루',
    searchKeyword: 'Korean Red Chili Pepper Flakes Powder Coarse',
    description: 'The key ingredient for Kimchi and spicy soups. Adds vibrant red color and heat.',
    priceUsd: 12.99,
    priceKr: 15000,
    category: 'sauce',
    links: { global: amz('Korean Red Chili Flakes'), kr: coupang('고춧가루') },
    image: 'https://images.unsplash.com/photo-1585672840545-a7a28eb6bc64?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'sauce_ssamjang',
    nameEn: 'Ssamjang (BBQ Dip)',
    nameKr: '쌈장',
    searchKeyword: 'Ssamjang Seasoned Soybean Paste for BBQ',
    description: "Savory and sweet dipping sauce for lettuce wraps (Ssam). Essential for K-BBQ.",
    priceUsd: 6.50,
    priceKr: 4500,
    category: 'sauce',
    links: { global: amz('Ssamjang'), kr: coupang('쌈장') },
    image: 'https://i.imgur.com/8Qj8jXy.jpg'
  },
  {
    id: 'sauce_soup_soy',
    nameEn: 'Soup Soy Sauce (Guk-Ganjang)',
    nameKr: '국간장',
    searchKeyword: 'Korean Soup Soy Sauce Gukganjang',
    description: 'Lighter in color but saltier than regular soy sauce. Essential for seasoning soups without darkening them.',
    priceUsd: 8.99,
    priceKr: 5000,
    category: 'sauce',
    links: { global: amz('Korean Soup Soy Sauce'), kr: coupang('국간장') },
    image: 'https://images.unsplash.com/photo-1627306236965-0219c0182647?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'sauce_sesame',
    nameEn: 'Sesame Oil',
    nameKr: '참기름',
    searchKeyword: 'Korean 100% Pure Sesame Oil',
    description: 'Rich, nutty aroma. Used as a finishing oil for almost every dish.',
    priceUsd: 12.99,
    priceKr: 7000,
    category: 'sauce',
    links: { global: amz('Korean Sesame Oil'), kr: coupang('참기름') },
    image: 'https://images.unsplash.com/photo-1474979266404-7cadd259d3d6?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'sauce_pepper',
    nameEn: 'Black Pepper Powder',
    nameKr: '후추',
    searchKeyword: 'Pure Ground Black Pepper',
    description: 'Adds a sharp kick to beef soups.',
    priceUsd: 4.50,
    priceKr: 3000,
    category: 'sauce',
    links: { global: amz('Ground Black Pepper'), kr: coupang('순후추') },
    image: 'https://images.unsplash.com/photo-1551352726-0e1215b3997e?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'sauce_kimchi_powder',
    nameEn: 'Kimchi Seasoning',
    nameKr: '김치 시즈닝',
    searchKeyword: 'Seoul Sisters Kimchi Seasoning Mix',
    description: 'Magic dust that makes anything taste like Kimchi. Try it on pizza!',
    priceUsd: 11.99,
    priceKr: 5000,
    category: 'sauce',
    links: { global: amz('Kimchi Seasoning'), kr: coupang('김치 시즈닝') },
    image: 'https://images.unsplash.com/photo-1550950158-d0d960d9f9dd?auto=format&fit=crop&q=80&w=600'
  },

  // --- K-KITS ---
  {
    id: 'kit_tteokbokki',
    nameEn: 'Tteokbokki Kit',
    nameKr: '떡볶이 키트',
    searchKeyword: 'Instant Tteokbokki Rice Cake with Sauce',
    description: 'Spicy rice cakes. The #1 Korean street food you can make at home.',
    priceUsd: 8.99,
    priceKr: 4000,
    category: 'kit',
    links: { global: amz('Instant Tteokbokki'), kr: coupang('떡볶이 밀키트') },
    image: 'https://images.unsplash.com/photo-1626042436853-294b30e46101?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'kit_hotteok',
    nameEn: 'Hotteok Mix (Pancake)',
    nameKr: '호떡 믹스',
    searchKeyword: 'Korean Sweet Pancake Mix Hotteok',
    description: 'Sweet pancakes filled with brown sugar and nuts. Fun to make!',
    priceUsd: 7.99,
    priceKr: 3000,
    category: 'kit',
    links: { global: amz('Hotteok Mix'), kr: coupang('호떡믹스') },
    image: 'https://images.unsplash.com/photo-1610450949026-c29007cb51a3?auto=format&fit=crop&q=80&w=600'
  }
];

const CURATED_POSTS: Post[] = [
  {
    id: 'feed_sotddukeong_01',
    title: 'Countryside Grandma\'s BBQ Secret 👵',
    author: GHOST_AUTHORS[4], // Camping Dad
    imageUrl: "https://images.unsplash.com/photo-1594040226829-7f251ab46d80?w=800&q=80",
    videoUrl: 'https://cdn.pixabay.com/video/2022/04/24/115019-702758253_large.mp4', // Sizzling meat
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c8a73467.mp3',
    description: 'Have you ever tried grilling pork belly on a massive cast iron cauldron lid? The convex shape drains the oil perfectly, making the meat crispy on the outside and juicy on the inside.',
    likes: 9540,
    bestVideoUrl: "https://www.youtube.com/watch?v=kY8H2sJq3Qk", // Countryside cooking
    tags: [
      { id: 't_lid_1', x: 50, y: 50, product: PRODUCT_CATALOG.find(p => p.id === 'tool_sotddukeong')! },
      { id: 't_lid_2', x: 70, y: 70, product: PRODUCT_CATALOG.find(p => p.id === 'tool_scissors')! },
      { id: 't_lid_3', x: 30, y: 30, product: PRODUCT_CATALOG.find(p => p.id === 'sauce_ssamjang')! },
    ]
  },
  {
    id: 'feed_yukgaejang_001',
    title: 'Secret Recipe: Authentic Yukgaejang (Spicy Beef Soup) 🌶️',
    author: GHOST_AUTHORS[0], // Mama Kim
    imageUrl: 'https://images.unsplash.com/photo-1580651315530-69c8e0026377?w=800&q=80',
    videoUrl: 'https://cdn.pixabay.com/video/2023/10/22/186115-877660652_large.mp4', // Bubbling soup
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_2238463092.mp3', // Boiling sound
    description: 'This soup is the soul of Korean comfort food. While the Ttukbaegi keeps it hot, the real secret lies in the specialized sauces and high-quality beef.',
    likes: 8200,
    bestVideoUrl: "https://www.youtube.com/watch?v=HuW3t_XbB78", // Paik's Cuisine Yukgaejang
    tags: [
      { id: 't_yuk_1', x: 50, y: 50, product: PRODUCT_CATALOG.find(p => p.id === 'tool_ttukbaegi_01')! },
      { id: 't_yuk_2', x: 40, y: 60, product: PRODUCT_CATALOG.find(p => p.id === 'ingredient_beef_brisket')! },
      { id: 't_yuk_3', x: 60, y: 40, product: PRODUCT_CATALOG.find(p => p.id === 'veg_green_onion')! },
    ],
    recipeEssentials: [
      { product: PRODUCT_CATALOG.find(p => p.id === 'sauce_gochugaru')!, reason: 'Must-have for the spicy red broth.' },
      { product: PRODUCT_CATALOG.find(p => p.id === 'sauce_soup_soy')!, reason: 'Adds deep umami to the soup base.' },
      { product: PRODUCT_CATALOG.find(p => p.id === 'sauce_sesame')!, reason: 'Used to sauté the beef first.' },
      { product: PRODUCT_CATALOG.find(p => p.id === 'ingredient_garlic_minced')!, reason: 'The soul of Korean soup.' },
      { product: PRODUCT_CATALOG.find(p => p.id === 'sauce_pepper')!, reason: 'Final touch for the beef flavor.' },
    ]
  },
  {
    id: 'feed_ramyun_001',
    title: 'Han River Style Ramyeon Feast 🍜',
    author: GHOST_AUTHORS[1], // Seoul Eats
    imageUrl: 'https://images.unsplash.com/photo-1618888265008-591574a62174?w=800&q=80',
    videoUrl: 'https://cdn.pixabay.com/video/2021/04/28/72506-543162793_large.mp4', // Noodles
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c8a73467.mp3', // Slurping/Sizzle (Mock)
    description: 'The golden pot (Yang-eun-naem-bi) heats up fast, keeping noodles chewy. Don\'t forget the egg!',
    likes: 5420,
    bestVideoUrl: "https://www.youtube.com/watch?v=Fj-y5jC6WjQ", // Han River Ramen
    tags: [
      { id: 't_new_1', x: 50, y: 50, product: PRODUCT_CATALOG.find(p => p.id === 'ramyun_samyang_01')! },
      { id: 't_new_2', x: 35, y: 60, product: PRODUCT_CATALOG.find(p => p.id === 'tool_gold_pot')! },
      { id: 't_new_3', x: 75, y: 75, product: PRODUCT_CATALOG.find(p => p.id === 'tool_sujeo')! },
      { id: 't_new_4', x: 55, y: 40, product: PRODUCT_CATALOG.find(p => p.id === 'ingredient_egg_01')! },
    ]
  },
  {
    id: 'post1',
    title: 'Weekend Samgyeopsal Party at Home 🥓',
    author: GHOST_AUTHORS[2], // Chef Lee
    imageUrl: 'https://images.unsplash.com/photo-1594967396068-45cb1d310123?q=80&w=1200&auto=format&fit=crop', // K-BBQ visual
    videoUrl: 'https://cdn.pixabay.com/video/2022/04/24/115019-702758253_large.mp4', // BBQ Sizzle
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c8a73467.mp3', // Sizzle sound
    description: 'Nothing beats grilling pork belly on a proper slanted pan. The oil drains right out!',
    likes: 1240,
    tags: [
      { id: 't1', x: 50, y: 55, product: PRODUCT_CATALOG.find(p => p.id === 'tool_bbq_grill_01')! }, // Grill (Authentic)
      { id: 't2', x: 75, y: 70, product: PRODUCT_CATALOG.find(p => p.id === 'tool_scissors')! }, // Scissors
      { id: 't3', x: 20, y: 80, product: PRODUCT_CATALOG.find(p => p.id === 'sauce_ssamjang')! }, // Ssamjang
    ]
  },
  {
    id: 'post2',
    title: 'Fire Noodle Challenge! 🔥 Can you handle it?',
    author: GHOST_AUTHORS[3], // Spicy Girl
    imageUrl: 'https://images.unsplash.com/photo-1627042633145-b780d842ba45?q=80&w=1200&auto=format&fit=crop', // Stew visual
    description: 'The legendary Fire Noodle Challenge. It\'s not just about the heat, it\'s about the flavor!',
    likes: 28500,
    tags: [
      { id: 't4', x: 50, y: 60, product: PRODUCT_CATALOG.find(p => p.id === 'ramyun_buldak')! }, 
      { id: 't5', x: 20, y: 30, product: PRODUCT_CATALOG.find(p => p.id === 'snack_banana')! },
    ]
  },
  {
    id: 'post3',
    title: 'Late Night Convenience Store Vibe 🏪',
    author: GHOST_AUTHORS[1], // Seoul Eats
    imageUrl: 'https://images.unsplash.com/photo-1629851608240-a10c2c2f483c?q=80&w=1200&auto=format&fit=crop',
    description: 'Mixing Chapagetti and Neoguri is a must. The Parasite movie combo!',
    likes: 3200,
    tags: [
      { id: 't6', x: 40, y: 50, product: PRODUCT_CATALOG.find(p => p.id === 'ramyun_chapagetti')! }, // Chapagetti
      { id: 't7', x: 60, y: 50, product: PRODUCT_CATALOG.find(p => p.id === 'ramyun_neoguri')! }, // Neoguri
    ]
  },
  {
    id: 'post4',
    title: 'Office Break Time ☕',
    author: GHOST_AUTHORS[2], // Chef Lee
    imageUrl: 'https://images.unsplash.com/photo-1589395937827-04d3cb544627?q=80&w=1200&auto=format&fit=crop',
    description: 'Maxim Gold is the fuel of the Korean economy. Sweet and creamy.',
    likes: 540,
    tags: [
      { id: 't8', x: 50, y: 50, product: PRODUCT_CATALOG.find(p => p.id === 'snack_maxim')! }, // Maxim
    ]
  },
  {
    id: 'ghost_post_1',
    title: 'Makgeolli Night with Pajeon (Pancakes)',
    author: GHOST_AUTHORS[0],
    imageUrl: 'https://source.unsplash.com/800x800/?korean,pancake',
    description: 'A rainy day calls for crispy Pajeon and a kettle of Makgeolli. The perfect combination!',
    likes: 1800,
    tags: [
      { id: 'gp1_1', x: 60, y: 60, product: PRODUCT_CATALOG.find(p => p.id === 'tool_makgeolli_kettle')! },
    ]
  },
  {
    id: 'ghost_post_2',
    title: 'The Art of the Perfect Jjapaguri 🎬',
    author: GHOST_AUTHORS[3],
    imageUrl: 'https://source.unsplash.com/800x800/?jjapaguri,ramen',
    description: 'Parasite-style Ram-don is a delicacy. The secret is the perfect ratio and a final touch of sesame oil.',
    likes: 15300,
    tags: [
      { id: 'gp2_1', x: 45, y: 55, product: PRODUCT_CATALOG.find(p => p.id === 'ramyun_chapagetti')! },
      { id: 'gp2_2', x: 65, y: 45, product: PRODUCT_CATALOG.find(p => p.id === 'ramyun_neoguri')! },
      { id: 'gp2_3', x: 30, y: 70, product: PRODUCT_CATALOG.find(p => p.id === 'sauce_sesame')! },
    ]
  },
  {
    id: 'ghost_post_3',
    title: 'Outdoor K-BBQ is another level!',
    author: GHOST_AUTHORS[4],
    imageUrl: 'https://source.unsplash.com/800x800/?camping,bbq,korean',
    description: 'Grilling Samgyeopsal outdoors with friends is an unforgettable experience. Don\'t forget the self-standing tongs!',
    likes: 2100,
    tags: [
      { id: 'gp3_1', x: 50, y: 65, product: PRODUCT_CATALOG.find(p => p.id === 'tool_bbq_grill_01')! },
      { id: 'gp3_2', x: 70, y: 50, product: PRODUCT_CATALOG.find(p => p.id === 'tool_tongs')! },
    ]
  }
];

/**
 * [GENESIS SCRIPT]
 * Generates 100 global personas and their lifestyle feeds to simulate an active community.
 */
function generateGlobalPersonaPosts(): Post[] {
  const generatedPosts: Post[] = [];

  const nations = [
    { code: "US", name: "USA", names: ["Mike", "Sarah", "John", "Emily"], vibe: "Wild Camping" },
    { code: "KR", name: "Korea", names: ["Minjun", "Ji-u", "Hyun", "Soo"], vibe: "Authentic" },
    { code: "JP", name: "Japan", names: ["Ken", "Yui", "Hiro", "Sakura"], vibe: "Minimalist" },
    { code: "FR", name: "France", names: ["Leo", "Lea", "Gabriel", "Amelie"], vibe: "Gourmet" },
    { code: "VN", name: "Vietnam", names: ["Linh", "Minh", "An", "Chi"], vibe: "Spicy Lover" }
  ];

  const hobbies = [
    { 
      type: "Camping", 
      keywords: ["camping", "bonfire", "tent"],
      products: ["tool_gold_pot", "ramyun_shin", "tool_bbq_grill_01", "sauce_ssamjang"], 
      desc: "Nothing beats Ramyeon outdoors! ⛺️🍜"
    },
    { 
      type: "Fishing", 
      keywords: ["fishing", "lake", "fish"],
      products: ["tool_sujeo", "sauce_gochujang", "ramyun_neoguri"], 
      desc: "Catch of the day + Spicy Noodle Soup 🐟🌶️"
    },
    { 
      type: "HomeCooking", 
      keywords: ["kitchen", "cooking", "home"],
      products: ["kit_tteokbokki", "sauce_soup_soy", "ingredient_egg_01"], 
      desc: "Trying K-Food recipe at home today! 👩‍🍳"
    }
  ];

  for (let i = 0; i < 100; i++) {
    const nation = nations[Math.floor(Math.random() * nations.length)];
    const hobby = hobbies[Math.floor(Math.random() * hobbies.length)];
    const userName = `${nation.names[Math.floor(Math.random() * nation.names.length)]}_${Math.floor(Math.random() * 999)}`;
    
    const feedImage = `https://source.unsplash.com/800x800/?${hobby.keywords[0]},korean,food,${i}`; 
    const avatarImage = `https://i.pravatar.cc/150?u=${userName}`;

    const author: Author = {
      id: `user_persona_${i}`,
      name: userName,
      avatar: avatarImage,
      country: nation.name,
      badge: `${hobby.type} Lover`
    };

    const tags: Tag[] = hobby.products
      .map(prodId => {
        const product = PRODUCT_CATALOG.find(p => p.id === prodId);
        if (!product) {
          console.warn(`Product with id "${prodId}" not found in catalog.`);
          return null;
        }
        return {
          id: `tag_${i}_${prodId}`,
          x: Math.random() * 80 + 10,
          y: Math.random() * 80 + 10,
          product: product
        };
      })
      .filter((tag): tag is Tag => tag !== null);

    const newPost: Post = {
      id: `post_persona_${i}`,
      author: author,
      title: `${hobby.desc} from ${nation.name}`,
      description: `Just enjoying my hobby with some delicious Korean food! Having ${tags.map(t => t.product.nameEn).join(', ')} makes it even better.`,
      imageUrl: feedImage,
      likes: Math.floor(Math.random() * 500) + 10,
      tags: tags,
    };

    generatedPosts.push(newPost);
  }

  return generatedPosts;
}

// Mock Posts (The Feed) = Curated Influencers + Generated Global Personas
export const MOCK_POSTS: Post[] = [...CURATED_POSTS, ...generateGlobalPersonaPosts()];
