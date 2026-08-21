var KFOOD_FACTORY_TEMPLATE_VERSION = 'KFOOD_TEMPLATE_PACK_V1_20260821';

function kfoodFactoryTemplateContract() {
  return {
    appId: 'APP_KFOOD',
    seedRequired: ['seedId', 'sourceId', 'sourceUpdatedAt', 'sourceUrl', 'rightsStatus', 'dish', 'audience', 'ingredients', 'steps', 'storyAngle', 'imageUrl', 'imageAlt', 'products'],
    t1Required: ['source', 'dish', 'audience', 'ingredients', 'steps', 'storyAngle', 'image', 'products', 'commercePolicy'],
    t2Required: ['source_id', 'source_updated_at', 'posts'],
    guards: {
      sourceFreshnessHours: 48,
      priceProvenanceRequired: true,
      imageRequired: true,
      orderEnabled: false,
      paymentEnabled: false,
      publishStatus: 'WAITING_APPROVAL'
    },
    version: KFOOD_FACTORY_TEMPLATE_VERSION
  };
}

function inspectKfoodFactoryTemplateContract() {
  var contract = kfoodFactoryTemplateContract();
  return {
    ok: contract.appId === 'APP_KFOOD' && contract.guards.orderEnabled === false && contract.guards.paymentEnabled === false,
    contract: contract,
    safety: 'NO_TRIGGER_NO_DEPLOY_NO_PUBLISH'
  };
}

