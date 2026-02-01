// This service simulates a backend cron job for generating posts from personas.
import { Author, Post, Product, Tag, RecipeEssential } from '../types';
import { generatePersonaImage, analyzeKitchenImage, generatePostContent, generateRecipeEssentials, getLocalizedIngredient } from './geminiService';
import { PRODUCT_CATALOG } from '../constants';
import { getSoundForProduct } from '../data/soundLibrary';
import { getAvatar } from './avatarService';
import { createTagsFromAnalysis } from '../utils/tagUtils';

// --- CONFIGURATION ---
const SCHEDULER_INTERVAL_MS = 15000; // [DEMO] Run every 15 seconds
const MEAL_TIMES = [8, 12, 19]; // 8 AM, 12 PM, 7 PM
const POST_CHANCE_MEAL = 1.0; // [DEMO] Guaranteed post at meal times
const POST_CHANCE_AWAKE = 0.9; // [DEMO] Very high chance for frequent posts
const CINEMAGRAPH_CHANCE = 0.5; // 50% of generated posts will try to be a cinemagraph


// --- [UPGRADE] K-FOOD HACK DATABASE ---
const K_FOOD_HACKS: { [key: string]: string[] } = {
  "Shin Ramyun (The Legend)": ["with a scoop of peanut butter and bean sprouts", "with a splash of tomato juice for a tangy kick", "cooked in milk with melted American cheese"],
  "Tteokbokki Kit": ["ingredients wrapped in sizzling bacon strips", "in a creamy rosé sauce", "pressed in a waffle iron until crispy (Garaetteok Gui)"],
  "Buldak Fire Noodle (Original)": ["with melted mozzarella and sweet corn", "crushed and used as a spicy topping for fried chicken", "mixed with carbonara sauce for a creamy burn"],
  "Chapagetti (Black Bean)": ["topped with a fried egg and truffle oil", "mixed with Neoguri to make Jjapaguri", "served with a side of grilled steak"],
  "Gochujang (Red Paste)": ["mixed with mayo for a spicy dip for fries", "as a glaze for baked salmon", "whisked into a salad dressing with sesame oil"],
};

// [NEW] A wide variety of settings to make posts more dynamic and interesting.
const VARIETY_SETTINGS = [
  // Indoor
  'in a cozy, modern kitchen with soft lighting',
  'at a bustling Korean convenience store counter, surrounded by snacks',
  'late at night in a study room with a single desk lamp, perfect for a midnight snack',
  'in a minimalist, sun-drenched apartment with large windows',
  
  // Outdoor & Nature
  'at a scenic campsite with a tent and forest in the background',
  'on a fishing boat with the vast ocean behind',
  'at a snowy ski resort lodge, looking out at the Alps',
  'during a hiking break on a mountain trail with a beautiful vista',
  'having a picnic in a sunny park on a checkered blanket',
  'on a beautiful balcony overlooking a city skyline at sunset',
  'at a vibrant, crowded night market with colorful lights',
  'on a quiet beach with waves gently lapping the shore',
  'in a lush green garden during a beautiful afternoon',
];


// --- [NEW] AI MEAL SCENARIO ENGINE ---
// This engine introduces variety and thematic consistency to AI-generated posts.
interface MealScenario {
  name: string;
  primaryProductFilter: (p: Product) => boolean;
  secondaryProductFilter: (p: Product, primary: Product) => boolean;
  secondaryProductCount: number;
  imagePrompt: (products: Product[], author: Author) => { food: string; setting: string };
  imageStyle: 'person' | 'food_only'; // [NEW] Control image content
  isRecipe: boolean;
  generatesEssentials: boolean; // [NEW] Flag to trigger recipe analysis
}

