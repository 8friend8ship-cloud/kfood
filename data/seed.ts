import { Post, Author, Tag } from '../types';
import { GHOST_AUTHORS, PRODUCT_CATALOG, ALL_PERSONAS } from '../constants';

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
  }
];

const languageContent: { [key: string]: { title: string, desc: string } } = {
    'USA': { title: "My K-BBQ setup is complete! 🥩🔥", desc: "Grilling some delicious Samgyeopsal this weekend. You can't beat this flavor!" },
    'Japan': { title: "今日の夕食はサムギョプサル！🥢", desc: "家で本格的な韓国BBQ。このグリルパンは最高です！" },
    'Brazil': { title: "Churrasco coreano em casa! 🇧🇷🇰🇷", desc: "Este grill é incrível para Samgyeopsal. Sabor autêntico!" },
    'France': { title: "Soirée BBQ coréen, un vrai régal !", desc: "Le Samgyeopsal grillé comme à Séoul. C'est magnifique !"},
    'Germany': { title: "Koreanisches BBQ-Abenteuer! 🇩🇪", desc: "Dieses Wochenende gibt es Samgyeopsal. Super lecker und einfach zuzubereiten."}
};

/**
 * [GENESIS SCRIPT V2]
 * Generates ~25 high-quality posts from the global persona pool to simulate an active community on first load.
 */
function generateInitialPersonaPosts(): Post[] {
  const generatedPosts: Post[] = [];

  // Use a subset of the global personas for initial content to keep it high-quality.
  const personasToPost = ALL_PERSONAS.filter(p => !GHOST_AUTHORS.some(g => g.id === p.id))
    .sort(() => 0.5 - Math.random()) // Shuffle
    .slice(0, 25); // Take 25 random personas

  for (const author of personasToPost) {
    const mainProduct = PRODUCT_CATALOG[Math.floor(Math.random() * PRODUCT_CATALOG.length)];
    
    // Select related products for tags
    const relatedProducts = PRODUCT_CATALOG.filter(p => p.category === mainProduct.category && p.id !== mainProduct.id);
    const otherProducts = relatedProducts.length > 1 
        ? [relatedProducts[0], relatedProducts[1]] 
        : [PRODUCT_CATALOG[0], PRODUCT_CATALOG[1]];

    const tags: Tag[] = [mainProduct, ...otherProducts].slice(0, 3).map((prod, i) => ({
      id: `tag_seed_${author.id}_${i}`,
      x: 30 + (i * 20) + (Math.random() * 10),
      y: 40 + (i * 15) + (Math.random() * 10),
      product: prod
    }));

    const localized = languageContent[author.country || 'USA'] || languageContent['USA'];

    const newPost: Post = {
      id: `post_persona_${author.id}`,
      author: author,
      title: localized.title.replace('K-BBQ', mainProduct.nameEn),
      description: localized.desc.replace('Samgyeopsal', mainProduct.nameEn),
      imageUrl: `https://source.unsplash.com/800x800/?${mainProduct.nameEn.split(' ')[0]},korean,food,${author.id}`,
      likes: Math.floor(Math.random() * 2000) + 100,
      createdAt: Date.now() - Math.floor(Math.random() * 86400000 * 3), // Within last 3 days
      tags: tags,
    };

    generatedPosts.push(newPost);
  }

  return generatedPosts;
}

export function generateInitialFeed(): Post[] {
    return [...CURATED_POSTS, ...generateInitialPersonaPosts()];
}