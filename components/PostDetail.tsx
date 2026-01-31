import React, { useState, useRef, useEffect } from 'react';
import { Post, Region } from '../types';
import { ProductTag } from './ProductTag';
import { Heart, MessageCircle, Share2, Bookmark, Check, ShoppingCart, ChevronRight, Volume2, VolumeX, Youtube, Instagram, Clapperboard } from 'lucide-react';

interface PostDetailProps {
  post: Post;
  region: Region;
}

export const PostDetail: React.FC<PostDetailProps> = ({ post, region }) => {
  // Local state for interactions
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [isSaved, setIsSaved] = useState(false);
  const [isShared, setIsShared] = useState(false);
  
  // State for managing which tag popover is open
  const [activeTagId, setActiveTagId] = useState<string | null>(null);

  // Audio/Video State
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleLike = () => {
    if (isLiked) {
      setLikeCount(prev => prev - 1);
    } else {
      setLikeCount(prev => prev + 1);
    }
    setIsLiked(!isLiked);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
  };

  const handleShare = () => {
    // Mock share functionality
    navigator.clipboard.writeText(`https://k-kitchen.app/post/${post.id}`);
    setIsShared(true);
    setTimeout(() => setIsShared(false), 2000);
  };

  // [UI Logic Fix] Single Active Tag Handler
  const handleTagToggle = (tagId: string) => {
    setActiveTagId(prevId => (prevId === tagId ? null : tagId));
  };

  // Toggle Sound for ASMR
  const toggleSound = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    
    // Toggle video audio if embedded
    if (videoRef.current) {
      videoRef.current.muted = newMutedState;
    }

    // Toggle separate audio track if it exists
    if (audioRef.current && post.audioUrl) {
      if (newMutedState) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.error("Audio play failed:", e));
      }
    }
  };

  // [Robustness Upgrade] Dynamic fallback image generator
  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>,
    keyword: string,
    size: string = '800x800'
  ) => {
    const searchKeyword = keyword.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '');
    e.currentTarget.src = `https://source.unsplash.com/${size}/?${searchKeyword},korean,food`;
    e.currentTarget.onerror = null; // Prevent infinite loop if fallback fails
  };


  // Dynamic Social Links (Mukbang Connect)
  const getSocialLinks = () => {
    const titleClean = post.title.replace(/[^a-zA-Z0-9 ]/g, '');
    const searchKeyword = titleClean.replace(/ /g, '+');
    const hashtag = titleClean.replace(/ /g, '');

    return {
      youtube: post.bestVideoUrl 
        ? post.bestVideoUrl 
        : `https://www.youtube.com/results?search_query=${searchKeyword}+Mukbang`,
      instagram: `https://www.instagram.com/explore/tags/${hashtag}/`,
      tiktok: `https://www.tiktok.com/tag/${hashtag}`
    };
  };

  const social = getSocialLinks();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src={post.author.avatar} 
            alt={post.author.name}
            className="w-10 h-10 rounded-full object-cover bg-gray-200 border-2 border-white shadow-sm"
          />
          <div>
            <h3 className="font-bold text-sm text-gray-900">{post.author.name}</h3>
            <p className="text-xs text-gray-500">
              {post.author.title 
                ? post.author.title 
                : `${post.author.badge} • ${post.author.country}`
              }
            </p>
          </div>
        </div>
        {post.author.followers !== undefined && post.author.followers > 0 && (
          <button className="text-orange-600 text-xs font-bold hover:bg-orange-50 px-3 py-1 rounded-full transition-colors">
            Follow
          </button>
        )}
      </div>

      {/* Main Media Container (Image or Video) */}
      <div className="relative aspect-square w-full bg-gray-100 overflow-hidden group">
        {post.videoUrl ? (
          <>
            <video
              ref={videoRef}
              src={post.videoUrl}
              poster={post.imageUrl}
              autoPlay
              loop
              muted={isMuted} // Controlled by state
              playsInline
              className="w-full h-full object-cover"
              onError={(e) => {
                 // Fallback to Image if Video Fails
                 (e.target as HTMLVideoElement).style.display = 'none';
                 // Sibling image will show if video hides? No, we need logic.
                 // For simplicity, we just log. In real prod, we'd swap component.
                 console.warn("Video failed to load");
              }}
            />
            {/* Separate Audio Element for ASMR if audioUrl is provided and distinct from video sound */}
            {post.audioUrl && (
              <audio ref={audioRef} src={post.audioUrl} loop />
            )}
            
            {/* Sound Toggle Overlay */}
            <button 
              onClick={toggleSound}
              className="absolute bottom-4 right-4 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full flex items-center gap-2 transition-all z-20"
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} className="text-orange-400 animate-pulse" />}
              <span className="text-xs font-medium">
                {isMuted ? "Tap to hear 🔊" : "ASMR On"}
              </span>
            </button>
          </>
        ) : (
          <img 
            src={post.imageUrl} 
            alt={post.title} 
            onError={(e) => handleImageError(e, post.title, '1200x1200')}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}
        
        {/* Render Tags */}
        {post.tags.map((tag) => (
          <ProductTag 
            key={tag.id} 
            tag={tag} 
            region={region} 
            isOpen={activeTagId === tag.id}
            onToggle={handleTagToggle}
          />
        ))}

        {/* Helper text overlay if tags exist */}
        {post.tags.length > 0 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-white font-medium">Click tags to shop items</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4 text-gray-700">
          <button 
            onClick={handleLike}
            className={`flex items-center gap-1.5 transition-colors ${isLiked ? 'text-red-500' : 'hover:text-red-500'}`}
          >
            <Heart size={24} fill={isLiked ? "currentColor" : "none"} />
          </button>
          
          <button className="flex items-center gap-1.5 hover:text-blue-500 transition-colors">
            <MessageCircle size={24} />
          </button>
          
          <button 
            onClick={handleShare}
            className={`flex items-center gap-1.5 transition-colors ${isShared ? 'text-green-600' : 'hover:text-green-600'}`}
          >
            {isShared ? <Check size={24} /> : <Share2 size={24} />}
          </button>
        </div>
        
        <button 
          onClick={handleSave}
          className={`transition-colors ${isSaved ? 'text-orange-600' : 'text-gray-700 hover:text-orange-600'}`}
        >
          <Bookmark size={24} fill={isSaved ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 pb-5">
        <div className="text-sm font-bold mb-1 text-gray-900">{likeCount.toLocaleString()} likes</div>
        <h2 className="text-base font-bold text-gray-900 mb-1">{post.title}</h2>
        <p className="text-sm text-gray-600 leading-relaxed">{post.description}</p>
        
        {/* --- MEDIA SHORTCUTS (The Feed Connector) --- */}
        <div className="mt-4 grid grid-cols-3 gap-2">
            <a 
              href={social.youtube} 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center justify-center gap-2 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors group"
            >
              <Youtube size={16} className="group-hover:scale-110 transition-transform"/>
              <span className="text-xs font-bold">Mukbang</span>
            </a>
            <a 
              href={social.instagram} 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center justify-center gap-2 py-2 bg-pink-50 text-pink-600 rounded-lg hover:bg-pink-100 transition-colors group"
            >
              <Instagram size={16} className="group-hover:scale-110 transition-transform"/>
              <span className="text-xs font-bold">Photos</span>
            </a>
            <a 
              href={social.tiktok} 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center justify-center gap-2 py-2 bg-gray-100 text-black rounded-lg hover:bg-gray-200 transition-colors group"
            >
              <Clapperboard size={16} className="group-hover:scale-110 transition-transform"/>
              <span className="text-xs font-bold">Viral</span>
            </a>
        </div>

        {/* --- RECIPE ESSENTIALS (Hidden Ingredients) --- */}
        {post.recipeEssentials && post.recipeEssentials.length > 0 && (
          <div className="mt-6 bg-orange-50 rounded-xl p-4 border border-orange-100">
            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
              <span className="text-lg">🥣</span> 
              Secret Recipe Essentials
              <span className="text-[10px] text-orange-600 bg-white px-1.5 rounded border border-orange-200 uppercase font-medium">The Hidden Taste</span>
            </h4>
            <div className="space-y-3">
              {post.recipeEssentials.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-white p-2.5 rounded-lg border border-orange-100 shadow-sm">
                  <img 
                    src={item.product.image} 
                    alt={item.product.nameEn} 
                    onError={(e) => handleImageError(e, item.product.nameEn, '100x100')}
                    className="w-10 h-10 rounded object-cover bg-gray-50 flex-shrink-0" 
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="text-xs font-bold text-gray-900 truncate">{item.product.nameEn}</p>
                      <a 
                        href={region === Region.KR ? item.product.links.kr : item.product.links.global}
                        target="_blank"
                        rel="noreferrer" 
                        className="text-[10px] flex items-center gap-0.5 bg-gray-900 text-white px-2 py-1 rounded hover:bg-black transition-colors"
                      >
                        Buy <ChevronRight size={10} />
                      </a>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-0.5">{item.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Identified Items List (SEO/Accessibility) */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Shop visual items</p>
          <div className="flex flex-wrap gap-2">
            {post.tags.map(tag => (
              <span key={tag.id} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                {tag.product.nameEn}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};