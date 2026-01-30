import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Loader2, Sparkles, CheckCircle, User } from 'lucide-react';
import { analyzeKitchenImage } from '../services/geminiService';
import { DetectedItem, Post, Tag, Region } from '../types';
import { ProductTag } from './ProductTag';

interface UploadWizardProps {
  onClose: () => void;
  onSave: (post: Post) => void;
  region: Region;
}

export const UploadWizard: React.FC<UploadWizardProps> = ({ onClose, onSave, region }) => {
  const [step, setStep] = useState<'upload' | 'analyzing' | 'results'>('upload');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [generatedTags, setGeneratedTags] = useState<Tag[]>([]);
  const [authorName, setAuthorName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
      startAnalysis(base64);
    };
    reader.readAsDataURL(file);
  };

  const startAnalysis = async (base64Full: string) => {
    setStep('analyzing');
    // Extract base64 data part
    const base64Data = base64Full.split(',')[1];
    const items = await analyzeKitchenImage(base64Data);
    
    // Generate tags using bounding box data from Gemini
    const tags: Tag[] = items.map((item, index) => {
      let x = 50;
      let y = 50;

      // Calculate center position from bounding box [ymin, xmin, ymax, xmax]
      // Ensure coordinates are within 0-100 range
      if (item.boundingBox && item.boundingBox.length === 4) {
        const [ymin, xmin, ymax, xmax] = item.boundingBox;
        y = (ymin + ymax) / 2;
        x = (xmin + xmax) / 2;
        
        // Clamp values just in case
        x = Math.max(0, Math.min(100, x));
        y = Math.max(0, Math.min(100, y));
      } else {
        // Fallback: Distribute slightly if no bbox
        x = 30 + (Math.random() * 40);
        y = 30 + (Math.random() * 40);
      }

      return {
        id: `new-tag-${Date.now()}-${index}`,
        x,
        y,
        product: {
          id: `new-prod-${Date.now()}-${index}`,
          nameEn: item.name,
          nameKr: item.koreanName || item.name,
          description: item.description,
          priceUsd: 25.00 + (index * 5),
          priceKr: 29000 + (index * 5000),
          category: item.suggestedCategory,
          links: {
            global: `https://amazon.com/s?k=${encodeURIComponent(item.name)}`,
            kr: `https://coupang.com/np/search?q=${encodeURIComponent(item.koreanName || item.name)}`
          },
          image: base64Full 
        }
      };
    });

    setGeneratedTags(tags);
    setStep('results');
  };

  const handleSave = () => {
    if (!imagePreview) return;

    const newPost: Post = {
      id: `post-${Date.now()}`,
      title: 'My K-Kitchen Discovery',
      author: authorName.trim() || 'Guest Chef',
      imageUrl: imagePreview,
      description: `Look at these authentic Korean items! I found ${generatedTags.length} treasures.`,
      tags: generatedTags,
      likes: 0
    };

    onSave(newPost);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[85vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white z-10">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white p-1.5 rounded-lg">
              <Sparkles size={18} />
            </div>
            <h2 className="font-bold text-lg">AI Kitchen Scanner</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-hidden bg-gray-50 flex flex-col md:flex-row">
          
          {/* STEP 1: UPLOAD & ANALYZING VIEW */}
          {step !== 'results' && (
            <div className="w-full h-full flex items-center justify-center p-8">
               {step === 'upload' ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-full max-h-96 border-3 border-dashed border-gray-300 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-all group gap-4"
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                    accept="image/*"
                  />
                  <div className="w-20 h-20 bg-white rounded-full shadow-md flex items-center justify-center text-gray-400 group-hover:text-orange-500 transition-colors">
                    <Camera size={40} />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-xl text-gray-900">Upload Cooking Photo</p>
                    <p className="text-gray-500 mt-1">We'll find the hidden K-Tools for you</p>
                  </div>
                </div>
               ) : (
                <div className="text-center">
                  <div className="relative inline-block">
                    <div className="absolute inset-0 bg-orange-200 rounded-full animate-ping opacity-20"></div>
                    <Loader2 size={64} className="text-orange-600 animate-spin relative z-10" />
                  </div>
                  <h3 className="mt-8 font-bold text-gray-900 text-xl">Analyzing your Kitchen...</h3>
                  <p className="text-gray-500 mt-2">Scanning for food and tool locations...</p>
                </div>
               )}
            </div>
          )}

          {/* STEP 3: RESULTS (Split View) */}
          {step === 'results' && imagePreview && (
            <>
              {/* Left: Interactive Image */}
              <div className="w-full md:w-2/3 bg-black flex items-center justify-center overflow-hidden p-4">
                {/* 
                  Wrapper div to ensure tags are positioned relative to the IMAGE itself, 
                  not the black background container. 
                */}
                <div className="relative inline-block max-w-full max-h-full">
                  <img 
                    src={imagePreview} 
                    alt="Analyzed" 
                    className="max-w-full max-h-[75vh] object-contain block" 
                  />
                  
                  {/* Overlay Tags */}
                  {generatedTags.map((tag) => (
                    <ProductTag key={tag.id} tag={tag} region={region} />
                  ))}
                  
                  {/* Success Badge */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1.5 rounded-full backdrop-blur-md text-xs font-medium whitespace-nowrap border border-white/20">
                     {generatedTags.length} Items Found
                  </div>
                </div>
              </div>

              {/* Right: Item List & Actions */}
              <div className="w-full md:w-1/3 bg-white border-l border-gray-200 flex flex-col h-full">
                <div className="p-5 border-b border-gray-100 shrink-0">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-sm">AI Results</span>
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Authentic items found at specific locations.
                  </p>
                </div>
                
                <div className="flex-1 overflow-y-auto p-5 space-y-3">
                  {generatedTags.length === 0 ? (
                    <div className="text-center text-gray-400 py-10">
                      <p>No items detected clearly.</p>
                      <p className="text-xs mt-2">Try a closer photo.</p>
                    </div>
                  ) : (
                    generatedTags.map((tag, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50 transition-colors cursor-default">
                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs shrink-0">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-sm">{tag.product.nameEn}</div>
                          <div className="text-xs text-orange-600 font-medium">{tag.product.nameKr}</div>
                          <div className="text-xs text-gray-400 mt-1">{tag.product.description}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-5 border-t border-gray-100 bg-gray-50 space-y-3 shrink-0">
                  {/* Author Name Input */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Chef Nickname</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <User size={16} />
                      </div>
                      <input 
                        type="text" 
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        placeholder="Ex: KimCooks" 
                        className="block w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <button 
                    onClick={handleSave} 
                    className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors shadow-lg flex items-center justify-center gap-2"
                  >
                    <Upload size={18} />
                    Post to Community
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};