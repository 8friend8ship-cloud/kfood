import { DetectedItem, Tag } from '../types';
import { PRODUCT_CATALOG } from '../constants';

// This centralized function takes AI vision analysis results and converts them
// into shoppable tags, including a monetization-focused catalog matching step.
export function createTagsFromAnalysis(items: DetectedItem[]): Tag[] {
  return items.map((item, index) => {
    let x = 50;
    let y = 50;

    // Calculate center position from bounding box [ymin, xmin, ymax, xmax]
    if (item.boundingBox && item.boundingBox.length === 4) {
      const [ymin, xmin, ymax, xmax] = item.boundingBox;
      y = Math.max(0, Math.min(100, (ymin + ymax) / 2));
      x = Math.max(0, Math.min(100, (xmin + xmax) / 2));
    } else {
      // Fallback: Distribute slightly if no bbox
      x = 30 + (Math.random() * 40);
      y = 30 + (Math.random() * 40);
    }

    // CATALOG MATCHING LOGIC (The Monetization Engine)
    const detectedNameLower = item.name.toLowerCase();
    const detectedKeywordsLower = (item.searchKeyword || '').toLowerCase();

    const matchedCatalogItem = PRODUCT_CATALOG.find(p => {
      const catName = p.nameEn.toLowerCase();
      const nameMatch = detectedNameLower.includes(catName) || catName.includes(detectedNameLower);
      const keywordMatch = p.nameEn.toLowerCase().split(' ').some(w => detectedKeywordsLower.includes(w) && w.length > 3);
      return nameMatch || keywordMatch;
    });

    if (matchedCatalogItem) {
      // Use the curated catalog data (with affiliate links)
      return {
        id: `tag-match-${Date.now()}-${index}`,
        x,
        y,
        product: matchedCatalogItem,
      };
    }

    // If no match, use AI generated data (Generic Search Link)
    const searchTerm = item.searchKeyword || item.name;
    return {
      id: `tag-gen-${Date.now()}-${index}`,
      x,
      y,
      product: {
        id: `prod-gen-${Date.now()}-${index}`,
        nameEn: item.name,
        nameKr: item.koreanName || item.name,
        searchKeyword: searchTerm,
        description: item.description,
        priceUsd: 25.00 + (index * 5),
        priceKr: 29000 + (index * 5000),
        category: item.suggestedCategory,
        links: {
          global: `https://amazon.com/s?k=${encodeURIComponent(searchTerm)}`,
          kr: `https://coupang.com/np/search?q=${encodeURIComponent(item.koreanName || item.name)}`
        },
        image: '' // This will trigger fallback
      }
    };
  });
}