import React, { useState } from 'react';
import { Post, Region } from '../types';
import { ProductTag } from './ProductTag';
import { Heart, MessageCircle, Share2, Bookmark, Check } from 'lucide-react';

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

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-lg font-bold text-gray-600 border border-gray-200">
            {post.author.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-bold text-sm text-gray-900">{post.author}</h3>
            <p className="text-xs text-gray-500">Global Chef · K-Food Lover</p>
          </div>
        </div>
        <button className="text-orange-600 text-xs font-bold hover:bg-orange-50 px-3 py-1 rounded-full transition-colors">
          Follow
        </button>
      </div>

      {/* Main Image Container */}
      <div className="relative aspect-square w-full bg-gray-100 overflow-hidden group">
        <img 
          src={post.imageUrl} 
          alt={post.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        
        {/* Render Tags */}
        {post.tags.map((tag) => (
          <ProductTag key={tag.id} tag={tag} region={region} />
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
        
        {/* Identified Items List (SEO/Accessibility) */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Shop this look</p>
          <div className="flex flex-wrap gap-2">
            {post.tags.map(tag => (
              <span key={tag.id} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-orange-50 text-orange-700 border border-orange-100">
                {tag.product.nameEn}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};