import { Product, Theme, Author } from './types';

// Collection: Themes
export const THEMES: Theme[] = [
  {
    id: 'all',
    title: 'All',
    icon: '🇰🇷',
    description: 'Everything K-Kitchen',
    keywords: [],
    gradient: 'from-gray-800 to-gray-900'
  },
  {
    id: 'theme_carbs_01',
    title: 'Rice & Noodles',
    icon: '🍚',
    description: 'The comforting foundation',
    keywords: ['Rice', 'Noodle', 'Ramen', 'Bibimbap', 'Japchae', 'Gimbap', 'Bokkeumbap'],
    gradient: 'from-yellow-500 to-orange-400'
  },
  {
    id: 'theme_stew_01',
    title: 'Soups & Stews',
    icon: '🥘',
    description: 'Rich, bubbling comfort',
    keywords: ['Pot', 'Ttukbaegi', 'Stew', 'Soup', 'Kimchi', 'Jjigae', 'Doenjang', 'Samgyetang'],
    gradient: 'from-emerald-600 to-teal-600'
  },
  {
    id: 'theme_main_01',
    title: 'Main Dishes',
    icon: '🥩',
    description: 'Grilled, braised & stir-fried',
    keywords: ['Grill', 'BBQ', 'Pork', 'Galbi', 'Bulgogi', 'Jeyuk', 'Bokkeum'],
    gradient: 'from-orange-500 to-amber-500'
  },
  {
    id: 'theme_street_01',
    title: 'Street Food',
    icon: '🍢',
    description: 'Trendy & quick bites',
    keywords: ['Tteokbokki', 'Hotteok', 'Pancake', 'Jeon', 'Snack', 'Gimbap'],
    gradient: 'from-pink-400 to-rose-400'
  },
  {
    id: 'theme_banchan_01',
    title: 'Side Dishes',
    icon: '🥬',
    description: 'The soul of a Korean meal',
    keywords: ['Banchan', 'Kimchi', 'Side Dish', 'Steamed Egg', 'Anchovy'],
    gradient: 'from-blue-500 to-indigo-500'
  },
  {
    id: 'theme_dessert_01',
    title: 'Dessert & Drinks',
    icon: '🍧',
    description: 'Sweet treats & sips',
    keywords: ['Dessert', 'Bingsu', 'Drink', 'Makgeolli', 'Soju', 'Milk'],
    gradient: 'from-purple-400 to-violet-500'
  }
];

// Helper to generate Amazon Search Link
export const amz = (keyword: string) => `https://amazon.com/s?k=${encodeURIComponent(keyword)}`;
export const coupang = (keyword: string) => `https://coupang.com/np/search?q=${encodeURIComponent(keyword)}`;

// GHOST PROTOCOL: Virtual Influencers (Personas)
export const GHOST_AUTHORS: Author[] = [
    { id: "user_mama_kim", name: "Mama Kim", title: "Home Cook Master", followers: 12500, avatar: "https://i.pravatar.cc/150?u=mama", country: "Korea", badge: "Authentic Master", timezone: "Asia/Seoul" },
    { id: "user_seoul_eats", name: "Seoul Eats", title: "K-Food Hunter", followers: 8900, avatar: "https://i.pravatar.cc/150?u=seoul", country: "Korea", badge: "Trend Setter", timezone: "Asia/Seoul" },
    { id: "user_chef_lee", name: "Chef Lee", title: "Professional Chef", followers: 45000, avatar: "https://i.pravatar.cc/150?u=chef", country: "USA", badge: "Gourmet Chef", timezone: "America/New_York" },
    { id: "user_spicy_girl", name: "Spicy Girl", title: "Mukbang Streamer", followers: 23200, avatar: "https://i.pravatar.cc/150?u=spicy", country: "Vietnam", badge: "Spicy Lover", timezone: "Asia/Ho_Chi_Minh" },
    { id: "user_camping_dad", name: "Camping Dad", title: "Outdoor Cooking", followers: 5600, avatar: "https://i.pravatar.cc/150?u=camp", country: "France", badge: "Wild Camping", timezone: "Europe/Paris" }
];