const MEAL_SCENARIOS: MealScenario[] = [
  // --- CATEGORY 1: Rice & Noodles ---
  {
    name: "Vibrant Bibimbap Bowl",
    primaryProductFilter: p => p.id === 'tool_rice_bowl' || p.id === 'sauce_gochujang',
    secondaryProductFilter: (p, primary) => p.id === 'ingredient_egg_01' || p.id === 'sauce_sesame' || p.nameEn.toLowerCase().includes('beef'),
    secondaryProductCount: 2,
    imagePrompt: (products, author) => ({
        food: "a vibrant and colorful bowl of Bibimbap, artistically arranged with assorted seasoned vegetables, bulgogi beef, a sunny-side-up egg, and a dollop of gochujang",
        setting: "in a bright, clean setting with natural light, emphasizing the freshness of the ingredients. Served in a wide ceramic bowl, not a stone pot."
    }),
    imageStyle: 'food_only',
    isRecipe: true,
    generatesEssentials: true,
  },
  {
      name: "Classic Japchae (Glass Noodles)",
      primaryProductFilter: p => p.id === 'ingredient_glass_noodle',
      secondaryProductFilter: (p, primary) => p.nameEn.toLowerCase().includes('beef') || p.id === 'sauce_soup_soy',
      secondaryProductCount: 2,
      imagePrompt: (products, author) => ({
          food: "a glossy and colorful plate of Japchae, with stir-fried glass noodles, marinated beef, and a variety of vegetables like spinach, carrots, and mushrooms",
          setting: "as a festive dish for a celebration, served on a large white platter to highlight the colors."
      }),
      imageStyle: 'person',
      isRecipe: true,
      generatesEssentials: true,
  },
  {
      name: "Sizzling Kimchi Fried Rice",
      primaryProductFilter: p => p.id === 'ingredient_kimchi_napa',
      secondaryProductFilter: (p, primary) => p.id === 'ingredient_egg_01' || p.id === 'ingredient_pork_belly',
      secondaryProductCount: 2,
      imagePrompt: (products, author) => ({
          food: "a delicious mound of Kimchi Fried Rice (Kimchi-bokkeumbap) topped with a perfectly fried sunny-side-up egg and garnished with seaweed flakes",
          setting: "being served straight from a hot, wide pan or skillet, with steam rising."
      }),
      imageStyle: 'person',
      isRecipe: true,
      generatesEssentials: true,
  },
  // --- CATEGORY 2: Soups & Stews ---
  {
    name: "Hearty Kimchi Jjigae",
    primaryProductFilter: p => p.id === 'ingredient_kimchi_napa',
    secondaryProductFilter: (p, primary) => p.id === 'tool_ttukbaegi_01' || p.id === 'ingredient_pork_belly',
    secondaryProductCount: 2,
    imagePrompt: (products, author) => ({
      food: `a bubbling and vibrant red Kimchi Jjigae with chunks of pork belly and tofu`,
      setting: 'served in a classic Ttukbaegi (earthenware pot) on a wooden trivet, perfect for a cozy meal.'
    }),
    imageStyle: 'food_only',
    isRecipe: true,
    generatesEssentials: true,
  },
  {
    name: "Savory Doenjang Jjigae",
    primaryProductFilter: p => p.id === 'sauce_doenjang',
    secondaryProductFilter: (p, primary) => p.id === 'tool_ttukbaegi_01' || p.nameEn.toLowerCase().includes('beef'),
    secondaryProductCount: 2,
    imagePrompt: (products, author) => ({
      food: `a bubbling, savory Doenjang-jjigae (fermented soybean paste stew) filled with tofu, zucchini, and mushrooms`,
      setting: 'served in a classic Ttukbaegi (earthenware pot), showcasing its rustic, comforting appeal.'
    }),
    imageStyle: 'food_only',
    isRecipe: true,
    generatesEssentials: true,
  },
  {
    name: "Nourishing Samgyetang (Ginseng Chicken Soup)",
    primaryProductFilter: p => p.id === 'ingredient_chicken_whole',
    secondaryProductFilter: (p, primary) => p.id === 'ingredient_ginseng',
    secondaryProductCount: 1,
    imagePrompt: (products, author) => ({
      food: `a whole small chicken in a clear, steaming broth, stuffed with glutinous rice and ginseng (Samgyetang)`,
      setting: 'served elegantly in a large, deep ceramic bowl, garnished with freshly chopped scallions.'
    }),
    imageStyle: 'person',
    isRecipe: true,
    generatesEssentials: true,
  },
  // --- CATEGORY 3: Main Dishes (Grilled/Braised) ---
  {
    name: "Classic Bulgogi Feast",
    primaryProductFilter: p => p.nameEn.toLowerCase().includes('beef brisket'),
    secondaryProductFilter: (p, primary) => p.id === 'tool_bbq_grill_01' || p.id === 'veg_green_onion',
    secondaryProductCount: 2,
    imagePrompt: (products, author) => ({
        food: "sizzling Korean Bulgogi, with thinly sliced marinated beef, onions, and mushrooms",
        setting: "being cooked on a tabletop grill or a cast-iron plate, as the centerpiece of a delicious family dinner."
    }),
    imageStyle: 'person',
    isRecipe: true,
    generatesEssentials: true,
  },
  {
    name: "Royal Braised Short Ribs (Galbi-jjim)",
    primaryProductFilter: p => p.id === 'ingredient_beef_short_rib',
    secondaryProductFilter: (p, primary) => p.id === 'sauce_soup_soy' || p.id === 'veg_green_onion',
    secondaryProductCount: 2,
    imagePrompt: (products, author) => ({
        food: "a glistening pot of Galbi-jjim (Korean braised short ribs) with tender beef, carrots, and chestnuts in a rich, dark sauce",
        setting: "served in a modern, wide stainless steel pot or a large ceramic bowl, ready for a family feast."
    }),
    imageStyle: 'food_only',
    isRecipe: true,
    generatesEssentials: true,
  },
  {
    name: "Spicy Pork Stir-fry (Jeyuk-bokkeum)",
    primaryProductFilter: p => p.id === 'ingredient_pork_belly',
    secondaryProductFilter: (p, primary) => p.id === 'sauce_gochujang',
    secondaryProductCount: 1,
    imagePrompt: (products, author) => ({
        food: `a sizzling plate of Jeyuk-bokkeum (spicy pork stir-fry), coated in a rich, red gochujang sauce with onions and green onions`,
        setting: "being served on a hot cast-iron plate with steam rising dramatically."
    }),
    imageStyle: 'person',
    isRecipe: true,
    generatesEssentials: true,
  },
  // --- CATEGORY 4: Street Food & Snacks ---
  {
    name: "Street Style Tteokbokki",
    primaryProductFilter: p => p.id === 'kit_tteokbokki',
    secondaryProductFilter: (p, primary) => p.id === 'ingredient_egg_01',
    secondaryProductCount: 1,
    imagePrompt: (products, author) => ({
      food: `a vibrant plate of spicy Tteokbokki with chewy rice cakes, fish cakes, and a hard-boiled egg in a glossy red sauce`,
      setting: 'served in a casual bowl, just like at a street food stall in Seoul.'
    }),
    imageStyle: 'person',
    isRecipe: true,
    generatesEssentials: true,
  },
  {
    name: "Savory Seafood Pancake (Haemul Pajeon)",
    primaryProductFilter: p => p.id === 'veg_green_onion',
    secondaryProductFilter: (p, primary) => p.id === 'ingredient_squid',
    secondaryProductCount: 1,
    imagePrompt: (products, author) => ({
        food: "a large, crispy golden-brown Haemul Pajeon (seafood scallion pancake), filled with squid and green onions, served with a soy vinegar dipping sauce",
        setting: "on a large bamboo plate or simple ceramic platter. On a rainy day, with a traditional makgeolli kettle nearby, creating a cozy atmosphere."
    }),
    imageStyle: 'person',
    isRecipe: true,
    generatesEssentials: false,
  },
  {
    name: "Classic Gimbap Rolls",
    primaryProductFilter: p => p.id === 'ingredient_gimbap_seaweed',
    secondaryProductFilter: (p, primary) => p.id === 'ingredient_pickled_radish',
    secondaryProductCount: 1,
    imagePrompt: (products, author) => ({
        food: "perfectly sliced Gimbap rolls, showing the colorful cross-section of rice, yellow pickled radish, spinach, carrots, and beef",
        setting: "neatly arranged on a wooden board, ready for a picnic."
    }),
    imageStyle: 'food_only',
    isRecipe: true,
    generatesEssentials: true,
  },
  // --- CATEGORY 5: Side Dishes & Kimchi ---
  {
    name: "Fluffy Steamed Egg (Gyeran-jjim)",
    primaryProductFilter: p => p.id === 'ingredient_egg_01',
    secondaryProductFilter: (p, primary) => p.id === 'tool_ttukbaegi_01',
    secondaryProductCount: 1,
    imagePrompt: (products, author) => ({
        food: "a fluffy, pillowy cloud of Gyeran-jjim (Korean steamed egg) overflowing from a small earthenware pot (Ttukbaegi)",
        setting: "garnished with chopped scallions, served as a comforting side dish."
    }),
    imageStyle: 'food_only',
    isRecipe: true,
    generatesEssentials: false,
  },
  {
    name: "A Perfect Plate of Kimchi",
    primaryProductFilter: p => p.id === 'ingredient_kimchi_napa',
    secondaryProductFilter: (p, primary) => false,
    secondaryProductCount: 0,
    imagePrompt: (products, author) => ({
        food: "beautifully sliced, vibrant red Napa Cabbage Kimchi",
        setting: "arranged neatly on a small, clean ceramic plate, highlighting its freshness and texture. CRITICAL: This is a cold side dish. Do NOT show it in a Ttukbaegi (stone pot), boiling, or steaming. The setting should be simple and clean."
    }),
    imageStyle: 'food_only',
    isRecipe: false,
    generatesEssentials: false,
  },
  {
    name: "A Spread of Banchan (Side Dishes)",
    primaryProductFilter: p => p.id === 'ingredient_kimchi_napa',
    secondaryProductFilter: (p, primary) => p.id === 'ingredient_dried_anchovy',
    secondaryProductCount: 1,
    imagePrompt: (products, author) => ({
        food: "an assortment of Korean side dishes (Banchan), including Kimchi, stir-fried anchovies (Myeolchi-bokkeum), and seasoned spinach",
        setting: "served in small, individual bowls as part of a larger Korean meal (Hanjeongsik)."
    }),
    imageStyle: 'person',
    isRecipe: false,
    generatesEssentials: false,
  },
  // --- CATEGORY 6: Dessert & Drinks ---
  {
    name: "Refreshing Bingsu (Shaved Ice)",
    primaryProductFilter: p => p.id === 'tool_bingsu_machine',
    secondaryProductFilter: (p, primary) => p.id === 'ingredient_red_bean_sweet',
    secondaryProductCount: 1,
    imagePrompt: (products, author) => ({
        food: "a mountain of fluffy, snow-like shaved ice (Bingsu), topped with sweet red bean paste, rice cakes, and condensed milk",
        setting: "served in a large glass bowl, looking incredibly cool and refreshing on a summer day."
    }),
    imageStyle: 'person',
    isRecipe: true,
    generatesEssentials: false,
  },
  {
    name: "Sweet & Crispy Hotteok",
    primaryProductFilter: p => p.id === 'kit_hotteok',
    secondaryProductFilter: (p, primary) => false,
    secondaryProductCount: 0,
    imagePrompt: (products, author) => ({
        food: "a golden-brown, crispy Hotteok (sweet Korean pancake) with a gooey brown sugar and nut filling oozing out",
        setting: "being flipped on a griddle or held in hand, fresh from a street food stall."
    }),
    imageStyle: 'person',
    isRecipe: false,
    generatesEssentials: false,
  },
  {
    name: "Relaxing with Makgeolli",
    primaryProductFilter: p => p.id === 'drink_makgeolli',
    secondaryProductFilter: (p, primary) => p.nameEn.toLowerCase().includes('pancake'),
    secondaryProductCount: 1,
    imagePrompt: (products, author) => ({
        food: "cloudy, milky Makgeolli (Korean rice wine) being poured from a golden kettle into traditional shallow bowls",
        setting: "alongside a savory Korean pancake (Pajeon), creating a perfect pairing."
    }),
    imageStyle: 'person',
    isRecipe: false,
    generatesEssentials: false,
  },
  // --- Fallback & Simple Scenarios ---
  {
    name: "Quick & Easy Ramyun Adventure",
    primaryProductFilter: p => (p.nameEn.toLowerCase().includes('ramen') || p.nameEn.toLowerCase().includes('noodle')),
    secondaryProductFilter: (p, primary) => p.id === 'tool_gold_pot' || p.id === 'ingredient_egg_01',
    secondaryProductCount: 2,
    imagePrompt: (products, author) => ({
      food: `a delicious bowl of ${products[0].nameEn} topped with a fresh egg`,
      setting: `in the iconic golden ramen pot, ${getRandom(VARIETY_SETTINGS)}`
    }),
    imageStyle: 'person',
    isRecipe: false,
    generatesEssentials: true,
  },
];

