import React, { useMemo, useRef, useState } from 'react';
import {
  Camera,
  CheckCircle2,
  FileText,
  ImageIcon,
  Link as LinkIcon,
  Loader2,
  ShoppingBasket,
  Sparkles,
  Upload,
  User,
  X,
} from 'lucide-react';
import { analyzeKitchenImage } from '../services/geminiService';
import { CommunitySubmissionKind, Post, Region, Tag } from '../types';
import { ProductTag } from './ProductTag';
import { createTagsFromAnalysis } from '../utils/tagUtils';
import { buildCommunityTemplateDraft, inferSubmissionKind } from '../services/communityTemplateService.js';
import { submitCommunityDraft } from '../services/communityIntakeService.js';

interface UploadWizardProps {
  onClose: () => void;
  onPostCreated: (post: Post) => void;
  region: Region;
}

export const UploadWizard: React.FC<UploadWizardProps> = ({ onClose, onPostCreated, region }) => {
  const [step, setStep] = useState<'upload' | 'analyzing' | 'results'>('upload');
  const [submissionKind, setSubmissionKind] = useState<CommunitySubmissionKind>('food_photo');
  const [imagePreview, setImagePreview] = useState('');
  const [originalFileName, setOriginalFileName] = useState('community-upload.jpg');
  const [generatedTags, setGeneratedTags] = useState<Tag[]>([]);
  const [authorName, setAuthorName] = useState('');
  const [servings, setServings] = useState(4);
  const [receiptTotal, setReceiptTotal] = useState('');
  const [activeTagId, setActiveTagId] = useState<string | null>(null);
  const [analysisTimestamp, setAnalysisTimestamp] = useState(Date.now());
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const draft = useMemo(() => {
    if (!imagePreview) return null;
    const numericTotal = Number(receiptTotal);
    return buildCommunityTemplateDraft({
      sourceKind: submissionKind,
      authorName: authorName.trim() || 'Guest Chef',
      imageUrl: imagePreview,
      tags: generatedTags,
      servings,
      receiptTotal: Number.isFinite(numericTotal) && numericTotal > 0 ? numericTotal : undefined,
      currency: region === Region.KR ? 'KRW' : 'USD',
      originalFileName,
      locale: region === Region.KR ? 'ko-KR' : 'en-US',
      storageStatus: 'LOCAL_TEST',
      now: analysisTimestamp,
    }) as Post;
  }, [analysisTimestamp, authorName, generatedTags, imagePreview, originalFileName, receiptTotal, region, servings, submissionKind]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const kind = inferSubmissionKind(file.name, file.type) as CommunitySubmissionKind;
    setSubmissionKind(kind);
    setOriginalFileName(file.name);
    setAnalysisTimestamp(Date.now());
    setMessage('');

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
      void analyzeSubmission(base64);
    };
    reader.onerror = () => setMessage('사진을 읽지 못했습니다. 다른 사진을 선택해 주세요.');
    reader.readAsDataURL(file);
  };

  const analyzeSubmission = async (base64Full: string) => {
    setStep('analyzing');
    try {
      const items = await analyzeKitchenImage(base64Full.split(',')[1]);
      setGeneratedTags(createTagsFromAnalysis(items));
      setStep('results');
    } catch (error) {
      console.error('Community analysis failed:', error);
      setGeneratedTags([]);
      setMessage('자동 판독에 실패했습니다. 사진은 검수대기 템플릿으로 만들 수 있습니다.');
      setStep('results');
    }
  };

  const handleSave = async () => {
    if (!draft) return;
    setIsSaving(true);
    setMessage('');
    try {
      const endpoint = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env?.VITE_COMMUNITY_INGEST_URL || '';
      const result = await submitCommunityDraft({ post: draft, originalFileName, endpoint });
      const completed: Post = {
        ...draft,
        communityTemplate: draft.communityTemplate
          ? { ...draft.communityTemplate, storageStatus: result.status }
          : undefined,
      };
      onPostCreated(completed);
    } catch (error) {
      console.error('Community save failed:', error);
      setMessage('Drive 저장 테스트에 실패했습니다. 게시하지 않고 사진을 유지합니다.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[88vh]">
        <header className="px-6 py-4 border-b flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-orange-600 text-white"><Sparkles size={18} /></span>
            <div>
              <h2 className="font-bold text-lg">고객 음식 자동 템플릿</h2>
              <p className="text-xs text-gray-500">사진 한 장을 음식 소개와 재료 구매 카드로 바꿉니다.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><X size={20} /></button>
        </header>

        <div className="flex-1 overflow-hidden bg-gray-50">
          {step === 'upload' && (
            <div className="h-full flex items-center justify-center p-8">
              <div className="w-full max-w-2xl space-y-5">
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setSubmissionKind('food_photo')} className={`p-4 rounded-2xl border text-left ${submissionKind === 'food_photo' ? 'border-orange-500 bg-orange-50' : 'bg-white border-gray-200'}`}>
                    <ImageIcon size={24} className="text-orange-600 mb-2" />
                    <b className="text-sm">음식 사진</b>
                    <p className="text-xs text-gray-500 mt-1">음식명·재료·구매 링크 생성</p>
                  </button>
                  <button onClick={() => setSubmissionKind('receipt')} className={`p-4 rounded-2xl border text-left ${submissionKind === 'receipt' ? 'border-orange-500 bg-orange-50' : 'bg-white border-gray-200'}`}>
                    <FileText size={24} className="text-orange-600 mb-2" />
                    <b className="text-sm">영수증 사진</b>
                    <p className="text-xs text-gray-500 mt-1">구매 품목을 가족 식단 카드로 변환</p>
                  </button>
                </div>
                <div onClick={() => fileInputRef.current?.click()} className="h-72 border-3 border-dashed border-gray-300 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 hover:bg-orange-50 gap-4">
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  <span className="w-20 h-20 bg-white rounded-full shadow flex items-center justify-center text-orange-600"><Camera size={40} /></span>
                  <div className="text-center">
                    <p className="font-bold text-xl">사진 한 장 올리기</p>
                    <p className="text-sm text-gray-500 mt-1">다른 내용을 쓰지 않아도 플랫폼 양식을 먼저 만듭니다.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 'analyzing' && (
            <div className="h-full flex flex-col items-center justify-center">
              <Loader2 size={58} className="animate-spin text-orange-600" />
              <h3 className="font-bold text-xl mt-6">우리 플랫폼 양식을 적용하고 있습니다.</h3>
              <p className="text-sm text-gray-500 mt-2">음식과 구매 가능한 재료를 확인합니다.</p>
            </div>
          )}

          {step === 'results' && draft && (
            <div className="h-full flex flex-col md:flex-row">
              <div className="md:w-3/5 bg-black flex items-center justify-center p-4 overflow-hidden">
                <div className="relative inline-block">
                  <img src={imagePreview} alt="고객 음식" className="max-w-full max-h-[78vh] object-contain block" />
                  {generatedTags.map((tag) => (
                    <ProductTag key={tag.id} tag={tag} region={region} isOpen={activeTagId === tag.id} onToggle={(id) => setActiveTagId(activeTagId === id ? null : id)} />
                  ))}
                  <span className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black/70 text-white rounded-full text-xs whitespace-nowrap">
                    {generatedTags.length}개 구매 카드 생성
                  </span>
                </div>
              </div>

              <div className="md:w-2/5 bg-white flex flex-col border-l overflow-hidden">
                <div className="p-5 border-b">
                  <div className="flex justify-between items-center gap-2">
                    <h3 className="font-bold text-lg">플랫폼 양식 미리보기</h3>
                    <span className="text-[11px] font-bold px-2 py-1 rounded-full bg-green-100 text-green-700 flex items-center gap-1"><CheckCircle2 size={13} /> family-budget-v1</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{draft.title}</p>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-5">
                  {message && <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">{message}</div>}
                  <div className="rounded-2xl border bg-gray-50 p-4 space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">자료 종류</span><b>{draft.communityTemplate?.sourceLabel}</b></div>
                    <div className="flex justify-between gap-3"><span className="text-gray-500">자동 음식명</span><b className="text-right">{draft.communityTemplate?.dishName}</b></div>
                    <div className="flex justify-between"><span className="text-gray-500">재료 카드</span><b>{draft.communityTemplate?.ingredientCount}개</b></div>
                    <div className="flex justify-between"><span className="text-gray-500">상태</span><b className={draft.communityTemplate?.verificationStatus === 'AUTO_FORMATTED' ? 'text-green-700' : 'text-amber-700'}>{draft.communityTemplate?.verificationStatus === 'AUTO_FORMATTED' ? '자동 양식 완료' : '검수 필요'}</b></div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500">가족 인원</label>
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {[1, 2, 4, 6].map((count) => <button key={count} onClick={() => setServings(count)} className={`py-2 rounded-lg border text-xs font-bold ${servings === count ? 'bg-gray-900 text-white' : 'bg-white'}`}>{count}명</button>)}
                    </div>
                  </div>

                  {submissionKind === 'receipt' && (
                    <div>
                      <label className="text-xs font-bold text-gray-500">영수증 총액 · 자동값 수정 가능</label>
                      <input type="number" min="0" value={receiptTotal} onChange={(event) => setReceiptTotal(event.target.value)} placeholder={region === Region.KR ? '예: 18700' : '예: 18.70'} className="mt-2 w-full px-3 py-2.5 border rounded-xl text-sm" />
                    </div>
                  )}

                  <div>
                    <h4 className="font-bold text-sm flex items-center gap-2 mb-3"><ShoppingBasket size={18} className="text-orange-600" />바로 구매할 재료</h4>
                    {generatedTags.length === 0 ? <p className="p-6 text-center text-sm text-gray-400 border border-dashed rounded-xl">재료 판독 결과가 없어 검수대기로 저장합니다.</p> : (
                      <div className="space-y-2">
                        {generatedTags.map((tag, index) => (
                          <div key={tag.id} className="flex items-center gap-3 p-3 border rounded-xl">
                            <span className="w-7 h-7 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold">{index + 1}</span>
                            <div className="min-w-0 flex-1"><b className="block text-sm truncate">{tag.product.nameKr || tag.product.nameEn}</b><span className="text-xs text-orange-600 flex items-center gap-1 mt-1"><LinkIcon size={11} />국가별 구매 링크 준비됨</span></div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-5 border-t bg-gray-50 space-y-3">
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-3 text-gray-400" />
                    <input value={authorName} onChange={(event) => setAuthorName(event.target.value)} placeholder="참여자 닉네임 · 선택" className="w-full pl-9 pr-3 py-2.5 border rounded-xl text-sm" />
                  </div>
                  <button onClick={handleSave} disabled={isSaving} className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:bg-gray-400">
                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                    {isSaving ? 'Drive 저장·게시 테스트 중...' : '우리 템플릿으로 게시'}
                  </button>
                  <p className="text-[11px] text-center text-gray-500">Apps Script 주소가 없으면 LOCAL_TEST, 연결되면 같은 자료가 Drive에 저장됩니다.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
