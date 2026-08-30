/**
 * APP_KFOOD / CENTRAL_FACTORY_V2 runtime config repair.
 * Safe staging only: no trigger creation, no deployment, no publish.
 * Version: KFOOD_FACTORY_RUNTIME_REPAIR_V1_20260830
 */
var KFOOD_FACTORY_RUNTIME_REPAIR_VERSION = 'KFOOD_FACTORY_RUNTIME_REPAIR_V1_20260830';
var KFOOD_FACTORY_DRYWRITER_KEY = 'DRYWRITER_WEBAPP_URL';

function inspectKfoodFactoryRuntimeRepair() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var appId = String(kfoodFactoryConfigValue_('APP_ID') || '').trim();
  var configUrl = String(kfoodFactoryConfigValue_(KFOOD_FACTORY_DRYWRITER_KEY) || '').trim();
  var propertyUrl = String(PropertiesService.getScriptProperties().getProperty(KFOOD_FACTORY_DRYWRITER_KEY) || '').trim();
  var triggers = ScriptApp.getProjectTriggers().map(function(t) {
    return {
      handler: String(t.getHandlerFunction ? t.getHandlerFunction() : ''),
      uid: String(t.getUniqueId ? t.getUniqueId() : ''),
      eventType: String(t.getEventType ? t.getEventType() : ''),
      source: String(t.getTriggerSource ? t.getTriggerSource() : '')
    };
  });
  return {
    ok: appId === 'APP_KFOOD',
    version: KFOOD_FACTORY_RUNTIME_REPAIR_VERSION,
    spreadsheetId: ss.getId(),
    spreadsheetName: ss.getName(),
    appId: appId,
    scriptId: ScriptApp.getScriptId(),
    configDryWriterUrlPresent: !!configUrl,
    scriptPropertyDryWriterUrlPresent: !!propertyUrl,
    dryWriterUrlMatches: !!configUrl && configUrl === propertyUrl,
    processTaskQueueTriggerCount: triggers.filter(function(t) { return t.handler === 'processTaskQueue'; }).length,
    triggers: triggers,
    drywriter: kfoodFactoryDrywriterStats_(),
    at: new Date().toISOString()
  };
}

function repairKfoodFactoryRuntimeConfig() {
  var appId = String(kfoodFactoryConfigValue_('APP_ID') || '').trim();
  if (appId !== 'APP_KFOOD') throw new Error('APP_ID_MISMATCH_EXPECTED_APP_KFOOD:' + appId);

  var url = String(kfoodFactoryConfigValue_(KFOOD_FACTORY_DRYWRITER_KEY) || '').trim();
  if (!/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec(?:\?.*)?$/.test(url)) {
    throw new Error('INVALID_OR_MISSING_CONFIG_DRYWRITER_WEBAPP_URL');
  }

  var props = PropertiesService.getScriptProperties();
  props.setProperty(KFOOD_FACTORY_DRYWRITER_KEY, url);
  var readback = String(props.getProperty(KFOOD_FACTORY_DRYWRITER_KEY) || '').trim();
  if (readback !== url) throw new Error('SCRIPT_PROPERTY_READBACK_MISMATCH');

  var reset = kfoodFactoryResetMissingUrlFailures_();
  var queued = kfoodFactoryQueueRepairCycle_();
  var inspect = inspectKfoodFactoryRuntimeRepair();
  if (!inspect.scriptPropertyDryWriterUrlPresent || !inspect.dryWriterUrlMatches) {
    throw new Error('DRYWRITER_RUNTIME_CONFIG_VERIFY_FAILED');
  }

  return {
    ok: true,
    version: KFOOD_FACTORY_RUNTIME_REPAIR_VERSION,
    scriptId: inspect.scriptId,
    resetDryWriterRows: reset,
    queuedFactoryTask: queued,
    inspect: inspect,
    safety: 'REUSE_EXISTING_PROCESS_TASK_QUEUE_TRIGGER_NO_NEW_TRIGGER_NO_DEPLOY_NO_PUBLISH',
    next: 'Allow existing processTaskQueue trigger to consume queued FACTORY_CYCLE, then verify DRYWRITER_QUEUE twice.'
  };
}

function kfoodFactoryConfigValue_(key) {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('CONFIG');
  if (!sh) throw new Error('SHEET_MISSING:CONFIG');
  var last = sh.getLastRow();
  if (last < 2) return '';
  var values = sh.getRange(2, 1, last - 1, 2).getValues();
  for (var i = 0; i < values.length; i++) {
    if (String(values[i][0] || '').trim() === key) return values[i][1];
  }
  return '';
}

function kfoodFactoryDrywriterStats_() {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('DRYWRITER_QUEUE');
  if (!sh || sh.getLastRow() < 2) return { total: 0, waitingMissingUrl: 0, pending: 0 };
  var values = sh.getRange(2, 1, sh.getLastRow() - 1, Math.min(sh.getLastColumn(), 9)).getValues();
  var out = { total: values.length, waitingMissingUrl: 0, pending: 0 };
  values.forEach(function(r) {
    var status = String(r[4] || '');
    var error = String(r[8] || '');
    if (status === 'WAITING_BRIDGE' && error === 'DRYWRITER_WEBAPP_URL_NOT_CONFIGURED') out.waitingMissingUrl++;
    if (status === 'PENDING') out.pending++;
  });
  return out;
}

function kfoodFactoryResetMissingUrlFailures_() {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('DRYWRITER_QUEUE');
  if (!sh || sh.getLastRow() < 2) return 0;
  var rowCount = sh.getLastRow() - 1;
  var values = sh.getRange(2, 1, rowCount, Math.min(sh.getLastColumn(), 9)).getValues();
  var changed = 0;
  for (var i = 0; i < values.length; i++) {
    var status = String(values[i][4] || '');
    var error = String(values[i][8] || '');
    if (status === 'WAITING_BRIDGE' && error === 'DRYWRITER_WEBAPP_URL_NOT_CONFIGURED') {
      sh.getRange(i + 2, 5).setValue('PENDING');
      sh.getRange(i + 2, 9).clearContent();
      changed++;
    }
  }
  return changed;
}

function kfoodFactoryQueueRepairCycle_() {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('TASK_QUEUE');
  if (!sh) throw new Error('SHEET_MISSING:TASK_QUEUE');
  var now = new Date();
  var taskId = 'TASK_' + Utilities.getUuid();
  var key = 'KFOOD_DRYWRITER_RUNTIME_REPAIR_' + Utilities.formatDate(now, 'Etc/UTC', 'yyyyMMdd_HHmmss');
  var payload = {
    source: 'runtime_config_repair',
    run_date: Utilities.formatDate(now, 'Asia/Seoul', 'yyyyMMdd'),
    repair_version: KFOOD_FACTORY_RUNTIME_REPAIR_VERSION,
    drywriter_nonblocking: true
  };
  sh.appendRow([taskId,'APP_KFOOD','FACTORY_CYCLE',JSON.stringify(payload),'QUEUED',5,now.toISOString(),'','',0,'','',key]);
  return { taskId: taskId, idempotencyKey: key, status: 'QUEUED' };
}
