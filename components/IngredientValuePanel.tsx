import React, { useMemo, useState } from 'react';
import { Product, Region } from '../types';
import {
  createDefaultIngredientValueSnapshot,
  loadIngredientValueSnapshot,
  normalizeIngredientValueSnapshot,
  saveIngredientValueSnapshot,
} from '../services/ingredientValueService.mjs';

interface IngredientValuePanelProps {
  product: Product;
  region: Region;
}

const storageAvailable = () => typeof window !== 'undefined' && Boolean(window.localStorage);

export const IngredientValuePanel: React.FC<IngredientValuePanelProps> = ({ product, region }) => {
  const initial = useMemo(() => {
    const fallback = createDefaultIngredientValueSnapshot(product, region);
    if (!storageAvailable()) return fallback;
    return loadIngredientValueSnapshot(window.localStorage, product.id) || fallback;
  }, [product.id, region]);

  const [snapshot, setSnapshot] = useState(initial);

  const updateNumber = (field: 'purchaseQuantity' | 'measuredYield' | 'remainingQuantity', value: string) => {
    const nextInput = { ...snapshot, [field]: Number(value) };
    const next = normalizeIngredientValueSnapshot(nextInput);
    if (storageAvailable()) saveIngredientValueSnapshot(window.localStorage, next);
    setSnapshot(next);
  };

  const money = (value: number) => snapshot.currency === 'KRW'
    ? `₩${Math.round(value).toLocaleString()}`
    : `$${value.toFixed(2)}`;

  return (
    <div className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div>
          <p className="text-[11px] font-bold text-gray-900">재료 가성비 지도</p>
          <p className="text-[9px] text-gray-500">구매가·실측수율·잔량·다용도를 기기 안에 저장합니다.</p>
        </div>
        <span className="text-[9px] font-bold text-emerald-700">재사용 {snapshot.reuseCount}</span>
      </div>

      <div className="grid grid-cols-3 gap-1.5 mb-2">
        <label className="text-[8px] text-gray-500">구매수량
          <input className="mt-1 w-full rounded border border-gray-200 bg-white px-1 py-1 text-[9px]" type="number" min="0.01" step="0.01" value={snapshot.purchaseQuantity} onChange={(e) => updateNumber('purchaseQuantity', e.target.value)} />
        </label>
        <label className="text-[8px] text-gray-500">실측수율
          <input className="mt-1 w-full rounded border border-gray-200 bg-white px-1 py-1 text-[9px]" type="number" min="0.01" step="0.01" value={snapshot.measuredYield} onChange={(e) => updateNumber('measuredYield', e.target.value)} />
        </label>
        <label className="text-[8px] text-gray-500">남은수량
          <input className="mt-1 w-full rounded border border-gray-200 bg-white px-1 py-1 text-[9px]" type="number" min="0" step="0.01" value={snapshot.remainingQuantity} onChange={(e) => updateNumber('remainingQuantity', e.target.value)} />
        </label>
      </div>

      <div className="grid grid-cols-3 gap-1 text-center">
        <div className="rounded-lg bg-white p-1.5"><p className="text-[8px] text-gray-400">단위원가</p><p className="text-[10px] font-bold">{money(snapshot.unitCost)}</p></div>
        <div className="rounded-lg bg-white p-1.5"><p className="text-[8px] text-gray-400">실측원가</p><p className="text-[10px] font-bold">{money(snapshot.usableUnitCost)}</p></div>
        <div className="rounded-lg bg-white p-1.5"><p className="text-[8px] text-gray-400">잔량가치</p><p className="text-[10px] font-bold">{money(snapshot.remainingValue)}</p></div>
      </div>

      {(snapshot.derivedIngredients.length > 0 || snapshot.useCases.length > 0) && (
        <p className="mt-2 text-[8px] text-gray-500 line-clamp-2">
          파생/다용도: {[...snapshot.derivedIngredients, ...snapshot.useCases].join(' · ')}
        </p>
      )}
    </div>
  );
};
