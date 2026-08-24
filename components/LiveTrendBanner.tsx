import React from 'react';

const TREND_STATES = ['재입고', '품절', '오픈런', '매장순례'];

export function LiveTrendBanner() {
  return (
    <section
      data-testid="kfood-live-trend"
      className="sticky top-0 z-[100] border-b border-emerald-200 bg-emerald-50/95 px-3 py-2 shadow-sm backdrop-blur"
      aria-label="K-Food LIVE 트렌드 상태"
    >
      <div className="mx-auto flex max-w-xl flex-wrap items-center gap-2 text-xs">
        <strong className="text-emerald-900">떡지순례 LIVE</strong>
        {TREND_STATES.map((state) => (
          <span
            key={state}
            className="rounded-full bg-white px-2 py-1 font-bold text-emerald-700 shadow-sm"
          >
            {state}
          </span>
        ))}
        <span className="ml-auto text-[10px] font-black text-emerald-700">FRONT APPLIED</span>
      </div>
    </section>
  );
}
