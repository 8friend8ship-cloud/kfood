import React from 'react';
import { SION_HOUSE_BREAKFAST_EP001 } from '../data/sionHousePilot';

/**
 * Feature preview. No affiliate purchase buttons or fake 3D footage:
 * source SketchUp/D5 model, live recipe validation and product mapping are HOLD.
 */
export const SionHousePilot: React.FC<{ globalView: boolean }> = ({ globalView }) => {
  const ep = SION_HOUSE_BREAKFAST_EP001;
  return (
    <section className="mb-8 rounded-2xl border border-amber-200 bg-white p-4 shadow-sm" aria-labelledby="sion-house-title">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold tracking-wide text-orange-700">SION HOUSE · KOREAN HOME FOOD</p>
          <h2 id="sion-house-title" className="mt-1 text-xl font-bold text-gray-900">
            {globalView ? ep.titleEn : ep.titleKo}
          </h2>
          <p className="mt-1 text-xs text-gray-500">
            {globalView
              ? 'A Korean breakfast episode from SION, a fictional 15-year-old virtual creator.'
              : '15세 가상 인플루언서 시온의 집에서 배우는 한국 아침상'}
          </p>
        </div>
        <span className="rounded-lg bg-orange-50 px-3 py-2 text-2xl" aria-hidden="true">🍚</span>
      </div>

      <p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
        {globalView
          ? 'Recipe preview only. The 3D house, cooking footage, price and shopping links have not been verified or published.'
          : '레시피 시안입니다. 청담자이 기반 3D 집·요리 영상·실제 상품 및 구매 링크는 검증 전이며 완성된 콘텐츠로 표시하지 않습니다.'}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-gray-700">
        <div className="rounded-lg bg-gray-50 p-3">
          <strong>{globalView ? 'Servings' : '인분'}</strong><span className="ml-2">{ep.servings}</span>
        </div>
        <div className="rounded-lg bg-gray-50 p-3">
          <strong>{globalView ? 'Estimated time' : '예상 시간'}</strong><span className="ml-2">{ep.prepMinutesEstimate + ep.cookMinutesEstimate}{globalView ? ' min' : '분'}</span>
        </div>
      </div>
      <div className="mt-3 space-y-2">
        {ep.dishes.map(dish => (
          <details key={dish.id} className="rounded-xl border border-gray-100 bg-white p-3">
            <summary className="cursor-pointer text-sm font-bold text-gray-800">
              {globalView ? dish.nameEn : dish.nameKo}
            </summary>
            <p className="mt-2 text-xs font-semibold text-gray-600">{globalView ? 'Ingredients' : '재료'}</p>
            <p className="text-xs leading-relaxed text-gray-600">
              {dish.ingredients.map(i => globalView ? i.id.replaceAll('_', ' ') + ' ' + i.amount : i.ko + ' ' + i.amount).join(' · ')}
            </p>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-xs text-gray-600">
              {dish.stepsKo.map((step, i) => <li key={i}>{step}</li>)}
            </ol>
            <p className="mt-2 text-xs text-amber-800">{dish.allergenNoteKo}</p>
          </details>
        ))}
      </div>

      <div className="mt-4 border-t border-gray-100 pt-3">
        <h3 className="text-sm font-bold text-gray-800">
          {globalView ? 'Kitchen items in this episode' : '시온 하우스에 등장할 주방·가구 소품'}
        </h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {ep.hotspots.map(item => (
            <span key={item.id} className="rounded-full bg-gray-100 px-3 py-1.5 text-xs text-gray-500">
              {item.labelKo} · {globalView ? 'Not linked' : '상품 확인 중'}
            </span>
          ))}
        </div>
        <p className="mt-3 text-xs text-gray-500">
          {globalView
            ? 'Verified item/SKU and approved country-specific affiliate links will appear only after the product matches the filmed 3D asset.'
            : '실제 매핑된 가전·가구·식기 모델과 판매 상품의 동일성, 국가별 승인 제휴 링크를 확인한 후에만 구매 기능을 연결합니다.'}
        </p>
      </div>
    </section>
  );
};
