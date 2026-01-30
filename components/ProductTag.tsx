import React, { useState } from 'react';
import { Plus, ChevronRight, ShoppingCart } from 'lucide-react';
import { Tag, Region } from '../types';

interface ProductTagProps {
  tag: Tag;
  region: Region;
}

export const ProductTag: React.FC<ProductTagProps> = ({ tag, region }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Region-specific logic
  const isKr = region === Region.KR;
  const purchaseLink = isKr ? tag.product.links.kr : tag.product.links.global;
  const marketName = isKr ? "Coupang" : "Amazon";
  const priceDisplay = isKr 
    ? `₩${tag.product.priceKr.toLocaleString()}` 
    : `$${tag.product.priceUsd.toFixed(2)}`;

  return (
    <div
      className="absolute"
      style={{ left: `${tag.x}%`, top: `${tag.y}%` }}
    >
      <div className="relative">
        {/* The Dot (+) */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`group relative flex items-center justify-center w-8 h-8 -ml-4 -mt-4 bg-orange-600 bg-opacity-90 rounded-full shadow-lg text-white transition-transform duration-200 z-10 hover:scale-110 ${isOpen ? 'rotate-45' : 'tag-pulse'}`}
          aria-label={`View details for ${tag.product.nameEn}`}
        >
          <Plus size={16} strokeWidth={3} />
        </button>

        {/* The Popover Card */}
        {isOpen && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-64 bg-white rounded-xl shadow-xl overflow-hidden z-20 animate-in fade-in slide-in-from-top-2 duration-200 border border-gray-100">
            {/* Arrow */}
            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45 border-l border-t border-gray-100"></div>

            <div className="relative p-3">
              <div className="flex gap-3">
                <img 
                  src={tag.product.image} 
                  alt={tag.product.nameEn} 
                  className="w-16 h-16 rounded-lg object-cover bg-gray-100 flex-shrink-0"
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

              <p className="mt-2 text-xs text-gray-500 line-clamp-2 leading-relaxed">
                {tag.product.description}
              </p>

              <a 
                href={purchaseLink}
                target="_blank"
                rel="noreferrer"
                className="mt-3 flex items-center justify-center gap-2 w-full py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-lg transition-colors"
              >
                <ShoppingCart size={12} />
                Buy on {marketName}
                <ChevronRight size={12} />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};