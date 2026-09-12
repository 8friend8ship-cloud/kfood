export type IngredientState = 'raw' | 'cooked' | 'frozen' | 'leftover' | 'unknown';

export interface RecipeIngredientInput {
  name: string;
  state?: IngredientState;
  qty?: number;
  unit?: string;
  expiry?: string;
}

export interface RecipeCaseInput {
  ingredients: RecipeIngredientInput[];
  tools?: string[];
  timeLimitMinutes?: number;
  servings?: number;
  tastePreferences?: string[];
  allergies?: string[];
  exclude?: string[];
  sourceContext?: {
    sourceStatus?: 'VERIFIED' | 'SOURCE_UNCONFIRMED' | 'INTERNAL_FORMULA';
    sourceLabel?: string;
  };
}

export interface RecipeCase {
  id: string;
  title: string;
  format: 'mousse' | 'dip' | 'spread' | 'puree' | 'salad-cream' | 'brunch';
  score: number;
  reasons: string[];
  risks: string[];
  substitutions: string[];
  recoveryPlan: string[];
  leftoverNextUse: string[];
  sourceStatus: 'VERIFIED' | 'SOURCE_UNCONFIRMED' | 'INTERNAL_FORMULA';
  templatePromotionAllowed: boolean;
}

const normalize = (value: string) => value.trim().toLowerCase().replace(/\s+/g, '_');

const hasIngredient = (input: RecipeCaseInput, names: string[]) => {
  const set = new Set(input.ingredients.map((item) => normalize(item.name)));
  return names.some((name) => set.has(normalize(name)));
};

const baseRecovery = [
  '묽으면 감자 또는 리코타를 조금 추가한다.',
  '뻑뻑하면 우유·유청·물을 1큰술씩 추가한다.',
  '대파 향이 강하면 감자나 리코타를 늘려 희석한다.',
  '너무 달면 소금 한 꼬집 또는 레몬즙 소량으로 균형을 잡는다.',
];

export function generateRecipeCaseMatrix(input: RecipeCaseInput): RecipeCase[] {
  const sourceStatus = input.sourceContext?.sourceStatus ?? 'INTERNAL_FORMULA';
  const hasPotato = hasIngredient(input, ['감자', 'potato']);
  const hasTofu = hasIngredient(input, ['두부', 'tofu']);
  const hasRicotta = hasIngredient(input, ['리코타', '리코타치즈', 'ricotta']);
  const hasGreenOnion = hasIngredient(input, ['대파', '파', '쪽파', 'green_onion', 'scallion']);
  const hasHoney = hasIngredient(input, ['꿀', 'honey']);

  const commonReasons = [
    hasPotato ? '감자가 전분과 바디를 만든다.' : '감자 없음',
    hasRicotta ? '리코타가 크리미함을 만든다.' : '리코타 없음',
    hasTofu ? '두부가 담백함과 단백질을 보탠다.' : '두부 없음',
  ];

  const formats: RecipeCase['format'][] = ['mousse', 'dip', 'spread', 'puree', 'salad-cream', 'brunch'];

  return formats.map((format, index) => {
    let score = 60;
    const reasons = [...commonReasons];
    const risks: string[] = [];
    const substitutions: string[] = [];

    if (hasPotato && hasRicotta) score += 18;
    if (hasTofu) score += 8;
    if (hasGreenOnion) {
      score += 3;
      reasons.push('대파는 소량일 때 향 포인트가 된다.');
      risks.push('대파가 많으면 리코타와 꿀 맛을 덮을 수 있다.');
    } else {
      substitutions.push('대파 대신 쪽파·차이브·파슬리를 소량 사용 가능');
    }
    if (hasHoney) {
      score += format === 'brunch' ? 6 : 2;
      reasons.push('꿀은 소량일 때 둥근 단맛을 더한다.');
      risks.push('꿀이 많으면 짭짤한 무스가 디저트 방향으로 바뀐다.');
    }

    if (format === 'mousse') score += 8;
    if (format === 'dip') score += 6;
    if (format === 'spread') score += 5;
    if (format === 'puree') score += 4;
    if (format === 'salad-cream') score += 2;
    if (format === 'brunch') score += hasHoney ? 4 : -2;

    return {
      id: `CASE_${String(index + 1).padStart(2, '0')}_${format.toUpperCase().replace('-', '_')}`,
      title: {
        mousse: '감자·리코타·두부 무스',
        dip: '감자·리코타 두부 딥',
        spread: '리코타 감자 스프레드',
        puree: '두부 리코타 감자 퓌레',
        'salad-cream': '감자 리코타 샐러드 크림',
        brunch: '허니 리코타 감자 브런치 크림',
      }[format],
      format,
      score,
      reasons,
      risks,
      substitutions,
      recoveryPlan: [...baseRecovery],
      leftoverNextUse: ['토스트 스프레드', '샐러드 토핑', '구운 채소 딥', '샌드위치 속'],
      sourceStatus,
      templatePromotionAllowed: sourceStatus !== 'SOURCE_UNCONFIRMED',
    };
  });
}

export function pruneRecipeCases(cases: RecipeCase[]): RecipeCase[] {
  return cases
    .filter((item) => item.score >= 70)
    .map((item) => ({
      ...item,
      score: Math.min(100, item.score),
    }));
}

export function rankRecipeCases(cases: RecipeCase[]): RecipeCase[] {
  return [...cases].sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
}

export function buildRecipeRecoveryPlan(bestCase: RecipeCase | undefined): string[] {
  if (!bestCase) return ['추천 가능한 조합이 부족하므로 재료 또는 조리 조건을 다시 확인한다.'];
  return [...bestCase.recoveryPlan];
}

export function runRecipeCaseEngine(input: RecipeCaseInput) {
  const caseMatrix = generateRecipeCaseMatrix(input);
  const prunedCases = pruneRecipeCases(caseMatrix);
  const ranked = rankRecipeCases(prunedCases);
  const bestCase = ranked[0];
  const alternatives = ranked.slice(1, 4);

  return {
    caseMatrix,
    prunedCases,
    bestCase,
    alternatives,
    substitutions: Array.from(new Set(ranked.flatMap((item) => item.substitutions))),
    recoveryPlan: buildRecipeRecoveryPlan(bestCase),
    leftoverNextUse: Array.from(new Set(ranked.flatMap((item) => item.leftoverNextUse))),
    sourceStatus: bestCase?.sourceStatus ?? input.sourceContext?.sourceStatus ?? 'INTERNAL_FORMULA',
    safetyStatus: 'REQUIRES_STANDARD_FOOD_SAFETY_CHECK',
    testGate: bestCase?.templatePromotionAllowed ? 'TASTE_TEST_REQUIRED' : 'SOURCE_VERIFICATION_PENDING',
  };
}
