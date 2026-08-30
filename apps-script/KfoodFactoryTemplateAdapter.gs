var KFOOD_FACTORY_TEMPLATE_VERSION = 'KFOOD_TEMPLATE_PACK_V2_HEALTH_20260830';

function kfoodFactoryTemplateContract() {
  return {
    appId: 'APP_KFOOD',
    seedRequired: ['seedId', 'sourceId', 'sourceUpdatedAt', 'sourceUrl', 'rightsStatus', 'dish', 'audience', 'ingredients', 'steps', 'storyAngle', 'imageUrl', 'imageAlt', 'products'],
    healthSeedRequired: ['ingredientId', 'reviewedAt', 'nutrition', 'traditionalUse', 'modernEvidence', 'safety'],
    healthClaimRequired: ['layer', 'status', 'evidenceLevel', 'summary'],
    t1Required: ['source', 'dish', 'audience', 'ingredients', 'steps', 'storyAngle', 'image', 'products', 'commercePolicy'],
    t2Required: ['source_id', 'source_updated_at', 'posts'],
    healthLayers: ['NUTRITION', 'TRADITIONAL_USE', 'MODERN_EVIDENCE', 'SAFETY'],
    healthStatuses: ['VERIFIED', 'PENDING', 'UNKNOWN'],
    guards: {
      sourceFreshnessHours: 48,
      priceProvenanceRequired: true,
      imageRequired: true,
      healthSourceRequiredWhenVerified: true,
      traditionalUseCannotPromoteToModernEvidence: true,
      safetySignalsRenderFirst: true,
      unsupportedHealthBenefitFallsBackTo: 'PENDING',
      diagnosisTreatmentClaimsAllowed: false,
      orderEnabled: false,
      paymentEnabled: false,
      publishStatus: 'WAITING_APPROVAL'
    },
    routing: {
      healthQueens: '14_QUEENS_RESEARCH_QUEUE',
      healthSeed: '35_INTERNAL_SEED_REGISTRY',
      ingredientRelation: '53_FOOD_RECIPE_ASSET_MAP',
      runtimeUsageContract: '79_FUNCTION_DATA_USAGE_MAP',
      runtimeQa: '80_DATA_RUNTIME_QA_LOG'
    },
    version: KFOOD_FACTORY_TEMPLATE_VERSION
  };
}

function inspectKfoodFactoryTemplateContract() {
  var contract = kfoodFactoryTemplateContract();
  return {
    ok: contract.appId === 'APP_KFOOD' &&
      contract.guards.orderEnabled === false &&
      contract.guards.paymentEnabled === false &&
      contract.guards.diagnosisTreatmentClaimsAllowed === false &&
      contract.healthLayers.length === 4,
    contract: contract,
    safety: 'NO_TRIGGER_NO_DEPLOY_NO_PUBLISH'
  };
}
