const KFOOD_FACTORY_ADAPTER_VERSION='KFOOD_FACTORY_ADAPTER_V1_20260823';
const KFOOD_FACTORY_MASTER_ID='1C_CznU1Uo7dk-gKay3-oH8wFxutsGMlz27RSrbdVQwI';
const KFOOD_FACTORY_APP_ID='APP_KFOOD';
const KFOOD_FACTORY_TARGET_ID='FPC_KFOOD_20260823';

function runKFoodBackdataFactoryControl10m(){return runKFoodFactoryAdapter_(false);}
function checkKFoodBackdataFactoryAdapter(){return runKFoodFactoryAdapter_(true);}
function runKFoodApiAbQaControl(){return kFoodFactoryApiWindow_();}

function runKFoodFactoryAdapter_(healthOnly){
  const now=new Date(),props=PropertiesService.getScriptProperties(),bucket=Utilities.formatDate(now,'Asia/Seoul','yyyyMMddHHmm').slice(0,11),key='KFOOD_FACTORY_BUCKET';
  if(!healthOnly&&props.getProperty(key)===bucket)return{ok:true,skipped:true,reason:'SAME_10M_BUCKET',bucket:bucket,version:KFOOD_FACTORY_ADAPTER_VERSION};
  const lock=LockService.getScriptLock();if(!lock.tryLock(5000))return{ok:false,reason:'LOCK_BUSY'};
  try{
    const central=SpreadsheetApp.openById(KFOOD_FACTORY_MASTER_ID),target=kFoodFactoryTarget_(central),triggers=ScriptApp.getProjectTriggers().map(function(t){return t.getHandlerFunction();});
    const known=['processTaskQueue','buildRecipeSeed','buildKFoodT1','adaptKFoodT2','buildRestaurantContentPack'];
    const handlers=known.map(function(n){return{handler:n,present:typeof globalThis[n]==='function'};});
    const out={ok:true,appId:KFOOD_FACTORY_APP_ID,target:target,handlers:handlers,existingTriggers:triggers,bucket:bucket,checkedAt:now.toISOString(),version:KFOOD_FACTORY_ADAPTER_VERSION};
    kFoodFactoryMark_(central,out);if(!healthOnly)props.setProperty(key,bucket);props.setProperty('KFOOD_FACTORY_LAST_RESULT',JSON.stringify(out).slice(0,8000));return out;
  }finally{lock.releaseLock();}
}
function kFoodFactoryApiWindow_(){const now=new Date(),hour=Number(Utilities.formatDate(now,'Asia/Seoul','H'));if([9,13,17,21].indexOf(hour)<0)return{ok:true,skipped:true,reason:'OUTSIDE_API_AB_WINDOW'};const props=PropertiesService.getScriptProperties(),key='KFOOD_API_AB_'+Utilities.formatDate(now,'Asia/Seoul','yyyyMMdd')+'_'+hour;if(props.getProperty(key)==='Y')return{ok:true,skipped:true,reason:'WINDOW_ALREADY_RUN'};const out={ok:false,degraded:true,appId:KFOOD_FACTORY_APP_ID,error:'API_EXECUTOR_NOT_MAPPED',decision:'MAP_APPROVED_CURRENT_PRODUCT_PLACE_SOURCE_AFTER_OWN_RECIPE_FIXTURE',version:KFOOD_FACTORY_ADAPTER_VERSION};kFoodFactoryQa_(out,now);props.setProperty(key,'Y');return out;}
function kFoodFactoryTarget_(central){const sh=central.getSheetByName('66_FACTORY_PRODUCTION_CONTROL');if(!sh||sh.getLastRow()<2)return{found:false};const rows=sh.getRange(2,1,sh.getLastRow()-1,26).getDisplayValues();for(let i=rows.length-1;i>=0;i--)if(String(rows[i][0])===KFOOD_FACTORY_TARGET_ID)return{found:true,queens:Number(rows[i][5]||0),seed:Number(rows[i][6]||0),t1:Number(rows[i][7]||0),t2:Number(rows[i][8]||0),assets:Number(rows[i][9]||0),qualityGate:String(rows[i][18]||'')};return{found:false};}
function kFoodFactoryMark_(central,out){const sh=central.getSheetByName('66_FACTORY_PRODUCTION_CONTROL');if(!sh||sh.getLastRow()<2)return;const rows=sh.getRange(2,1,sh.getLastRow()-1,26).getDisplayValues();for(let i=rows.length-1;i>=0;i--)if(String(rows[i][0])===KFOOD_FACTORY_TARGET_ID){const present=out.handlers.filter(function(h){return h.present;}).map(function(h){return h.handler;});sh.getRange(i+2,25).setValue(present.length?'KFOOD_ADAPTER_SOURCE_READY_RUNTIME_X2_REQUIRED':'KFOOD_BOUND_HANDLER_MAPPING_REQUIRED');sh.getRange(i+2,26).setValue('LAST_ADAPTER='+out.checkedAt+';PRESENT='+present.join('|'));return;}}
function kFoodFactoryQa_(out,now){const sh=SpreadsheetApp.openById(KFOOD_FACTORY_MASTER_ID).getSheetByName('67_FACTORY_QA_AB_LOG');if(!sh)return;sh.appendRow(['QA_KFOOD_'+Utilities.formatDate(now,'Asia/Seoul','yyyyMMdd_HH00'),Utilities.formatDate(now,'Asia/Seoul','yyyy-MM-dd HH:mm:ss')+' KST',KFOOD_FACTORY_APP_ID,'FOOD_FIXTURE_PENDING','OWN_RECIPE_QUEENS_SEED_T1_T2','APPROVED_API_ON','','','','','','','','','','','','','',out.error,'','API_EXECUTOR_MAPPING_REQUIRED','KFOOD_FACTORY_ADAPTER_V1','PENDING']);}
