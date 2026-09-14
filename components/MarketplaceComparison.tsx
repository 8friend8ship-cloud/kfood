import React, { useEffect, useMemo, useState } from 'react';
import { ExternalLink, Loader2, MapPin, RefreshCw, Truck } from 'lucide-react';
import { Product, Region } from '../types';
import {
  CommerceComparisonResult,
  CommerceOffer,
  compareMarketplaceOffers,
  requestPreciseVisitorLocation,
} from '../services/commerceRoutingService';

interface MarketplaceComparisonProps {
  product: Product;
  region: Region;
  active: boolean;
}

const money = (offer: CommerceOffer) => {
  if (offer.totalPrice == null) return '가격 확인 필요';
  if (offer.currency === 'KRW') return `₩${Math.round(offer.totalPrice).toLocaleString()}`;
  return `${offer.currency || ''} ${offer.totalPrice.toFixed(2)}`.trim();
};

const deliveryText = (offer: CommerceOffer) => {
  if (offer.deliveryStatus === 'DELIVERABLE') return offer.deliveryEta ? `배송 가능 · ${offer.deliveryEta}` : '배송 가능';
  if (offer.deliveryStatus === 'NOT_DELIVERABLE') return '현재 지역 배송 불가';
  return '배송 여부 확인 필요';
};

export const MarketplaceComparison: React.FC<MarketplaceComparisonProps> = ({ product, region, active }) => {
  const [result, setResult] = useState<CommerceComparisonResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [preciseLoading, setPreciseLoading] = useState(false);

  const load = async (position?: GeolocationPosition | null) => {
    setLoading(true);
    try {
      setResult(await compareMarketplaceOffers(product, region, position));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!active || result || loading) return;
    load();
  }, [active, product.id]);

  const ordered = useMemo(() => {
    if (!result) return [];
    return [...result.offers].sort((a, b) => {
      if (a.provider === result.recommendedProvider) return -1;
      if (b.provider === result.recommendedProvider) return 1;
      if (a.deliveryStatus === 'DELIVERABLE' && b.deliveryStatus !== 'DELIVERABLE') return -1;
      if (b.deliveryStatus === 'DELIVERABLE' && a.deliveryStatus !== 'DELIVERABLE') return 1;
      return 0;
    });
  }, [result]);

  const requestLocationAndReload = async () => {
    setPreciseLoading(true);
    try {
      const position = await requestPreciseVisitorLocation();
      if (position) {
        setResult(null);
        await load(position);
      }
    } finally {
      setPreciseLoading(false);
    }
  };

  if (!active) return null;

  return (
    <div className="mb-3 rounded-xl border border-gray-200 bg-gray-50/80 p-3">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div>
          <p className="text-[11px] font-bold text-gray-900">지역별 가격·배송 비교</p>
          <p className="text-[9px] text-gray-500">확인된 배송 가능 상품만 ‘추천’으로 승격합니다.</p>
        </div>
        {loading && <Loader2 size={15} className="animate-spin text-orange-500" />}
      </div>

      {result && (
        <>
          <div className="flex items-center justify-between gap-2 mb-2 text-[9px] text-gray-500">
            <span className="flex items-center gap-1"><MapPin size={11} /> {result.context.countryCode} · {result.context.locationPrecision === 'PRECISE' ? '현재 위치 반영' : '국가 기준'}</span>
            {result.context.locationPrecision !== 'PRECISE' && (
              <button
                onClick={requestLocationAndReload}
                disabled={preciseLoading}
                className="font-bold text-orange-700 hover:text-orange-800 disabled:opacity-50"
              >
                {preciseLoading ? '위치 확인 중…' : '내 주변으로 다시 비교'}
              </button>
            )}
          </div>

          <div className="space-y-1.5">
            {ordered.map((offer) => {
              const recommended = offer.provider === result.recommendedProvider;
              return (
                <a
                  key={offer.provider}
                  href={offer.url}
                  target="_blank"
                  rel="noreferrer sponsored"
                  className={`block rounded-lg border p-2 transition-colors ${recommended ? 'border-orange-300 bg-orange-50' : 'border-gray-200 bg-white hover:bg-gray-50'}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-gray-900">{offer.label}</span>
                        {recommended && <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-orange-600 text-white">추천</span>}
                        {!offer.live && <span className="text-[8px] text-gray-400">저장/검색값</span>}
                      </div>
                      <p className="text-[9px] text-gray-500 truncate">{deliveryText(offer)}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="text-right">
                        <div className="text-[10px] font-bold text-gray-900">{money(offer)}</div>
                        {offer.unitCost != null && (
                          <div className="text-[8px] text-gray-500">단위당 {offer.currency || ''} {offer.unitCost.toFixed(2)}{offer.unitLabel ? `/${offer.unitLabel}` : ''}</div>
                        )}
                      </div>
                      <ExternalLink size={12} className="text-gray-400" />
                    </div>
                  </div>
                  {offer.deliveryStatus === 'DELIVERABLE' && (
                    <div className="mt-1 flex items-center gap-1 text-[8px] text-emerald-700"><Truck size={10} /> 배송 확인됨</div>
                  )}
                </a>
              );
            })}
          </div>

          {result.recommendationReason && (
            <p className="mt-2 text-[9px] font-medium text-orange-800">{result.recommendationReason}</p>
          )}

          <button
            onClick={() => load()}
            className="mt-2 inline-flex items-center gap-1 text-[9px] font-bold text-gray-600 hover:text-gray-900"
          >
            <RefreshCw size={10} /> 다시 확인
          </button>
        </>
      )}
    </div>
  );
};
