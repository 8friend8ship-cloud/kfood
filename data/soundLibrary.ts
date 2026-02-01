import { Product } from '../types';

interface SoundEffect {
  audioUrl: string;
  effect: 'steam'; // Can be expanded later
}

// Pre-selected, high-quality, free-to-use sounds
const SOUND_LIBRARY: { [key: string]: SoundEffect } = {
  sizzle: {
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c8a73467.mp3',
    effect: 'steam',
  },
  boiling: {
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_2238463092.mp3',
    effect: 'steam',
  },
  slurp: {
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/02/07/audio_c0c88953d6.mp3',
    effect: 'steam',
  }
};

const MAPPING: { keywords: string[], sound: keyof typeof SOUND_LIBRARY }[] = [
  { keywords: ['bbq', 'grill', 'pork', 'meat', 'sot-ddu-keong', 'samgyeopsal'], sound: 'sizzle' },
  { keywords: ['stew', 'soup', 'jjigae', 'ttukbaegi', 'pot', 'boiling'], sound: 'boiling' },
  { keywords: ['ramen', 'noodle', 'ramyun', 'buldak', 'shin'], sound: 'slurp' }
];

export function getSoundForProduct(product: Product): Partial<SoundEffect> {
  const productName = product.nameEn.toLowerCase();
  const searchTerms = `${productName} ${product.category} ${product.productTags?.join(' ') || ''}`;

  for (const map of MAPPING) {
    for (const keyword of map.keywords) {
      if (searchTerms.includes(keyword)) {
        return SOUND_LIBRARY[map.sound];
      }
    }
  }

  return {}; // No sound found
}