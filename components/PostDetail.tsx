import React, { useState, useRef, useEffect } from 'react';
import { Post, Region, Author, Creator } from '../types';
import { ProductTag } from './ProductTag';
import { Heart, MessageCircle, Share2, Bookmark, Check, ShoppingCart, ChevronRight, Volume2, VolumeX, Youtube, Instagram, Clapperboard, Sparkles, ChefHat, Loader2, CookingPot, BookOpen, ShoppingBag, Rocket, X } from 'lucide-react';
import { GHOST_AUTHORS } from '../constants';
import { formatTimeAgo } from '../utils/timeUtils';
import { getAvatar } from '../services/avatarService';
import { FALLBACK_IMAGE_BASE64 } from '../utils/imageUtils';
import { User } from 'firebase/auth';


const BOOST_COST = 100; // Cost to boost a post

interface BoostModalProps {
  post: Post;
  creatorProfile: Creator;
  onConfirm: () => void;
  onClose: () => void;
}

const BoostModal: React.FC<BoostModalProps> = ({ post, creatorProfile, onConfirm, onClose }) => {
    const bonusCredits = creatorProfile.bonus_credits || 0;
    const spendableCredits = creatorProfile.spendable_credits || 0;
    const totalCredits = bonusCredits + spendableCredits;
    const canAfford = totalCredits >= BOOST_COST;

    const bonusDeduction = Math.min(bonusCredits, BOOST_COST);
    const spendableDeduction = BOOST_COST - bonusDeduction;

    let deductionMessage = '';
    if (canAfford) {
        if (bonusDeduction > 0 && spendableDeduction > 0) {
            deductionMessage = `We will use your ${bonusDeduction} Bonus Credits and ${spendableDeduction} Spendable Credits.`;
        } else if (bonusDeduction > 0) {
            deductionMessage = `We will use ${bonusDeduction} of your Bonus Credits.`;
        } else {
            deductionMessage = `We will use ${spendableDeduction} of your Spendable Credits.`;
        }
    }

    return (
        <div className="fixed inset-0 z-[110] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center relative">
                <button onClick={onClose} className="absolute top-3 right-3 p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"><X size={18} /></button>
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center shadow-lg mb-4 text-white">
                    <Rocket size={32} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Boost Your Post</h2>
                <p className="text-gray-500 text-sm mt-2">Reach a wider audience for 24 hours. This will improve your visibility and potential earnings.</p>
                
                <div className="text-left bg-gray-50 p-4 rounded-xl my-5 space-y-2 border border-gray-200">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Boost Cost:</span>
                        <span className="font-bold text-gray-900">{BOOST_COST} Credits</span>
                    </div>
                     <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">🎁 Bonus Credits:</span>
                        <span className="font-bold text-gray-900">{bonusCredits.toLocaleString()}</span>
                    </div>
                     <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">💎 Spendable Credits:</span>
                        <span className="font-bold text-gray-900">{spendableCredits.toLocaleString()}</span>
                    </div>
                    <div className="pt-2 border-t border-gray-200">
                         <div className="flex justify-between items-center text-sm font-bold">
                            <span className="text-gray-600">Total Available:</span>
                            <span className="text-gray-900">{totalCredits.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {canAfford && <p className="text-xs text-orange-700 bg-orange-50 p-2 rounded-md font-medium">{deductionMessage}</p>}

                <button 
                    onClick={onConfirm}
                    disabled={!canAfford}
                    className="w-full mt-5 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors shadow-lg flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
                >
                    {canAfford ? `Confirm Boost (${BOOST_COST} Credits)`: 'Insufficient Credits'}
                </button>
            </div>
        </div>
    );
};


interface PostDetailProps {
  post: Post;
  region: Region;
  onGenerateStory: (author: Author) => void;
  currentUser: User | null;
  creatorProfile: Creator | null;
  setCreatorProfile: React.Dispatch<React.SetStateAction<Creator | null>>;
  onUpdatePost: (post: Post) => void;
}

export const PostDetail: React.FC<PostDetailProps> = ({ 
    post, 
    region, 
    onGenerateStory,
    currentUser,
    creatorProfile,
    setCreatorProfile,
    onUpdatePost
 }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [isSaved, setIsSaved] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [activeTagId, setActiveTagId] = useState<string | null>(null);
  const [soundState, setSoundState] = useState<'off' | 'generating' | 'on'>('off');
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const soundTimerRef = useRef<number | null>(null);
  const [avatarSrc, setAvatarSrc] = useState(post.author.avatar);
  const [isBoostModalOpen, setIsBoostModalOpen] = useState(false);
  
  const isAiPersona = !!post.author.timezone || GHOST_AUTHORS.some(a => a.id === post.author.id);
  const ingredientTags = post.tags.filter(tag => !['tool', 'tableware'].includes(tag.product.category));
  const toolTags = post.tags.filter(tag => ['tool', 'tableware'].includes(tag.product.category));

  useEffect(() => {
    let isMounted = true;
    const fetchAvatar = async () => {
      if (isAiPersona) {
        try {
          const base64 = await getAvatar(post.author);
          if (isMounted) setAvatarSrc(`data:image/png;base64,${base64}`);
        } catch (e) { /* Error logged in service */ }
      }
    };
    if (avatarSrc.startsWith('http')) fetchAvatar();
    return () => { isMounted = false; };
  }, [post.author.id, avatarSrc, isAiPersona]);

  useEffect(() => {
    const shouldPlay = soundState === 'on';
    if (videoRef.current) videoRef.current.muted = !shouldPlay;
    if (audioRef.current) {
      shouldPlay ? audioRef.current.play().catch(console.error) : audioRef.current.pause();
      if(!shouldPlay) audioRef.current.currentTime = 0;
    }
  }, [soundState, post.id]);
  
  useEffect(() => {
    return () => { if (soundTimerRef.current) clearTimeout(soundTimerRef.current); };
  }, []);

  const handleLike = () => {
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    setIsLiked(!isLiked);
  };

  const handleSave = () => setIsSaved(!isSaved);

  const handleShare = () => {
    navigator.clipboard.writeText(`https://k-kitchen.app/post/${post.id}`);
    setIsShared(true);
    setTimeout(() => setIsShared(false), 2000);
  };

  const handleTagToggle = (tagId: string) => setActiveTagId(prevId => (prevId === tagId ? null : tagId));
  
  const handleToggleSound = () => {
    if (soundTimerRef.current) clearTimeout(soundTimerRef.current);
    if (soundState === 'off') {
      setSoundState('generating');
      soundTimerRef.current = window.setTimeout(() => setSoundState('on'), 2500);
    } else if (soundState === 'on') {
      setSoundState('off');
    }
  };

  const handleBoost = () => {
    if (!creatorProfile) return;

    const totalCredits = (creatorProfile.bonus_credits || 0) + creatorProfile.spendable_credits;
    if (totalCredits < BOOST_COST) {
        alert("You don't have enough credits to boost this post.");
        return;
    }

    // Deduct credits: bonus first, then spendable
    const bonusDeduction = Math.min(creatorProfile.bonus_credits || 0, BOOST_COST);
    const spendableDeduction = BOOST_COST - bonusDeduction;

    const newBonusCredits = (creatorProfile.bonus_credits || 0) - bonusDeduction;
    const newSpendableCredits = creatorProfile.spendable_credits - spendableDeduction;

    // Optimistically update state
    setCreatorProfile({
        ...creatorProfile,
        bonus_credits: newBonusCredits,
        spendable_credits: newSpendableCredits,
    });
    onUpdatePost({ ...post, isBoosted: true });
    setIsBoostModalOpen(false);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>, keyword: string, size: string = '800x800') => {
    const searchKeyword = keyword.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '');
    e.currentTarget.src = `https://source.unsplash.com/${size}/?${searchKeyword},korean,food`;
    e.currentTarget.onerror = null;
  };
  
  const handleAvatarError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author.name)}&background=ea580c&color=fff&font-size=0.4`;
    e.currentTarget.onerror = null;
  };

  const social = (() => {
    const titleClean = post.title.replace(/[^\p{L}\p{N}\s]/gu, '').trim();
    const searchKeyword = titleClean.replace(/\s+/g, '+');
    const hashtag = titleClean.toLowerCase().split(/\s+/).slice(0, 3).join('');
    return {
      youtube: post.bestVideoUrl ? post.bestVideoUrl : `https://www.youtube.com/results?search_query=${searchKeyword}+Mukbang`,
      instagram: `https://www.instagram.com/explore/tags/${hashtag}/`,
      tiktok: `https://www.tiktok.com/search?q=${searchKeyword}`
    };
  })();

  const difficultyStyles: { [key in 'Easy' | 'Medium' | 'Hard']: string } = {
    Easy: 'bg-green-100/80 text-green-800 border-green-200/80',
    Medium: 'bg-yellow-100/80 text-yellow-800 border-yellow-200/80',
    Hard: 'bg-red-100/80 text-red-800 border-red-200/80',
  };

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8 transition-shadow duration-300 ${post.isBoosted ? 'shadow-orange-300 shadow-lg' : ''}`}>
      {isBoostModalOpen && creatorProfile && (
        <BoostModal 
            post={post}
            creatorProfile={creatorProfile}
            onConfirm={handleBoost}
            onClose={() => setIsBoostModalOpen(false)}
        />
      )}

      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={avatarSrc} alt={post.author.name} onError={handleAvatarError} className="w-10 h-10 rounded-full object-cover bg-gray-200 border-2 border-white shadow-sm" />
          <div>
            <h3 className="font-bold text-sm text-gray-900">{post.author.name}</h3>
            <p className="text-xs text-gray-500">{post.author.title ? post.author.title : `${post.author.badge} • ${post.author.country}`}</p>
          </div>
        </div>
        {post.isBoosted ? (
             <div className="flex items-center gap-1.5 bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1.5 rounded-full">
                <Rocket size={14} /> Boosted
             </div>
        ) : isAiPersona ? (
          <button onClick={() => onGenerateStory(post.author)} className="flex items-center gap-1.5 bg-orange-50 text-orange-600 text-xs font-bold hover:bg-orange-100 px-3 py-1.5 rounded-full transition-colors">
            <Sparkles size={14} /> Generate Story
          </button>
        ) : (
          <button className="text-orange-600 text-xs font-bold hover:bg-orange-50 px-3 py-1 rounded-full transition-colors">Follow</button>
        )}
      </div>

      {/* Main Media Container */}
      <div className="relative aspect-square w-full bg-gray-100 group" onClick={() => activeTagId && setActiveTagId(null)}>
        {post.videoUrl ? ( <video ref={videoRef} src={post.videoUrl} poster={post.imageUrl} autoPlay loop muted={soundState !== 'on'} playsInline className="w-full h-full object-cover" /> ) : 
        ( <>
            <img src={post.imageUrl} alt={post.title} onError={(e) => handleImageError(e, post.title, '1200x1200')} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            {post.isCinemagraph && (
                <>
                  {post.audioUrl && <audio ref={audioRef} src={post.audioUrl} loop playsInline />}
                  {post.cinemagraphEffect === 'steam' && ( <div className="steam-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div> )}
                </>
            )}
          </>
        )}
        {(post.videoUrl || (post.isCinemagraph && post.audioUrl)) && (
          <button onClick={(e) => { e.stopPropagation(); handleToggleSound(); }} disabled={soundState === 'generating'} className="absolute bottom-4 right-4 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full flex items-center gap-2 transition-all z-20 disabled:opacity-70 disabled:cursor-wait">
            {soundState === 'on' && <Volume2 size={16} className="text-orange-400 animate-pulse" />}
            {soundState === 'off' && <VolumeX size={16} />}
            {soundState === 'generating' && <Loader2 size={16} className="animate-spin" />}
            <span className="text-xs font-medium w-28 text-left"> {soundState === 'on' ? "ASMR On" : soundState === 'off' ? "Tap to hear 🔊" : "Generating ASMR..."} </span>
          </button>
        )}
        {post.difficulty && ( <div className={`absolute top-4 right-4 z-20 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border ${difficultyStyles[post.difficulty]} backdrop-blur-sm`}> {post.difficulty} </div> )}
        {ingredientTags.map((tag) => ( <ProductTag key={tag.id} tag={tag} region={region} isOpen={activeTagId === tag.id} onToggle={(tagId) => { window.event?.stopPropagation(); handleTagToggle(tagId); }} /> ))}
        {ingredientTags.length > 0 && !post.isCinemagraph && ( <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"> <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div> <span className="text-xs text-white font-medium">Click tags to shop ingredients</span> </div> )}
      </div>

      {/* Actions */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4 text-gray-700">
          <button onClick={handleLike} className={`flex items-center gap-1.5 transition-colors ${isLiked ? 'text-red-500' : 'hover:text-red-500'}`}> <Heart size={24} fill={isLiked ? "currentColor" : "none"} /> </button>
          <button className="flex items-center gap-1.5 hover:text-blue-500 transition-colors"> <MessageCircle size={24} /> </button>
          <button onClick={handleShare} className={`flex items-center gap-1.5 transition-colors ${isShared ? 'text-green-600' : 'hover:text-green-600'}`}> {isShared ? <Check size={24} /> : <Share2 size={24} />} </button>
          {currentUser && !post.isBoosted && (
             <button onClick={() => setIsBoostModalOpen(true)} className="flex items-center gap-1.5 hover:text-orange-500 transition-colors" title="Boost this post">
                <Rocket size={24} />
             </button>
          )}
        </div>
        <button onClick={handleSave} className={`transition-colors ${isSaved ? 'text-orange-600' : 'text-gray-700 hover:text-orange-600'}`}> <Bookmark size={24} fill={isSaved ? "currentColor" : "none"} /> </button>
      </div>

      {/* Content */}
      <div className="px-4 pb-5">
        <div className="text-sm font-bold mb-2 text-gray-900">{likeCount.toLocaleString()} likes</div>
        <div className="flex items-center gap-2 mb-1">
          {post.isRecipe && ( <div className="flex-shrink-0 flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full"> <ChefHat size={14} /> <span>Recipe Hack</span> </div> )}
          <h2 className="text-base font-bold text-gray-900 truncate">{post.title}</h2>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{post.description}</p>
        {post.createdAt && ( <p className="text-xs text-gray-400 mt-2">{formatTimeAgo(post.createdAt)}</p> )}
        {ingredientTags.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-3"> <ShoppingBag size={18} className="text-orange-600" /> Shop the Ingredients </h4>
            <div className="overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
              <div className="flex gap-3">
                {ingredientTags.map(({ product }) => {
                  const purchaseLink = region === Region.KR ? product.links.kr : product.links.global;
                  const priceDisplay = region === Region.KR ? `₩${product.priceKr.toLocaleString()}` : `$${product.priceUsd.toFixed(2)}`;
                  return (
                    <div key={product.id} className="flex-shrink-0 w-40 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-lg hover:border-orange-200 transition-all duration-200 p-2">
                       <div className="w-full h-24 rounded-lg overflow-hidden bg-gray-100 mb-2"> <img src={product.image} alt={product.nameEn} onError={(e) => handleImageError(e, product.nameEn, '200x200')} className="w-full h-full object-cover" /> </div>
                       <p className="text-xs font-bold text-gray-800 truncate">{product.nameEn}</p>
                       <div className="flex items-center justify-between mt-1">
                          <span className="text-xs font-semibold text-gray-500">{priceDisplay}</span>
                          <a href={purchaseLink} target="_blank" rel="noreferrer" className="bg-gray-900 text-white px-2 py-1 rounded-md hover:bg-black transition-colors text-[10px] font-bold shadow-sm"> Buy </a>
                       </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        {toolTags.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-3"> <CookingPot size={18} className="text-gray-600" /> Kitchen Tools & Cookware </h4>
            <div className="space-y-2">
              {toolTags.map(({ product }) => {
                const purchaseLink = region === Region.KR ? product.links.kr : product.links.global;
                const priceDisplay = region === Region.KR ? `₩${product.priceKr.toLocaleString()}` : `$${product.priceUsd.toFixed(2)}`;
                return (
                  <div key={product.id} className="flex items-center gap-3 bg-gray-50/70 p-2 rounded-lg border border-gray-200/80 hover:shadow-sm hover:border-gray-300 transition-all duration-200">
                    <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100 flex-shrink-0 ring-1 ring-black/5"> <img src={product.image} alt={product.nameEn} onError={(e) => handleImageError(e, product.nameEn, '100x100')} className="w-full h-full object-cover" /> </div>
                    <div className="flex-1 min-w-0"> <p className="text-sm font-bold text-gray-900 truncate">{product.nameEn}</p> <p className="text-xs text-gray-500 mt-0.5">{priceDisplay}</p> </div>
                    <a href={purchaseLink} target="_blank" rel="noreferrer" className="flex items-center gap-1 bg-gray-900 text-white px-3 py-1.5 rounded-md hover:bg-black transition-colors text-xs font-bold shadow-sm shrink-0"> Buy <ChevronRight size={14} /> </a>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {post.recipeEssentials && post.recipeEssentials.length > 0 && (
          <div className="mt-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100 shadow-inner">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2"> <ChefHat size={18} className="text-blue-600" /> Complete the Recipe: Pantry & Spices </h4>
              <span className="text-[10px] text-blue-700 bg-white px-2 py-0.5 rounded-full border border-blue-200 uppercase font-bold tracking-wider">The Hidden Taste</span>
            </div>
            <div className="space-y-2">
              {post.recipeEssentials.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-white/70 backdrop-blur-sm p-2 rounded-lg border border-blue-100/80 hover:shadow-md hover:border-blue-200 transition-all duration-200">
                  <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100 flex-shrink-0 ring-1 ring-black/5"> <img src={item.product.image} alt={item.product.nameEn} onError={(e) => handleImageError(e, item.product.nameEn, '100x100')} className="w-full h-full object-cover" /> </div>
                  <div className="flex-1 min-w-0"> <p className="text-sm font-bold text-gray-900 truncate">{item.product.nameEn}</p> <p className="text-xs text-gray-600 mt-0.5">{item.reason}</p> </div>
                  <a href={region === Region.KR ? item.product.links.kr : item.product.links.global} target="_blank" rel="noreferrer" className="flex items-center gap-1 bg-gray-900 text-white px-3 py-1.5 rounded-md hover:bg-black transition-colors text-xs font-bold shadow-sm shrink-0"> Buy <ChevronRight size={14} /> </a>
                </div>
              ))}
            </div>
            <a href={`https://www.google.com/search?q=${encodeURIComponent(post.title + " recipe")}`} target="_blank" rel="noreferrer" className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold text-xs rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"> <BookOpen size={14} /> View Full Recipe </a>
          </div>
        )}
        <div className="mt-6 grid grid-cols-3 gap-2">
            <a href={social.youtube} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors group"> <Youtube size={16} className="group-hover:scale-110 transition-transform"/> <span className="text-xs font-bold">Mukbang</span> </a>
            <a href={social.instagram} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 py-2 bg-pink-50 text-pink-600 rounded-lg hover:bg-pink-100 transition-colors group"> <Instagram size={16} className="group-hover:scale-110 transition-transform"/> <span className="text-xs font-bold">Photos</span> </a>
            <a href={social.tiktok} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 py-2 bg-gray-100 text-black rounded-lg hover:bg-gray-200 transition-colors group"> <Clapperboard size={16} className="group-hover:scale-110 transition-transform"/> <span className="text-xs font-bold">Viral</span> </a>
        </div>
      </div>
    </div>
  );
};