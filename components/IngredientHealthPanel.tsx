import React from 'react';
import { BookOpen, ExternalLink, FlaskConical, Leaf, ShieldAlert } from 'lucide-react';
import { Product } from '../types';

type HealthLayer = 'NUTRITION' | 'TRADITIONAL_USE' | 'MODERN_EVIDENCE' | 'SAFETY';
type HealthStatus = 'VERIFIED' | 'PENDING' | 'UNKNOWN';

interface HealthClaim {
  layer: HealthLayer;
  status: HealthStatus;
  evidenceLevel: string;
  summary: string;
  sourceUrl?: string;
  sourceDate?: string;
}

interface IngredientHealthProfile {
  ingredientId: string;
  reviewedAt: string;
  nutrition: HealthClaim[];
  traditionalUse: HealthClaim[];
  modernEvidence: HealthClaim[];
  safety: HealthClaim[];
}

interface IngredientHealthPanelProps {
  product: Product;
}

const sectionMeta = {
  SAFETY: { label: 'Safety first', Icon: ShieldAlert },
  NUTRITION: { label: 'Nutrition', Icon: Leaf },
  MODERN_EVIDENCE: { label: 'Modern evidence', Icon: FlaskConical },
  TRADITIONAL_USE: { label: 'Traditional use', Icon: BookOpen },
} as const;

const ClaimRow: React.FC<{ claim: HealthClaim }> = ({ claim }) => {
  const pending = claim.status !== 'VERIFIED';
  return (
    <li className="rounded-lg border border-gray-100 bg-gray-50 p-2.5">
      <div className="flex items-start justify-between gap-2">
        <p className={`text-[11px] leading-relaxed ${pending ? 'text-gray-500' : 'text-gray-700'}`}>
          {claim.summary}
        </p>
        <span className="shrink-0 rounded bg-white px-1.5 py-0.5 text-[9px] font-semibold text-gray-500 ring-1 ring-gray-200">
          {pending ? claim.status : claim.evidenceLevel}
        </span>
      </div>
      {claim.sourceUrl && (
        <a
          href={claim.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-1.5 inline-flex items-center gap-1 text-[9px] font-medium text-orange-700 hover:underline"
        >
          Source <ExternalLink size={10} />
        </a>
      )}
    </li>
  );
};

export const IngredientHealthPanel: React.FC<IngredientHealthPanelProps> = ({ product }) => {
  const profile = (product as Product & { healthProfile?: IngredientHealthProfile }).healthProfile;
  if (!profile) return null;

  const sections: Array<{ key: keyof Pick<IngredientHealthProfile, 'safety' | 'nutrition' | 'modernEvidence' | 'traditionalUse'>; layer: keyof typeof sectionMeta }> = [
    { key: 'safety', layer: 'SAFETY' },
    { key: 'nutrition', layer: 'NUTRITION' },
    { key: 'modernEvidence', layer: 'MODERN_EVIDENCE' },
    { key: 'traditionalUse', layer: 'TRADITIONAL_USE' },
  ];

  return (
    <section className="mb-4 rounded-xl border border-orange-100 bg-orange-50/50 p-3" aria-label="Ingredient health evidence">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <h5 className="text-xs font-bold text-gray-900">Ingredient health evidence</h5>
          <p className="mt-0.5 text-[9px] leading-relaxed text-gray-500">
            Nutrition, traditional use, modern evidence and safety are kept separate. This is not diagnosis or treatment advice.
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-white px-2 py-1 text-[9px] font-semibold text-gray-500 ring-1 ring-orange-100">
          Reviewed {new Date(profile.reviewedAt).toLocaleDateString()}
        </span>
      </div>

      <div className="space-y-2.5">
        {sections.map(({ key, layer }) => {
          const claims = profile[key];
          if (!claims.length) return null;
          const { label, Icon } = sectionMeta[layer];
          return (
            <div key={layer}>
              <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-gray-600">
                <Icon size={12} /> {label}
              </div>
              <ul className="space-y-1.5">
                {claims.map((claim, index) => <ClaimRow key={`${layer}-${index}`} claim={claim} />)}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
};
