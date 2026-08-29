/**
 * K-Kitchen community intake endpoint.
 * Deploy this Apps Script as a Web App and set the URL in
 * VITE_COMMUNITY_INGEST_URL.
 *
 * The first successful request creates a Drive folder and a spreadsheet,
 * then stores their IDs in Script Properties. Set the properties manually
 * when an existing central folder/sheet must be used:
 * - COMMUNITY_ROOT_FOLDER_ID
 * - COMMUNITY_SHEET_ID
 */

const COMMUNITY_SHEET_NAME = 'Community_Submission_Master';
const COMMUNITY_ROOT_FOLDER_NAME = 'KFOOD_COMMUNITY_SUBMISSIONS';

function doPost(e) {
  try {
    const payload = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (payload.action !== 'COMMUNITY_SUBMISSION') {
      return communityJsonResponse_({ ok: false, status: 'INVALID_ACTION' });
    }
    return communityJsonResponse_(handleCommunitySubmission_(payload));
  } catch (error) {
    console.error(error);
    return communityJsonResponse_({
      ok: false,
      status: 'FAILED_TEST',
      message: error && error.message ? error.message : String(error),
    });
  }
}

function handleCommunitySubmission_(payload) {
  if (!payload.submissionId || !payload.post || !payload.post.imageUrl) {
    throw new Error('submissionId, post and post.imageUrl are required.');
  }

  const rootFolder = getOrCreateCommunityRootFolder_();
  const submissionFolder = rootFolder.createFolder(safeFileName_(payload.submissionId));
  const imageFile = saveDataUrlImage_(
    submissionFolder,
    payload.post.imageUrl,
    payload.originalFileName || 'community-upload.jpg'
  );

  const postWithoutBase64 = JSON.parse(JSON.stringify(payload.post));
  postWithoutBase64.imageUrl = '';
  postWithoutBase64.driveImageFileId = imageFile.getId();
  postWithoutBase64.driveFolderId = submissionFolder.getId();
  postWithoutBase64.publishStatus = 'REVIEW_PENDING';

  const jsonFile = submissionFolder.createFile(
    'post.json',
    JSON.stringify(postWithoutBase64, null, 2),
    MimeType.PLAIN_TEXT
  );

  const sheet = getOrCreateCommunitySheet_();
  ensureCommunityHeader_(sheet);
  const template = payload.post.communityTemplate || {};
  sheet.appendRow([
    new Date(),
    payload.submissionId,
    payload.sourceKind || template.sourceKind || 'food_photo',
    payload.originalFileName || '',
    payload.post.title || '',
    payload.post.author && payload.post.author.name ? payload.post.author.name : 'Guest Chef',
    template.dishName || '',
    Number(template.servings || 0),
    Number(template.ingredientCount || 0),
    template.costType || 'unverified',
    Number(template.costAmount || 0),
    template.currency || '',
    template.verificationStatus || 'NEEDS_REVIEW',
    'REVIEW_PENDING',
    submissionFolder.getId(),
    imageFile.getId(),
    jsonFile.getId(),
  ]);

  return {
    ok: true,
    status: 'SAVED_TO_DRIVE',
    submissionId: payload.submissionId,
    driveFolderId: submissionFolder.getId(),
    imageFileId: imageFile.getId(),
    jsonFileId: jsonFile.getId(),
  };
}

function getOrCreateCommunityRootFolder_() {
  const properties = PropertiesService.getScriptProperties();
  const configuredId = properties.getProperty('COMMUNITY_ROOT_FOLDER_ID');
  if (configuredId) return DriveApp.getFolderById(configuredId);

  const folder = DriveApp.createFolder(COMMUNITY_ROOT_FOLDER_NAME);
  properties.setProperty('COMMUNITY_ROOT_FOLDER_ID', folder.getId());
  return folder;
}

function getOrCreateCommunitySheet_() {
  const properties = PropertiesService.getScriptProperties();
  const configuredId = properties.getProperty('COMMUNITY_SHEET_ID');
  let spreadsheet;

  if (configuredId) {
    spreadsheet = SpreadsheetApp.openById(configuredId);
  } else {
    spreadsheet = SpreadsheetApp.create('KFOOD_COMMUNITY_INTAKE');
    properties.setProperty('COMMUNITY_SHEET_ID', spreadsheet.getId());
  }

  return spreadsheet.getSheetByName(COMMUNITY_SHEET_NAME) || spreadsheet.insertSheet(COMMUNITY_SHEET_NAME);
}

function ensureCommunityHeader_(sheet) {
  if (sheet.getLastRow() > 0) return;
  sheet.appendRow([
    'CREATED_AT',
    'SUBMISSION_ID',
    'SOURCE_KIND',
    'ORIGINAL_FILE_NAME',
    'POST_TITLE',
    'AUTHOR_NAME',
    'DISH_NAME',
    'SERVINGS',
    'INGREDIENT_COUNT',
    'COST_TYPE',
    'COST_AMOUNT',
    'CURRENCY',
    'VERIFICATION_STATUS',
    'PUBLISH_STATUS',
    'DRIVE_FOLDER_ID',
    'IMAGE_FILE_ID',
    'POST_JSON_FILE_ID',
  ]);
  sheet.setFrozenRows(1);
}

function saveDataUrlImage_(folder, dataUrl, originalFileName) {
  const match = String(dataUrl).match(/^data:([^;]+);base64,(.+)$/);
  if (!match) throw new Error('The uploaded image is not a valid data URL.');

  const mimeType = match[1];
  const bytes = Utilities.base64Decode(match[2]);
  const fileName = safeFileName_(originalFileName || 'community-upload.jpg');
  return folder.createFile(Utilities.newBlob(bytes, mimeType, fileName));
}

function safeFileName_(value) {
  return String(value || 'file')
    .replace(/[\\/:*?"<>|#%{}\[\]]/g, '_')
    .replace(/\s+/g, '_')
    .slice(0, 120);
}

function communityJsonResponse_(body) {
  return ContentService
    .createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON);
}
