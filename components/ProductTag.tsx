import React from 'react';
import { Plus, ChevronRight, ShoppingCart, Youtube, Instagram, Clapperboard } from 'lucide-react';
import { Tag, Region } from '../types';

interface ProductTagProps {
  tag: Tag;
  region: Region;
  isOpen: boolean;
  onToggle: (tagId: string) => void;
}

export const ProductTag: React.FC<ProductTagProps> = ({ tag, region, isOpen, onToggle }) => {
  // Region-specific logic
  const isKr = region === Region.KR;
  const purchaseLink = isKr ? tag.product.links.kr : tag.product.links.global;
  const marketName = isKr ? "Coupang" : "Amazon";
  const priceDisplay = isKr 
    ? `₩${tag.product.priceKr.toLocaleString()}` 
    : `$${tag.product.priceUsd.toFixed(2)}`;

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // Dynamic fallback based on product name
    const keyword = tag.product.nameEn.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '');
    e.currentTarget.src = `https://source.unsplash.com/100x100/?${keyword},korean,food`;
  };

  // Social Media Link Generation
  const getSocialLinks = () => {
    const searchKeyword = tag.product.nameEn.replace(/ /g, '+');
    const hashtag = tag.product.nameEn.replace(/[^a-zA-Z0-9]/g, '');

    return {
      youtube: tag.product.bestVideoUrl 
        ? tag.product.bestVideoUrl 
        : `https://www.youtube.com/results?search_query=${searchKeyword}+Mukbang`,
      instagram: `https://www.instagram.com/explore/tags/${hashtag}/`,
      tiktok: `https://www.tiktok.com/tag/${hashtag}`
    };
  };

  const social = getSocialLinks();

  return (
    <div
      className="absolute"
      style={{ left: `${tag.x}%`, top: `${tag.y}%`, zIndex: isOpen ? 50 : 10 }}
    >
      <div className="relative">
        {/* The Dot (+) */}
        <button
          onClick={() => onToggle(tag.id)}
          className={`group relative flex items-center justify-center w-8 h-8 -ml-4 -mt-4 bg-orange-600 bg-opacity-90 rounded-full shadow-lg text-white transition-transform duration-200 z-10 hover:scale-110 ${isOpen ? 'rotate-45' : 'tag-pulse'}`}
          aria-label={`View details for ${tag.product.nameEn}`}
          aria-expanded={isOpen}
        >
          <Plus size={16} strokeWidth={3} />
        </button>

        {/* The Popover Card */}
        {isOpen && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-72 bg-white rounded-xl shadow-xl overflow-hidden z-20 animate-in fade-in slide-in-from-top-2 duration-200 border border-gray-100 ring-1 ring-black/5">
            {/* Arrow */}
            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45 border-l border-t border-gray-100"></div>

            <div className="relative p-4">
              {/* Product Header */}
              <div className="flex gap-3 mb-3">
                <img 
                  src={tag.product.image} 
                  alt={tag.product.nameEn} 
                  onError={handleImageError}
                  className="w-16 h-16 rounded-lg object-cover bg-gray-100 flex-shrink-0 shadow-sm"
                />
                <div className="flex flex-col justify-between flex-1 min-w-0">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 leading-tight truncate">
                      {tag.product.nameEn}
                    </h4>
                    <p className="text-xs text-orange-600 font-medium mt-0.5">
                      {tag.product.nameKr}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 capitalize">
                      {tag.product.category}
                    </span>
                    <span className="text-sm font-bold ml-auto text-gray-900">
                      {priceDisplay}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-4">
                {tag.product.description}
              </p>

              {/* Primary Action */}
              <a 
                href={purchaseLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-lg transition-colors shadow-sm mb-3"
              >
                <ShoppingCart size={14} />
                Buy on {marketName}
                <ChevronRight size={14} />
              </a>

              {/* Social Media Shortcuts (Mukbang Connect) */}
              <div className="pt-3 border-t border-gray-100 grid grid-cols-3 gap-2">
                <a 
                  href={social.youtube} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex flex-col items-center justify-center gap-1 p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors group"
                  title="Watch Mukbang"
                >
                  <Youtube size={18} className="group-hover:scale-110 transition-transform" />
                  <span className="text-[9px] font-medium">Mukbang</span>
                </a>
                
                <a 
                  href={social.instagram} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex flex-col items-center justify-center gap-1 p-1.5 rounded-lg hover:bg-pink-50 text-gray-500 hover:text-pink-600 transition-colors group"
                  title="See Photos"
                >
                  <Instagram size={18} className="group-hover:scale-110 transition-transform" />
                  <span className="text-[9px] font-medium">Photos</span>
                </a>

                <a 
                  href={social.tiktok} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex flex-col items-center justify-center gap-1 p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-black transition-colors group"
                  title="Viral Challenges"
                >
                  <Clapperboard size={18} className="group-hover:scale-110 transition-transform" />
                  <span className="text-[9px] font-medium">TikTok</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};