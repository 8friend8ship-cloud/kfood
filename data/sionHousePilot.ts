/**
 * SION HOUSE <> K-Food pilot contract.
 * No misleading item-level checkout: shopping links are disabled until
 * real furniture/appliance mesh, SKU, market and publisher approval all pass.
 */
export type SionHouseMarket = 'KR' | 'US' | 'JP' | 'SG';
export type SionHouseGoodsKind = 'ingredient' | 'tool' | 'tableware' | 'appliance' | 'furniture' | 'decor';
export type SionHouseLinkStatus = 'HOLD' | 'VERIFIED';
export interface SionHouseIngredient { id: string; ko: string; amount: string; }
export interface SionHouseDish {
  id: string;
  nameKo: string;
  nameEn: string;
  ingredients: readonly SionHouseIngredient[];
  stepsKo: readonly string[];
  allergenNoteKo: string;
}
export interface SionHouseHotspot {
  id: string;
  kind: SionHouseGoodsKind;
  labelKo: string;
  unrealActorPath: string | null;
  merchantId: string | null;
  sku: string | null;
  links: Partial<Record<SionHouseMarket, string>>;
  status: SionHouseLinkStatus;
  disclosureRequired: true;
}
export const SION_HOUSE_BREAKFAST_EP001 = {
  id: 'SION-HOUSE-BREAKFAST-001',
  source: 'SketchUp Cheongdam Xi 21p / D5 owner project (source verified on Drive; not imported to UE)',
  houseWorldStatus: 'UNREAL_IMPORT_PENDING',
  videoStatus: 'NOT_RENDERED',
  recipeStatus: 'EDITORIAL_DRAFT_NOT_TASTE_TESTED',
  titleKo: '시온의 아침 한식상',
  titleEn: "Sion's Korean Breakfast Table",
  servings: 1,
  prepMinutesEstimate: 15,
  cookMinutesEstimate: 20,
  dishes: [
    {id: 'egg_roll', nameKo: '계란말이', nameEn: 'Korean Rolled Omelet', ingredients: [
      {id: 'egg',ko:'달걀',amount:'2개'},{id:'carrot',ko:'당근',amount:'15g'},
      {id:'scallion',ko:'대파',amount:'15g'},{id:'oil',ko:'식용유',amount:'5ml'}
    ], stepsKo:['채소를 아주 잘게 썰고 달걀과 섞습니다.','약불에서 여러 번 나누어 붓고 속까지 충분히 익힙니다.'], allergenNoteKo:'달걀 알레르기 확인'} ,
    {id:'doenjang_soup',nameKo:'된장국',nameEn:'Soybean Paste Soup',ingredients:[
      {id:'water',ko:'물',amount:'350ml'},{id:'doenjang',ko:'된장',amount:'15g'},
      {id:'tofu',ko:'두부',amount:'100g'},{id:'zucchini',ko:'애호박',amount:'50g'},{id:'scallion',ko:'대파',amount:'10g'}
    ],stepsKo:['물을 끓이고 된장을 푼 뒤 애호박과 두부를 넣습니다.','충분히 끓이고 대파를 넣어 간을 확인합니다.'],allergenNoteKo:'대두 및 제품별 밀 함유 여부 확인'},
    {id:'rice',nameKo:'밥',nameEn:'Steamed Rice',ingredients:[{id:'rice',ko:'익힌 밥',amount:'150g'}],stepsKo:['적절히 보관·가열한 밥을 공기에 담습니다.'],allergenNoteKo:'남은 밥은 상온에 오래 두지 않습니다.'},
    {id:'kimchi',nameKo:'김치',nameEn:'Kimchi',ingredients:[{id:'kimchi',ko:'김치',amount:'40g'}],stepsKo:['깨끗한 집게로 접시에 담습니다.'],allergenNoteKo:'어패류 액젓 성분 포함 여부 확인'}
  ] as readonly SionHouseDish[],
  hotspots:[
    {id:'induction',kind:'appliance',labelKo:'조리기기'},
    {id:'rice_cooker',kind:'appliance',labelKo:'밥솥'},
    {id:'frying_pan',kind:'tool',labelKo:'프라이팬'},
    {id:'pot',kind:'tool',labelKo:'냄비'},
    {id:'bowl',kind:'tableware',labelKo:'국그릇'},
    {id:'dining_table',kind:'furniture',labelKo:'식탁'},
    {id:'pendant_light',kind:'decor',labelKo:'펜던트 조명'}
  ].map(({id,kind,labelKo})=>({id,kind:kind as SionHouseGoodsKind,labelKo,unrealActorPath:null,merchantId:null,sku:null,
    links:{} as Partial<Record<SionHouseMarket,string>>,status:'HOLD' as const,disclosureRequired:true as const})) as SionHouseHotspot[],
  appDeeplink: null as string | null,
  purchaseStatus: 'HOLD_UNTIL_SKU_RIGHTS_APP_CHANNEL_AND_COUNTRY_VERIFIED',
} as const;

export function isSionHouseProductLinkReady(hotspot:SionHouseHotspot, market:SionHouseMarket, publisherApproved:boolean):boolean {
 return Boolean(publisherApproved && hotspot.status==='VERIFIED' && hotspot.unrealActorPath && hotspot.merchantId && hotspot.sku && hotspot.links[market]?.startsWith('https://'));
}
