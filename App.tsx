import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { PostDetail } from './components/PostDetail';
import { UploadWizard } from './components/UploadWizard';
import { Region, Post } from './types';
import { MOCK_POSTS } from './constants';

export default function App() {
  const [region, setRegion] = useState<Region>(Region.GLOBAL);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  
  // State for posts (initialized with mock data)
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  
  // State for search
  const [searchTerm, setSearchTerm] = useState('');

  // Handler to add a new post from the Upload Wizard
  const handleSavePost = (newPost: Post) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
    setIsUploadOpen(false);
  };

  // Filter posts based on search term (title, description, or tag names)
  const filteredPosts = posts.filter(post => {
    const term = searchTerm.toLowerCase();
    if (!term) return true;

    const matchesMeta = 
      post.title.toLowerCase().includes(term) || 
      post.description.toLowerCase().includes(term) ||
      post.author.toLowerCase().includes(term);

    const matchesTags = post.tags.some(tag => 
      tag.product.nameEn.toLowerCase().includes(term) || 
      tag.product.nameKr.toLowerCase().includes(term)
    );

    return matchesMeta || matchesTags;
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

      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-6">
        {/* Intro Banner */}
        <div className="mb-8 text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">
            {region === Region.GLOBAL ? "Discover Authentic K-Kitchen" : "진짜 한국의 맛과 도구"}
          </h1>
          <p className="text-sm text-gray-500">
            {region === Region.GLOBAL 
              ? "Shop the tools you saw in your favorite K-Drama." 
              : "전 세계에 한국의 식문화를 소개합니다."}
          </p>
        </div>

        {/* Feed */}
        <div className="space-y-8">
          {filteredPosts.length > 0 ? (
            filteredPosts.map(post => (
              <PostDetail key={post.id} post={post} region={region} />
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No results found for "{searchTerm}"</p>
            </div>
          )}
        </div>

        {/* Empty State / Footer */}
        <div className="text-center py-12 text-gray-400 text-sm">
          <p>End of Feed</p>
          <p className="mt-2">We sell the Culture, not just the Pan.</p>
        </div>
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