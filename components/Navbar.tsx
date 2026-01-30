import React from 'react';
import { ShoppingBag, Globe, MapPin, Search, PlusSquare } from 'lucide-react';
import { Region } from '../types';

interface NavbarProps {
  region: Region;
  setRegion: (r: Region) => void;
  onUploadClick: () => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  region, 
  setRegion, 
  onUploadClick, 
  searchTerm, 
  setSearchTerm 
}) => {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setSearchTerm('')}>
          <div className="bg-orange-600 text-white p-1.5 rounded-lg">
            <ShoppingBag size={20} strokeWidth={2.5} />
          </div>
          <span className="font-bold text-xl tracking-tight text-gray-900">K-Kitchen</span>
        </div>

        {/* Center Search */}
        <div className="hidden md:flex flex-1 max-w-xs mx-6">
          <div className="relative w-full text-gray-400 focus-within:text-orange-600">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="Search 'Kimchi Pot'..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-full leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-orange-500 focus:border-orange-500 sm:text-sm transition-colors"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <button 
            onClick={onUploadClick}
            className="flex items-center gap-1 text-gray-600 hover:text-orange-600 transition-colors"
          >
            <PlusSquare size={24} />
            <span className="hidden sm:inline text-sm font-medium">Upload</span>
          </button>

          {/* Region Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-gray-400 hidden sm:inline">Ship to</span>
            <div className="flex items-center bg-gray-100 rounded-full p-1 border border-gray-200">
              <button
                onClick={() => setRegion(Region.GLOBAL)}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  region === Region.GLOBAL 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Globe size={12} /> Global
              </button>
              <button
                onClick={() => setRegion(Region.KR)}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  region === Region.KR 
                    ? 'bg-white text-red-600 shadow-sm' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <MapPin size={12} /> Korea
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};