// [NEW] Generate a larger pool of personas for the scheduler
function generateGlobalPersonas(): Author[] {
  const generatedAuthors: Author[] = [];
  const nations = [
      { name: "USA", timezone: "America/New_York", names: ["Mike", "Sarah", "John", "Emily"], badge: "Food Vlogger" },
      { name: "UK", timezone: "Europe/London", names: ["Harry", "Olivia", "George", "Amelia"], badge: "Home Chef" },
      { name: "Canada", timezone: "America/Toronto", names: ["Liam", "Emma", "Noah", "Charlotte"], badge: "Outdoor Cook" },
      { name: "Australia", timezone: "Australia/Sydney", names: ["Oliver", "Mia", "Jack", "Isla"], badge: "Grill Master" },
      { name: "Japan", timezone: "Asia/Tokyo", names: ["Ken", "Yui", "Hiro", "Sakura"], badge: "Minimalist Eater" },
      { name: "Germany", timezone: "Europe/Berlin", names: ["Ben", "Hanna", "Paul", "Clara"], badge: "Recipe Explorer" },
      { name: "Brazil", timezone: "America/Sao_Paulo", names: ["Miguel", "Sophia", "Arthur", "Alice"], badge: "Fusion Foodie" },
      { name: "Mexico", timezone: "America/Mexico_City", names: ["Santiago", "Maria", "Mateo", "Camila"], badge: "Spicy Challenger" },
      { name: "India", timezone: "Asia/Kolkata", names: ["Aarav", "Saanvi", "Vivaan", "Diya"], badge: "Spice Expert" },
  ];

  let idCounter = 0;
  for (const nation of nations) {
      for (let i = 0; i < 10; i++) { // 10 personas per nation
          const name = `${nation.names[Math.floor(Math.random() * nation.names.length)]}${Math.floor(Math.random() * 900) + 100}`;
          generatedAuthors.push({
              id: `gen_user_${idCounter++}`,
              name: name,
              title: `${nation.name} K-Food Lover`,
              followers: Math.floor(Math.random() * 5000) + 200,
              avatar: `https://i.pravatar.cc/150?u=${name}`, // Still uses pravatar for seed, but will be replaced by AI avatar
              country: nation.name,
              badge: nation.badge,
              timezone: nation.timezone
          });
      }
  }
  return generatedAuthors;
}
export const ALL_PERSONAS: Author[] = [...GHOST_AUTHORS, ...generateGlobalPersonas()];


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
    id: 'ingredient_glass_noodle',
    nameEn: 'Korean Glass Noodles (Dangmyeon)',
    nameKr: '당면',
    searchKeyword: 'Korean Sweet Potato Starch Noodles Dangmyeon',
    description: 'Chewy and clear noodles made from sweet potato starch, essential for Japchae.',
    priceUsd: 8.99,
    priceKr: 5000,
    category: 'ingredient',
    links: { global: amz('Korean Glass Noodles'), kr: coupang('당면') },
    image: 'https://images.unsplash.com/photo-1597131728235-db14c2772a5a?auto=format&fit=crop&q=80&w=600'
  },
  
  
  // --- K-INGREDIENTS (Fresh & Basic) ---
  {
    id: 'ingredient_kimchi_napa',
    nameEn: 'Napa Cabbage Kimchi',
    nameKr: '배추김치',
    searchKeyword: 'Jongga Mat Kimchi Sliced Napa Cabbage Kimchi',
    description: 'The iconic, spicy fermented napa cabbage that is the heart of Korean cuisine.',
    priceUsd: 14.99,
    priceKr: 12000,
    category: 'ingredient',
    links: { global: amz('Napa Cabbage Kimchi'), kr: coupang('배추김치') },
    image: 'https://images.unsplash.com/photo-1583224996421-59b73b2246b3?auto=format&fit=crop&q=80&w=600'
  },
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
    id: 'ingredient_beef_short_rib',
    nameEn: 'Beef Short Ribs (for Jjim)',
    nameKr: '소갈비 (찜용)',
    searchKeyword: 'Bone-in Beef Short Ribs for Braising',
    description: 'Marbled, tender beef short ribs, perfect for slow-braising into luxurious Galbi-jjim.',
    priceUsd: 29.99,
    priceKr: 35000,
    category: 'ingredient',
    links: { global: amz('Beef Short Ribs'), kr: coupang('찜갈비') },
    image: 'https://images.unsplash.com/photo-1615934639350-d33555a6d532?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'ingredient_pork_belly',
    nameEn: 'Pork Belly Block (for Suyuk)',
    nameKr: '통삼겹살 (수육용)',
    searchKeyword: 'Pork Belly Slab for Roasting',
    description: 'A thick cut of pork belly, perfect for slow-boiling to create tender Suyuk.',
    priceUsd: 12.99,
    priceKr: 18000,
    category: 'ingredient',
    links: { global: amz('Pork Belly Slab'), kr: coupang('통삼겹살') },
    image: 'https://images.unsplash.com/photo-1615934639350-d33555a6d532?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'ingredient_chicken_whole',
    nameEn: 'Small Whole Chicken (for Samgyetang)',
    nameKr: '영계 (삼계탕용)',
    searchKeyword: 'Cornish Hen or Small Young Chicken',
    description: 'A small, tender chicken, ideal for stuffing with rice and ginseng for Samgyetang.',
    priceUsd: 9.99,
    priceKr: 8000,
    category: 'ingredient',
    links: { global: amz('Cornish Hen'), kr: coupang('삼계탕용 닭') },
    image: 'https://images.unsplash.com/photo-1606318288834-612d3b643da3?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'ingredient_ginseng',
    nameEn: 'Fresh Ginseng',
    nameKr: '수삼',
    searchKeyword: 'Fresh Korean Ginseng Root for Soup',
    description: 'An essential medicinal root that gives Samgyetang its unique, healthy flavor.',
    priceUsd: 19.99,
    priceKr: 15000,
    category: 'ingredient',
    links: { global: amz('Fresh Ginseng'), kr: coupang('수삼') },
    image: 'https://images.unsplash.com/photo-1598044991738-9cb93e25b340?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'ingredient_squid',
    nameEn: 'Fresh Squid (for Bokkeum)',
    nameKr: '생물 오징어',
    searchKeyword: 'Fresh Squid for Cooking Stir Fry',
    description: 'Tender and chewy squid, perfect for making the classic spicy Ojingeo-bokkeum.',
    priceUsd: 14.99,
    priceKr: 15000,
    category: 'ingredient',
    links: { global: amz('Fresh Squid'), kr: coupang('생물 오징어') },
    image: 'https://images.unsplash.com/photo-1599119293488-346762332f17?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'ingredient_dried_anchovy',
    nameEn: 'Dried Anchovies (for Banchan)',
    nameKr: '마른 멸치',
    searchKeyword: 'Dried Anchovies for Soup Stock and Side Dish',
    description: 'Small dried anchovies, perfect for making the sweet and savory side dish Myeolchi-bokkeum.',
    priceUsd: 11.99,
    priceKr: 9000,
    category: 'ingredient',
    links: { global: amz('Dried Anchovies'), kr: coupang('마른 멸치') },
    image: 'https://images.unsplash.com/photo-1574902120229-923c5304a115?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'ingredient_gimbap_seaweed',
    nameEn: 'Roasted Seaweed for Gimbap',
    nameKr: '김밥용 김',
    searchKeyword: 'Roasted Seaweed Sheets for Gimbap Nori',
    description: 'Large, durable sheets of roasted seaweed, specifically for making Korean Gimbap rolls.',
    priceUsd: 6.99,
    priceKr: 4000,
    category: 'ingredient',
    links: { global: amz('Gimbap Nori'), kr: coupang('김밥김') },
    image: 'https://images.unsplash.com/photo-1606923829571-0f26e64f38ad?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'ingredient_pickled_radish',
    nameEn: 'Yellow Pickled Radish (Danmuji)',
    nameKr: '단무지',
    searchKeyword: 'Whole Yellow Pickled Radish for Gimbap',
    description: 'Crispy, sweet, and tangy pickled radish that is an essential ingredient for Gimbap.',
    priceUsd: 7.99,
    priceKr: 3500,
    category: 'ingredient',
    links: { global: amz('Danmuji'), kr: coupang('단무지') },
    image: 'https://plus.unsplash.com/premium_photo-1664648005643-9ada27e76e5d?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'ingredient_red_bean_sweet',
    nameEn: 'Sweetened Red Bean Paste',
    nameKr: '단팥',
    searchKeyword: 'Canned Sweetened Red Bean Paste Adzuki',
    description: 'Sweet, smooth red bean paste, the classic topping for Korean shaved ice (Bingsu).',
    priceUsd: 5.99,
    priceKr: 3000,
    category: 'ingredient',
    links: { global: amz('Sweet Red Bean Paste'), kr: coupang('단팥') },
    image: 'https://images.unsplash.com/photo-1592314224733-529a5a78f219?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'ingredient_garlic_minced',
    nameEn: 'Minced Garlic',
    nameKr: '다진 마늘',
    searchKeyword: 'Minced Garlic in Water Jar',
    description: 'The absolute soul of Korean cooking. Adds a pungent, aromatic flavor essential for nearly every dish.',
    priceUsd: 6.99,
    priceKr: 4000,
    category: 'ingredient',
    links: { global: amz('Minced Garlic'), kr: coupang('다진마늘') },
    image: 'https://images.unsplash.com/photo-1618371302138-34a621e7a55d?auto=format&fit=crop&q=80&w=600'
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
    id: 'tool_bingsu_machine',
    nameEn: 'Electric Snow Ice Shaver',
    nameKr: '빙수기',
    searchKeyword: 'Electric Ice Shaver Machine for Bingsu',
    description: 'Creates fluffy, snow-like ice, essential for authentic Korean Bingsu.',
    priceUsd: 49.99,
    priceKr: 45000,
    category: 'tool',
    links: { global: amz('Electric Ice Shaver'), kr: coupang('빙수기') },
    image: 'https://images.unsplash.com/photo-1567197992794-d1a1052431ba?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'tool_scissors',
    nameEn: 'Korean BBQ Meat Scissors',
    nameKr: '고기 가위',
    searchKeyword: 'Heavy Duty Kitchen Shears for Meat',
    description: 'The authentic way to cut grilled meat and kimchi right at the table. A must-have for K-BBQ.',
    priceUsd: 12.99,
    priceKr: 9900,
    category: 'tool',
    links: { global: amz('Korean BBQ Scissors'), kr: coupang('고기 가위') },
    image: 'https://images.unsplash.com/photo-1559519448-644a4b4b2c14?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'tool_rice_bowl',
    nameEn: 'Korean Rice Bowl with Lid',
    nameKr: '밥그릇',
    searchKeyword: 'Korean Stainless Steel Rice Bowl with Lid',
    description: 'The traditional stainless steel bowl that keeps your rice warm throughout the meal.',
    priceUsd: 11.99,
    priceKr: 6000,
    category: 'tableware',
    links: { global: amz('Korean Rice Bowl'), kr: coupang('밥공기') },
    image: 'https://images.unsplash.com/photo-1596664959098-76a6e2971a8f?auto=format&fit=crop&q=80&w=600'
  },
  
  // --- K-DRINKS ---
  {
    id: 'drink_makgeolli',
    nameEn: 'Makgeolli (Korean Rice Wine)',
    nameKr: '막걸리',
    searchKeyword: 'Kooksoondang Makgeolli Korean Rice Wine',
    description: 'Unfiltered, milky, and slightly sweet Korean rice wine. Best served chilled.',
    priceUsd: 9.99,
    priceKr: 3000,
    category: 'drink',
    links: { global: amz('Makgeolli'), kr: coupang('막걸리') },
    image: 'https://images.unsplash.com/photo-1616259024097-47b853545b73?auto=format&fit=crop&q=80&w=600'
  },
   {
    id: 'snack_banana',
    nameEn: 'Banana Flavored Milk',
    nameKr: '바나나맛 우유',
    searchKeyword: 'Binggrae Banana Flavored Milk Drink',
    description: 'The iconic, sweet and creamy banana milk beloved by all ages in Korea. Perfect for cooling down after a spicy meal.',
    priceUsd: 8.99, // for a 6-pack
    priceKr: 5500,
    category: 'drink',
    links: { global: amz('Binggrae Banana Milk'), kr: coupang('바나나맛 우유') },
    image: 'https://images.unsplash.com/photo-1626078446243-7f3676a642e5?auto=format&fit=crop&q=80&w=600'
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
    id: 'sauce_doenjang',
    nameEn: 'Doenjang (Soybean Paste)',
    nameKr: '된장',
    searchKeyword: 'Doenjang Korean Fermented Soybean Paste',
    description: 'A rich, savory, and salty fermented soybean paste, essential for Doenjang-jjigae.',
    priceUsd: 9.99,
    priceKr: 6000,
    category: 'sauce',
    links: { global: amz('Doenjang'), kr: coupang('된장') },
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=600'
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
    nameEn: 'Black Pepper (Ground)',
    nameKr: '후추',
    searchKeyword: 'Coarsely Ground Black Pepper',
    description: 'A pinch of black pepper is often used to season meat and soups, providing a final touch of flavor.',
    priceUsd: 5.50,
    priceKr: 3500,
    category: 'sauce',
    links: { global: amz('Black Pepper'), kr: coupang('후추') },
    image: 'https://images.unsplash.com/photo-1599996088339-e349a187a8b6?auto=format&fit=crop&q=80&w=600'
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