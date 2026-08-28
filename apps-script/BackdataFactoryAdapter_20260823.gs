const KFOOD_FACTORY_ADAPTER_VERSION='KFOOD_FACTORY_ADAPTER_V2_20260828';
const KFOOD_FACTORY_MASTER_ID='1C_CznU1Uo7dk-gKay3-oH8wFxutsGMlz27RSrbdVQwI';
const KFOOD_FACTORY_APP_ID='APP_KFOOD';
const KFOOD_FACTORY_TARGET_ID='FPC_KFOOD_20260823';
const KFOOD_INTELLIGENCE_URL='https://contents-os.com/api/intelligence';

function runKFoodBackdataFactoryControl10m(){return runKFoodFactoryAdapter_(false);}
function checkKFoodBackdataFactoryAdapter(){return runKFoodFactoryAdapter_(true);}
function runKFoodApiAbQaControl(){return kFoodFactoryApiWindow_();}
function inspectKFoodCentralTrendBootstrap(){
  const central=SpreadsheetApp.openById(KFOOD_FACTORY_MASTER_ID);
  const candidates=kFoodCentralTrendCandidates_(central,20);
  return {ok:true,appId:KFOOD_FACTORY_APP_ID,count:candidates.length,candidates:candidates,version:KFOOD_FACTORY_ADAPTER_VERSION,decision:candidates.length?'REUSE_CENTRAL_STORED_TRENDS_BEFORE_NEW_API':'NO_CURRENT_CENTRAL_TREND_CANDIDATE'};
}

function runKFoodFactoryAdapter_(healthOnly){
  const now=new Date(),props=PropertiesService.getScriptProperties(),bucket=Utilities.formatDate(now,'Asia/Seoul','yyyyMMddHHmm').slice(0,11),key='KFOOD_FACTORY_BUCKET';
  if(!healthOnly&&props.getProperty(key)===bucket)return{ok:true,skipped:true,reason:'SAME_10M_BUCKET',bucket:bucket,version:KFOOD_FACTORY_ADAPTER_VERSION};
  const lock=LockService.getScriptLock();if(!lock.tryLock(5000))return{ok:false,reason:'LOCK_BUSY'};
  try{
    const central=SpreadsheetApp.openById(KFOOD_FACTORY_MASTER_ID),target=kFoodFactoryTarget_(central),triggers=ScriptApp.getProjectTriggers().map(function(t){return t.getHandlerFunction();});
    const known=['processTaskQueue','buildRecipeSeed','buildKFoodT1','adaptKFoodT2','buildRestaurantContentPack'];
    const handlers=known.map(function(n){return{handler:n,present:typeof globalThis[n]==='function'};});
    const centralTrendCandidates=kFoodCentralTrendCandidates_(central,20);
    const out={ok:true,appId:KFOOD_FACTORY_APP_ID,target:target,handlers:handlers,centralTrendCandidates:centralTrendCandidates,centralTrendCandidateCount:centralTrendCandidates.length,existingTriggers:triggers,bucket:bucket,checkedAt:now.toISOString(),version:KFOOD_FACTORY_ADAPTER_VERSION};
    kFoodFactoryMark_(central,out);if(!healthOnly)props.setProperty(key,bucket);props.setProperty('KFOOD_FACTORY_LAST_RESULT',JSON.stringify(out).slice(0,8000));return out;
  }finally{lock.releaseLock();}
}

