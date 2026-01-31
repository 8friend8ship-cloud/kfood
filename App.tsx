import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { PostDetail } from './components/PostDetail';
import { UploadWizard } from './components/UploadWizard';
import { Region, Post } from './types';
import { MOCK_POSTS, THEMES } from './constants';

export default function App() {
  const [region, setRegion] = useState<Region>(Region.GLOBAL);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('all');
  
  // State for posts (initialized with mock data)
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  
  // State for search
  const [searchTerm, setSearchTerm] = useState('');

  // Handler to add a new post from the Upload Wizard
  const handleSavePost = (newPost: Post) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
    setIsUploadOpen(false);
  };

  // Filter logic: Search Term AND Theme
  const filteredPosts = posts.filter(post => {
    // 1. Theme Filter
    const activeThemeInfo = THEMES.find(t => t.id === selectedTheme);
    let matchesTheme = true;
    
    if (activeThemeInfo && activeThemeInfo.id !== 'all') {
      // Check if post has any tag that matches the theme keywords
      matchesTheme = post.tags.some(tag => 
        activeThemeInfo.keywords.some(keyword => 
          tag.product.nameEn.toLowerCase().includes(keyword.toLowerCase()) ||
          tag.product.searchKeyword?.toLowerCase().includes(keyword.toLowerCase()) ||
          tag.product.category.toLowerCase().includes(keyword.toLowerCase())
        )
      );
      // Also check title/desc just in case
      if (!matchesTheme) {
        matchesTheme = activeThemeInfo.keywords.some(keyword => 
           post.title.toLowerCase().includes(keyword.toLowerCase()) ||
           post.description.toLowerCase().includes(keyword.toLowerCase())
        );
      }
    }

    // 2. Search Filter
    const term = searchTerm.toLowerCase();
    let matchesSearch = true;
    if (term) {
       const matchesMeta = 
        post.title.toLowerCase().includes(term) || 
        post.description.toLowerCase().includes(term) ||
        post.author.name.toLowerCase().includes(term);

       const matchesTags = post.tags.some(tag => 
        tag.product.nameEn.toLowerCase().includes(term) || 
        tag.product.nameKr.toLowerCase().includes(term) ||
        (tag.product.searchKeyword && tag.product.searchKeyword.toLowerCase().includes(term))
      );
      matchesSearch = matchesMeta || matchesTags;
    }

    return matchesTheme && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar 
        region={region} 
        setRegion={setRegion} 
        onUploadClick={() => setIsUploadOpen(true)}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-6 pb-40">
        {/* Intro Banner */}
        <div className="mb-6 text-center space-y-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {region === Region.GLOBAL ? "Discover Authentic K-Kitchen" : "진짜 한국의 맛과 도구"}
          </h1>
          <p className="text-xs text-gray-500">
            {region === Region.GLOBAL 
              ? "Shop the tools you saw in your favorite K-Drama." 
              : "전 세계에 한국의 식문화를 소개합니다."}
          </p>
        </div>

        {/* Theme Bar (Horizontal Scroll) */}
        <div className="mb-8 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          <div className="flex gap-3">
            {THEMES.map(theme => {
              const isActive = selectedTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme.id)}
                  className={`
                    relative flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-200
                    ${isActive 
                      ? 'bg-gray-900 border-gray-900 text-white shadow-md scale-105' 
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                    }
                  `}
                >
                  <span className="text-lg">{theme.icon}</span>
                  <span className="text-sm font-bold whitespace-nowrap">{theme.title}</span>
                  
                  {/* Theme Badge (if active, shows gradient dot) */}
                  {isActive && (
                    <span className={`absolute -top-1 -right-1 w-3 h-3 rounded-full bg-gradient-to-r ${theme.gradient} animate-pulse border-2 border-white`}></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Feed */}
        <div className="space-y-8">
          {filteredPosts.length > 0 ? (
            filteredPosts.map(post => (
              <PostDetail key={post.id} post={post} region={region} />
            ))
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
              <div className="text-4xl mb-4">🌪️</div>
              <h3 className="text-lg font-bold text-gray-900">No items found</h3>
              <p className="text-gray-500 text-sm mt-1">
                Try selecting a different theme or clearing your search.
              </p>
              <button 
                onClick={() => {setSelectedTheme('all'); setSearchTerm('');}}
                className="mt-4 px-4 py-2 bg-orange-50 text-orange-700 font-bold text-xs rounded-full hover:bg-orange-100 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Empty State / Footer */}
        {filteredPosts.length > 0 && (
          <div className="text-center py-12 text-gray-400 text-xs">
            <p>End of Feed</p>
            <p className="mt-2 font-serif italic">"We sell the Culture, not just the Pan."</p>
          </div>
        )}
      </main>

      {/* Modals */}
      {isUploadOpen && (
        <UploadWizard 
          onClose={() => setIsUploadOpen(false)} 
          onSave={handleSavePost}
          region={region}
        />
      )}
    </div>
  );
}