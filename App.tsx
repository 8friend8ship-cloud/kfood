import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { PostDetail } from './components/PostDetail';
import { UploadWizard } from './components/UploadWizard';
import { CreatorHub } from './components/CreatorHub';
import { Region, Post, Author, Creator } from './types';
import { THEMES, ALL_PERSONAS } from './constants';
import { getPosts, addPost } from './services/dataService';
import { onAuthChange, getCreatorProfile } from './services/firebaseService';
import { runSchedulerTick } from './services/schedulerService';
import { generateAuthorStory } from './services/geminiService';
import { Loader2 } from 'lucide-react';
import { User } from 'firebase/auth';

export default function App() {
  const [region, setRegion] = useState<Region>(Region.GLOBAL);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isCreatorHubOpen, setIsCreatorHubOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('all');
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);

  // --- Centralized State Management ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [creatorProfile, setCreatorProfile] = useState<Creator | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Fetch profile whenever the current user changes
  const fetchProfile = useCallback(async () => {
    if (!currentUser) {
        setCreatorProfile(null);
        setIsLoadingProfile(false);
        return;
    }
    setIsLoadingProfile(true);
    try {
        const profile = await getCreatorProfile(currentUser.uid);
        setCreatorProfile(profile);
    } catch (error) {
        console.error("Failed to fetch creator profile:", error);
        setCreatorProfile(null);
    } finally {
        setIsLoadingProfile(false);
    }
  }, [currentUser]);

  // Listener for auth state
  useEffect(() => {
    const unsubscribe = onAuthChange(setCurrentUser);
    return () => unsubscribe();
  }, []);

  // Effect to trigger profile fetch
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);
  // --- End Centralized State ---

  const getRecentlyPostedAuthorIds = (): string[] => {
    return posts.slice(0, 50).map(p => p.author.id);
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const initialPosts = await getPosts();
        setPosts(initialPosts);
      } catch (error) {
        console.error("Error loading initial posts:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, []);

  const handleNewPost = (newPost: Post) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
    addPost(newPost).catch(error => {
      console.error("Failed to persist new post:", error);
    });
  };
  
  const handlePostCreatedByAI = (newPost: Post) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
    setIsUploadOpen(false);
  };
  
  const handleManualGenerate = async () => {
    const countStr = prompt("How many posts would you like to generate?", "3");
    if (!countStr) return;

    const count = parseInt(countStr, 10);
    if (isNaN(count) || count <= 0) {
      alert("Please enter a valid number.");
      return;
    }

    setIsGenerating(true);
    try {
      for (let i = 0; i < count; i++) {
        await runSchedulerTick(
          () => ALL_PERSONAS,
          handleNewPost,
          getRecentlyPostedAuthorIds
        );
      }
    } catch (error) {
      console.error("Manual generation failed:", error);
      alert("An error occurred during post generation. Check the console for details.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateStory = async (author: Author) => {
    alert(`Generating story for ${author.name}...`);
    try {
      const story = await generateAuthorStory(author);
      alert(`${author.name}'s Story:\n\n${story}`);
    } catch(e) {
      alert(`Could not generate story. Please check your API Key and console for details.`);
    }
  };

  const handleUpdatePost = (updatedPost: Post) => {
    setPosts(prevPosts => prevPosts.map(p => p.id === updatedPost.id ? updatedPost : p));
  };


  const filteredPosts = posts.filter(post => {
    const activeThemeInfo = THEMES.find(t => t.id === selectedTheme);
    let matchesTheme = true;
    
    if (activeThemeInfo && activeThemeInfo.id !== 'all') {
      matchesTheme = post.tags.some(tag => 
        activeThemeInfo.keywords.some(keyword => 
          tag.product.nameEn.toLowerCase().includes(keyword.toLowerCase()) ||
          tag.product.searchKeyword?.toLowerCase().includes(keyword.toLowerCase()) ||
          tag.product.category.toLowerCase().includes(keyword.toLowerCase())
        )
      ) || activeThemeInfo.keywords.some(keyword => 
           post.title.toLowerCase().includes(keyword.toLowerCase()) ||
           post.description.toLowerCase().includes(keyword.toLowerCase())
        );
    }

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
        onCreatorHubClick={() => setIsCreatorHubOpen(true)}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        currentUser={currentUser}
        onGenerateClick={handleManualGenerate}
        isGenerating={isGenerating}
      />

      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-6 pb-40">
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

        <div className="mb-8 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          <div className="flex gap-3">
            {THEMES.map(theme => {
              const isActive = selectedTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme.id)}
                  className={`relative flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-200 ${isActive ? 'bg-gray-900 border-gray-900 text-white shadow-md scale-105' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'}`}
                >
                  <span className="text-lg">{theme.icon}</span>
                  <span className="text-sm font-bold whitespace-nowrap">{theme.title}</span>
                  {isActive && <span className={`absolute -top-1 -right-1 w-3 h-3 rounded-full bg-gradient-to-r ${theme.gradient} animate-pulse border-2 border-white`}></span>}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-8">
          {isLoading ? (
            <div className="text-center py-16 flex flex-col items-center justify-center gap-4 text-gray-500">
              <Loader2 size={32} className="text-orange-500 animate-spin" />
              <h3 className="text-lg font-bold text-gray-800">Loading K-Kitchen Feed...</h3>
              <p className="text-sm">Connecting to our global kitchen.</p>
            </div>
          ) : filteredPosts.length > 0 ? (
            filteredPosts.map(post => (
              <PostDetail 
                key={post.id} 
                post={post} 
                region={region} 
                onGenerateStory={handleGenerateStory}
                currentUser={currentUser}
                creatorProfile={creatorProfile}
                setCreatorProfile={setCreatorProfile}
                onUpdatePost={handleUpdatePost}
              />
            ))
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
              <div className="text-4xl mb-4">🌪️</div>
              <h3 className="text-lg font-bold text-gray-900">No items found</h3>
              <p className="text-gray-500 text-sm mt-1">Try selecting a different theme or clearing your search.</p>
              <button 
                onClick={() => {setSelectedTheme('all'); setSearchTerm('');}}
                className="mt-4 px-4 py-2 bg-orange-50 text-orange-700 font-bold text-xs rounded-full hover:bg-orange-100 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {filteredPosts.length > 0 && !isLoading && (
          <div className="text-center py-12 text-gray-400 text-xs">
            <p>End of Feed</p>
            <p className="mt-2 font-serif italic">"We sell the Culture, not just the Pan."</p>
          </div>
        )}
      </main>

      {isUploadOpen && (
        <UploadWizard 
          onClose={() => setIsUploadOpen(false)} 
          onPostCreated={handlePostCreatedByAI}
          region={region}
        />
      )}

      {isCreatorHubOpen && (
        <CreatorHub 
          onClose={() => setIsCreatorHubOpen(false)}
          user={currentUser}
          creatorProfile={creatorProfile}
          isLoadingProfile={isLoadingProfile}
          refetchProfile={fetchProfile}
        />
      )}
    </div>
  );
}