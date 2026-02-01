import React from 'react';
import { ShoppingBag, Globe, MapPin, Search, PlusSquare, Star, Play, Loader2 } from 'lucide-react';
import { Region } from '../types';
import { User } from 'firebase/auth';

interface NavbarProps {
  region: Region;
  setRegion: (r: Region) => void;
  onUploadClick: () => void;
  onCreatorHubClick: () => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  currentUser: User | null;
  onGenerateClick: () => void;
  isGenerating: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  region, 
  setRegion, 
  onUploadClick,
  onCreatorHubClick,
  searchTerm, 
  setSearchTerm,
  currentUser,
  onGenerateClick,
  isGenerating
}) => {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setSearchTerm('')}>
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
           {currentUser ? (
              <button onClick={onCreatorHubClick} title="Creator Hub" className="rounded-full hover:ring-2 hover:ring-orange-500 hover:ring-offset-2 transition-all">
                <img 
                  src={currentUser.photoURL || `https://ui-avatars.com/api/?name=${currentUser.displayName}&background=ea580c&color=fff`} 
                  alt="User Avatar"
                  className="w-9 h-9 rounded-full bg-gray-200"
                />
              </button>
           ) : (
            <button 
              onClick={onCreatorHubClick}
              className="flex items-center gap-1.5 text-gray-600 hover:text-orange-600 transition-colors"
              title="Creator Hub"
            >
              <Star size={22} />
              <span className="hidden sm:inline text-sm font-medium">Creator Hub</span>
            </button>
           )}
          
          <button
            onClick={onGenerateClick}
            disabled={isGenerating}
            className="hidden sm:flex items-center gap-1.5 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 transition-colors px-3 py-2 rounded-lg disabled:opacity-50 disabled:cursor-wait"
            title="Generate test posts"
          >
            {isGenerating 
              ? <Loader2 size={18} className="animate-spin"/> 
              : <Play size={18} />
            }
            <span className="hidden sm:inline text-sm font-medium">
              {isGenerating ? 'Generating...' : 'Test Gen'}
            </span>
          </button>

          <button 
            onClick={onUploadClick}
            className="hidden sm:flex items-center gap-1.5 text-gray-600 hover:text-orange-600 transition-colors"
          >
            <PlusSquare size={22} />
            <span className="hidden sm:inline text-sm font-medium">Upload</span>
          </button>

          {/* Region Toggle */}
          <div className="flex items-center gap-2">
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