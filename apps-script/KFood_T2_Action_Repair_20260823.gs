const KFOOD_T2_ACTION_REPAIR_VERSION='KFOOD_T2_ACTION_REPAIR_V1_20260823';

/**
 * Converts only generic APP_KFOOD T2 rows into the current food-action
 * contract. Unknown price/stock/affiliate state remains explicit; no value is
 * fabricated. Merchant/product IDs are only used when the source provides one.
 */
function repairKFoodGenericT2ToActionPackage(){
  const ss=SpreadsheetApp.getActiveSpreadsheet(),sh=ss&&ss.getSheetByName('TEMPLATE_STAGE_2');
  if(!sh||sh.getLastRow()<2)return{ok:false,reason:'TEMPLATE_STAGE_2_MISSING_OR_EMPTY',fixed:0,version:KFOOD_T2_ACTION_REPAIR_VERSION};
  const last=sh.getLastRow(),start=Math.max(2,last-30),rows=sh.getRange(start,1,last-start+1,9).getValues();
  let fixed=0;
  rows.forEach(function(r,idx){
    if(String(r[1])!=='APP_KFOOD')return;
    const body=String(r[4]||'');if(!kfoodT2NeedsRepair_(body))return;
    const title=String(r[3]||'').trim(),urls=kfoodT2EvidenceUrls_(body),source=urls[0]||'';
    const pack={
      schema:'T2_KFOOD_COMMERCE_CREATOR_V2',
      product_id:'UNRESOLVED_CLUSTER_'+Utilities.base64EncodeWebSafe(title).slice(0,18),
      recipe_or_item:title,
      price:null,
      source:source,
      rights_status:'REFERENCE_METADATA_ONLY',
      availability:'CURRENT_CHECK_REQUIRED',
      affiliate_status:'DISABLED_UNTIL_VERIFIED_PRODUCT_AND_APPROVAL',
      content_seed:{type:'TREND_CLUSTER',summary:kfoodT2Hook_(body)},
      creator_angle:'VERIFY_CURRENT_AVAILABILITY_PRICE_AND_DERIVATIVES_BEFORE_RECOMMENDATION',
      cta:'현재 판매처·가격·재고를 확인한 뒤 실제 구매 가능한 후보만 보여줍니다.',
      freshness:{checked_at:new Date().toISOString(),state:'LIVE_RECHECK_REQUIRED'},
      writer_template_id:'PTPL-CHEF-SHANE-ACTION-V1',
      nutrition_hint:null,merchant_variants:[],video_angle:'DIRECT_VERIFY_THEN_COMPARE',shorts_hook:'지금도 살 수 있는지부터 확인',locale_menu_terms:[]
    };
    sh.getRange(start+idx,5).setValue('제목: '+title+'\n\nKFOOD_ACTION_PACKAGE: '+JSON.stringify(pack)+'\n\n출처: '+JSON.stringify(urls));
    sh.getRange(start+idx,6).setValue(pack.cta);fixed++;
  });
  return{ok:true,fixed:fixed,readback:auditKFoodActionT2(),version:KFOOD_T2_ACTION_REPAIR_VERSION};
}
function auditKFoodActionT2(){
  const ss=SpreadsheetApp.getActiveSpreadsheet(),sh=ss&&ss.getSheetByName('TEMPLATE_STAGE_2');
  if(!sh||sh.getLastRow()<2)return{ok:false,reason:'NO_T2'};
  const last=sh.getLastRow(),start=Math.max(2,last-30),rows=sh.getRange(start,1,last-start+1,9).getDisplayValues();
  const app=rows.filter(function(r){return String(r[1])==='APP_KFOOD';});
  const shaped=app.filter(function(r){return String(r[4]).indexOf('KFOOD_ACTION_PACKAGE')>=0;});
  const generic=app.filter(function(r){return kfoodT2NeedsRepair_(r[4]);});
  return{ok:generic.length===0&&shaped.length>0,appRows:app.length,actionRows:shaped.length,genericRows:generic.length,version:KFOOD_T2_ACTION_REPAIR_VERSION};
}
function kfoodT2NeedsRepair_(body){const s=String(body||'');return s.indexOf('KFOOD_ACTION_PACKAGE')<0&&(s.indexOf('"solution":"practical steps"')>=0||s.indexOf('solution":"practical steps')>=0);}
function kfoodT2EvidenceUrls_(body){const out=[];String(body||'').replace(/https?:\/\/[^\s"\\\]]+/g,function(u){u=u.replace(/[),.]+$/,'');if(out.indexOf(u)<0)out.push(u);return u;});return out.slice(0,10);}
function kfoodT2Hook_(body){const m=String(body||'').match(/"hook":"([^"]{1,1000})"/);return m?m[1]:'';}