// --- HELPER FUNCTIONS ---

function getLocalHourForTimezone(timezone: string): number {
  try {
    const timeString = new Date().toLocaleTimeString('en-US', { timeZone: timezone, hour: '2-digit', hour12: false });
    const hour = parseInt(timeString.split(':')[0]);
    return hour === 24 ? 0 : hour;
  } catch (error) {
    console.warn(`Invalid timezone "${timezone}", defaulting to 12.`);
    return 12;
  }
}

const getRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// --- CORE SCHEDULER LOGIC ---

export async function runSchedulerTick(
  getAuthors: () => Author[],
  onNewPost: (post: Post) => void,
  getRecentlyPosted: () => string[]
) {
  const authors = getAuthors();
  const recentlyPostedAuthorIds = getRecentlyPosted();

  console.log(`🌍 [GENERATE] Manual generation triggered for 1 post...`);
  
  const recentSet = new Set(recentlyPostedAuthorIds);
  const nonRecentAuthors = authors.filter(a => !recentSet.has(a.id));
  const authorToPost = nonRecentAuthors.length > 0 ? getRandom(nonRecentAuthors) : getRandom(authors);

  try {
    // --- Step 1: Select a Meal Scenario ---
    const scenario = getRandom(MEAL_SCENARIOS);
    console.log(`🍲 [SCENARIO BOT] ${authorToPost.name} is creating a "${scenario.name}" post...`);

    const possiblePrimaryProducts = PRODUCT_CATALOG.filter(scenario.primaryProductFilter);
    if (possiblePrimaryProducts.length === 0) {
      console.warn(`[SCENARIO BOT] No primary products found for scenario "${scenario.name}". Skipping.`);
      return;
    }
    const primaryProduct = getRandom(possiblePrimaryProducts);
    
    const secondaryProducts = PRODUCT_CATALOG
        .filter(p => scenario.secondaryProductFilter(p, primaryProduct))
        .sort(() => 0.5 - Math.random())
        .slice(0, scenario.secondaryProductCount);
        
    const allProductsForPrompt = [primaryProduct, ...secondaryProducts];
    const { food: imagePromptFood, setting: imagePromptSetting } = scenario.imagePrompt(allProductsForPrompt, authorToPost);

    // --- Step 2: Generate the image based on the scenario prompt & style ---
    const avatarBase64 = await getAvatar(authorToPost);
    console.log(`🎨 [PROMPT] Generating a '${scenario.imageStyle}' image for ${authorToPost.name}...`);
    const base64Image = await generatePersonaImage(avatarBase64, imagePromptFood, imagePromptSetting, scenario.imageStyle);

    // --- Step 3: Use "Guided Vision" to get accurate tags ---
    console.log(`🎯 [GUIDED VISION] Locating ${allProductsForPrompt.length} specific items and the main dish...`);
    let initialTags: Tag[] = [];
    try {
      // Forcing the analysis to look for the exact products in the prompt improves accuracy.
      const detectedItems = await analyzeKitchenImage(base64Image, allProductsForPrompt);
      if (detectedItems.length > 0) {
        initialTags = createTagsFromAnalysis(detectedItems);
        console.log(`✅ [VISION] Successfully located ${initialTags.length} items.`);
      } else {
        console.warn(`[VISION] Guided analysis couldn't locate any items. The post will have no tags.`);
      }
    } catch (analysisError) {
      console.error(`🔴 [VISION] Guided analysis failed.`, analysisError);
    }

    // --- [NEW] Step 3.1: Localize Ingredients for International Personas ---
    let finalTags = initialTags;
    if (authorToPost.country !== 'Korea') {
      console.log(`🌍 [LOCALIZE BOT] Checking for ingredients to localize for ${authorToPost.name} in ${authorToPost.country}...`);
      
      const localizationPromises = initialTags.map(async (tag) => {
        const localizedData = await getLocalizedIngredient(tag.product, authorToPost);
        if (localizedData) {
          console.log(`✅ [LOCALIZE BOT] Localized "${tag.product.nameEn}" to "${localizedData.localizedName}"`);
          // Create a new product object with overridden values to avoid mutating the original catalog
          const localizedProduct = {
            ...tag.product,
            nameEn: localizedData.localizedName,
            description: localizedData.localizedDescription,
          };
          // Return a new tag object with the localized product
          return { ...tag, product: localizedProduct };
        }
        // If no localization, return the original tag
        return tag;
      });
      
      finalTags = await Promise.all(localizationPromises);
    }

    // --- Step 3.5: If flagged, generate "Secret Recipe Essentials" ---
    let recipeEssentials: RecipeEssential[] | undefined;
    if (scenario.generatesEssentials) {
      // Use the scenario name as a more accurate dish name for analysis
      console.log(`🌿 [RECIPE BOT] Inferring hidden ingredients for ${scenario.name}...`);
      try {
        recipeEssentials = await generateRecipeEssentials(base64Image, scenario.name);
        console.log(`✅ [RECIPE BOT] Found ${recipeEssentials.length} hidden essentials.`);
      } catch (essentialsError) {
        console.error(`🔴 [RECIPE BOT] Failed to generate essentials.`, essentialsError);
      }
    }
    
    // --- Step 4: Generate localized content for the post ---
    console.log(`✍️ [CONTENT BOT] Generating post in ${authorToPost.country}'s language...`);
    const { title, description } = await generatePostContent(authorToPost, primaryProduct, scenario.isRecipe, imagePromptFood);

    // --- Step 5: Assemble and dispatch the final post object ---
    const { audioUrl, effect } = getSoundForProduct(primaryProduct);
    const isCinemagraph = Math.random() < CINEMAGRAPH_CHANCE && !!(audioUrl && effect) && scenario.imageStyle === 'person';

    const newPost: Post = {
      id: `post-live-${Date.now()}`,
      author: authorToPost,
      title,
      description,
      imageUrl: `data:image/png;base64,${base64Image}`,
      likes: Math.floor(Math.random() * 800) + (scenario.isRecipe ? 200 : 50),
      difficulty: scenario.isRecipe ? 'Medium' : 'Easy',
      createdAt: Date.now(),
      isRecipe: scenario.isRecipe,
      tags: finalTags,
      recipeEssentials, // Add the generated essentials
      isCinemagraph,
      audioUrl: isCinemagraph ? audioUrl : undefined,
      cinemagraphEffect: isCinemagraph ? 'steam' : undefined,
    };
    
    onNewPost(newPost);
    console.log(`✅ [POSTED] New content by ${authorToPost.name} was successful! (${finalTags.length} tags, ${recipeEssentials?.length || 0} essentials, ${isCinemagraph ? 'ASMR' : 'Static'})`);

  } catch (error: any) {
    console.error(`🔴 [SCHEDULER HALT] Failed to generate post for ${authorToPost.name}. Error:`, error.message);
    throw error; // Re-throw the error to be caught by the manual trigger
  }
}


// --- INITIALIZATION ---
let intervalId: number | null = null;

// The automatic scheduler is no longer used, but the function is kept for potential future use.
export function initScheduler(
  getAuthors: () => Author[],
  onNewPost: (post: Post) => void,
  setIsLive: (isLive: boolean) => void,
  getRecentlyPosted: () => string[]
): () => void {
  if (intervalId) clearInterval(intervalId);
  
  const tick = () => {
    // This is now only called manually, not by an interval.
    // The automatic part is disabled.
  };
  
  // No longer setting an interval.
  // intervalId = window.setInterval(tick, SCHEDULER_INTERVAL_MS);
  setIsLive(false);
  
  return () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
      setIsLive(false);
      console.log("Scheduler stopped.");
    }
  };
}