function kFoodCentralTrendCandidates_(central,limit){
  const sh=central.getSheetByName('62_TREND_RESEARCH_WAREHOUSE');
  if(!sh||sh.getLastRow()<2)return[];
  const values=sh.getRange(1,1,sh.getLastRow(),Math.min(30,sh.getLastColumn())).getDisplayValues();
  const headers=values[0],idx={};headers.forEach(function(h,i){idx[String(h)]=i;});
  const rows=values.slice(1),out=[];
  for(let i=rows.length-1;i>=0&&out.length<(limit||20);i--){
    const r=rows[i],impact=String(r[idx.APP_IMPACT]||''),url=String(r[idx.SOURCE_URL]||''),confidence=String(r[idx.CONFIDENCE]||'').toUpperCase(),status=String(r[idx.STATUS]||'');
    if(impact.indexOf('APP_KFOOD')<0||!/^https?:\/\//i.test(url))continue;
    if(confidence&&['HIGH','VERY_HIGH'].indexOf(confidence)<0)continue;
    if(/ARCHIVE|REJECT|INVALID/i.test(status))continue;
    out.push({
      researchId:String(r[idx.RESEARCH_ID]||''),collectedAt:String(r[idx.COLLECTED_AT]||''),platform:String(r[idx.PLATFORM]||''),domain:String(r[idx.DOMAIN]||''),keyword:String(r[idx.KEYWORD]||''),locale:String(r[idx.LOCALE]||'ko-KR'),title:String(r[idx.TITLE]||''),sourceUrl:url,publishedAt:String(r[idx.PUBLISHED_AT]||''),summary:String(r[idx.SUMMARY]||''),trendSignal:String(r[idx.TREND_SIGNAL]||''),trendScore:Number(r[idx.TREND_SCORE]||0),opportunityGap:String(r[idx.OPPORTUNITY_GAP]||''),recommendedAction:String(r[idx.RECOMMENDED_ACTION]||''),confidence:confidence||'UNKNOWN',status:status||'STORED'
    });
  }
  return out;
}

function publishKFoodCentralTrendCandidatesToIntelligence(){
  const props=PropertiesService.getScriptProperties();
  if(props.getProperty('KFOOD_INTELLIGENCE_POST_ENABLED')!=='true')return{ok:false,skipped:true,reason:'KFOOD_INTELLIGENCE_POST_DISABLED',approval:'REUSE_EXISTING_SCOPE_ONLY; DO_NOT_ADD_NEW_SCOPE_AUTOMATICALLY'};
  const central=SpreadsheetApp.openById(KFOOD_FACTORY_MASTER_ID),candidates=kFoodCentralTrendCandidates_(central,20),results=[];
  candidates.forEach(function(c){
    const eventId='EVT_KFOOD_TREND_'+String(c.researchId||Utilities.getUuid()).replace(/[^A-Za-z0-9_\-]/g,'_');
    const payload={event_id:eventId,producer_app_id:'APP_AGENT_CORE',data_stage:'QUEENS',entity_type:'KFOOD_TREND_SOURCE',entity_id:c.researchId,keyword:c.keyword,summary:c.summary,source_url:c.sourceUrl,locale:c.locale,consumer_scope:'APP_KFOOD|APP_TRAVEL|APP_CONTENT_OS|APP_PUBLISHER_CORE',tags:'KFOOD|CENTRAL_TREND|STORED_FIRST',metrics:{trend_score:c.trendScore,confidence:c.confidence},lineage_ids:c.researchId,status:'READY_STORED_CENTRAL'};
    try{
      const resp=UrlFetchApp.fetch(KFOOD_INTELLIGENCE_URL,{method:'post',contentType:'application/json',payload:JSON.stringify(payload),muteHttpExceptions:true,followRedirects:true});
      results.push({eventId:eventId,code:resp.getResponseCode(),ok:resp.getResponseCode()>=200&&resp.getResponseCode()<300});
    }catch(e){results.push({eventId:eventId,ok:false,error:String(e)});}
  });
  return{ok:results.length>0&&results.every(function(r){return r.ok;}),count:results.length,results:results,version:KFOOD_FACTORY_ADAPTER_VERSION};
}

function kFoodFactoryApiWindow_(){const now=new Date(),hour=Number(Utilities.formatDate(now,'Asia/Seoul','H'));if([9,13,17,21].indexOf(hour)<0)return{ok:true,skipped:true,reason:'OUTSIDE_API_AB_WINDOW'};const props=PropertiesService.getScriptProperties(),key='KFOOD_API_AB_'+Utilities.formatDate(now,'Asia/Seoul','yyyyMMdd')+'_'+hour;if(props.getProperty(key)==='Y')return{ok:true,skipped:true,reason:'WINDOW_ALREADY_RUN'};const central=SpreadsheetApp.openById(KFOOD_FACTORY_MASTER_ID),stored=kFoodCentralTrendCandidates_(central,20);if(stored.length){const out={ok:true,degraded:false,appId:KFOOD_FACTORY_APP_ID,decision:'STORED_CENTRAL_TREND_REUSE_FIRST',storedCandidateCount:stored.length,apiCall:false,version:KFOOD_FACTORY_ADAPTER_VERSION};kFoodFactoryQa_(out,now);props.setProperty(key,'Y');return out;}const out={ok:false,degraded:true,appId:KFOOD_FACTORY_APP_ID,error:'API_EXECUTOR_NOT_MAPPED',decision:'MAP_APPROVED_CURRENT_PRODUCT_PLACE_SOURCE_ONLY_AFTER_STORED_GAP_CONFIRMED',version:KFOOD_FACTORY_ADAPTER_VERSION};kFoodFactoryQa_(out,now);props.setProperty(key,'Y');return out;}
function kFoodFactoryTarget_(central){const sh=central.getSheetByName('66_FACTORY_PRODUCTION_CONTROL');if(!sh||sh.getLastRow()<2)return{found:false};const rows=sh.getRange(2,1,sh.getLastRow()-1,26).getDisplayValues();for(let i=rows.length-1;i>=0;i--)if(String(rows[i][0])===KFOOD_FACTORY_TARGET_ID)return{found:true,queens:Number(rows[i][5]||0),seed:Number(rows[i][6]||0),t1:Number(rows[i][7]||0),t2:Number(rows[i][8]||0),assets:Number(rows[i][9]||0),qualityGate:String(rows[i][18]||'')};return{found:false};}
function kFoodFactoryMark_(central,out){const sh=central.getSheetByName('66_FACTORY_PRODUCTION_CONTROL');if(!sh||sh.getLastRow()<2)return;const rows=sh.getRange(2,1,sh.getLastRow()-1,26).getDisplayValues();for(let i=rows.length-1;i>=0;i--)if(String(rows[i][0])===KFOOD_FACTORY_TARGET_ID){const present=out.handlers.filter(function(h){return h.present;}).map(function(h){return h.handler;});const sourceState=out.centralTrendCandidateCount>0?'CENTRAL_TREND_SOURCE_READY':'CENTRAL_TREND_SOURCE_EMPTY';sh.getRange(i+2,25).setValue(sourceState+';'+(present.length?'KFOOD_ADAPTER_RUNTIME_X2_REQUIRED':'KFOOD_BOUND_HANDLER_MAPPING_REQUIRED'));sh.getRange(i+2,26).setValue('LAST_ADAPTER='+out.checkedAt+';CENTRAL_TREND='+out.centralTrendCandidateCount+';PRESENT='+present.join('|'));return;}}
function kFoodFactoryQa_(out,now){const sh=SpreadsheetApp.openById(KFOOD_FACTORY_MASTER_ID).getSheetByName('67_FACTORY_QA_AB_LOG');if(!sh)return;sh.appendRow(['QA_KFOOD_'+Utilities.formatDate(now,'Asia/Seoul','yyyyMMdd_HH00'),Utilities.formatDate(now,'Asia/Seoul','yyyy-MM-dd HH:mm:ss')+' KST',KFOOD_FACTORY_APP_ID,'FOOD_CENTRAL_TREND_FIXTURE','STORED_CENTRAL_TREND_FIRST','CONDITIONAL_API_ONLY','','','','','','','','','','','','','',out.error||'','',out.decision||'','KFOOD_FACTORY_ADAPTER_V2','PENDING_RUNTIME']);}
