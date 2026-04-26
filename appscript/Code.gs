// ═══════════════════════════════════════════════════════════════════════════
// Nexum Suum Portal — Google Apps Script
// Deploy as: Execute as Me | Anyone (even anonymous)
//
// Handles POST from all portal pages:
//   system: "boiler" | "chiller" | "facility" | "virtuous" | "buyer"
//
// Also receives Stripe webhook buyer data from Lambda (system: "buyer")
// so prospects automatically appear in the Prospect Buyers tab.
// ═══════════════════════════════════════════════════════════════════════════

function doPost(e) {
  try {
    var raw  = e.postData ? e.postData.contents : '{}';
    var data = JSON.parse(raw);
    var ss   = SpreadsheetApp.getActiveSpreadsheet();
    var sys  = (data.system || 'general').toLowerCase();

    var tabName = getTabName(sys);
    var sheet   = getOrCreateSheet(ss, tabName);
    var row     = buildRow(sys, data);

    sheet.appendRow(row);

    // Auto-format the new row
    var lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 1).setNumberFormat('yyyy-mm-dd hh:mm:ss');

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, tab: tabName, row: lastRow }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'Nexum Suum Portal Script v2 Active', ts: new Date().toISOString() }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── Tab routing ──────────────────────────────────────────────────────────────
function getTabName(system) {
  var map = {
    'boiler'    : 'Boiler Logs',
    'chiller'   : 'Chiller Logs',
    'facility'  : 'Facility Logs',
    'virtuous'  : 'Virtuous Ethics Log',
    'buyer'     : 'Prospect Buyers',
    'compliance': 'Compliance Log',
  };
  return map[system] || 'General Log';
}

// ── Get or create a named sheet ──────────────────────────────────────────────
function getOrCreateSheet(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    addHeaders(sheet, name);
    styleHeader(sheet);
  }
  return sheet;
}

function styleHeader(sheet) {
  var lastCol = sheet.getLastColumn();
  if (lastCol < 1) return;
  var hdr = sheet.getRange(1, 1, 1, lastCol);
  hdr.setBackground('#1a1a2e');
  hdr.setFontColor('#00FFE1');
  hdr.setFontWeight('bold');
  hdr.setFontSize(10);
  sheet.setFrozenRows(1);
  sheet.setColumnWidth(1, 170); // Timestamp
}

function addHeaders(sheet, tabName) {
  var headers = getHeaders(tabName);
  if (headers.length > 0) sheet.appendRow(headers);
}

// ── Column headers per tab ───────────────────────────────────────────────────
function getHeaders(tabName) {
  switch (tabName) {
    case 'Boiler Logs':
      return [
        'Timestamp', 'Date', 'Equipment ID', 'Boiler Name / Location',
        'Stack Temp (°F)', 'Supply Temp (°F)', 'Return Temp (°F)',
        'Fuel Input', 'Operating Pressure (PSI)', 'kW / Amps',
        'Hz / Speed', 'Tech Name', 'Notes'
      ];

    case 'Chiller Logs':
      return [
        'Timestamp', 'Date', 'Equipment ID', 'Chiller Name / Location',
        'Supply Temp (°F)', 'Return Temp (°F)', 'Condenser Temp (°F)',
        'Refrigerant Pressure', 'Compressor Amps', 'Cooling Tower Temp (°F)',
        'Flow Rate (GPM)', 'Tech Name', 'Notes'
      ];

    case 'Facility Logs':
      return [
        'Timestamp', 'Date', 'System Type', 'Equipment ID', 'Location',
        'Reading Value', 'Unit', 'Status', 'Tech Name', 'Notes'
      ];

    case 'Virtuous Ethics Log':
      return [
        'Timestamp', 'Date', 'Reporter (anonymous if blank)', 'Department',
        'Log Type', 'Severity', 'Equipment / System', 'Description',
        'Action Taken', 'Status'
      ];

    case 'Prospect Buyers':
      return [
        'Timestamp', 'Name', 'Company', 'Email', 'Phone',
        'Product Purchased', 'Stripe Session ID', 'Amount ($)',
        'Status', 'Notes'
      ];

    case 'Compliance Log':
      return [
        'Timestamp', 'Date', 'Inspector / Reporter', 'Area / System',
        'Finding Type', 'Severity', 'Description', 'Corrective Action', 'Status'
      ];

    default:
      return ['Timestamp', 'System', 'Payload'];
  }
}

// ── Build row array from POST data ───────────────────────────────────────────
function buildRow(system, d) {
  var ts = new Date();

  switch (system) {
    case 'boiler':
      return [
        ts, d.date, d.equipmentId, d.boilerName,
        d.stackTemp, d.supplyTemp, d.returnTemp,
        d.fuelInput, d.operatingPressure, d.kwAmps,
        d.hzSpeed, d.techName, d.notes
      ];

    case 'chiller':
      return [
        ts, d.date, d.equipmentId, d.chillerName,
        d.supplyTemp, d.returnTemp, d.condenserTemp,
        d.refrigerantPressure, d.compressorAmps, d.coolingTowerTemp,
        d.flowRate, d.techName, d.notes
      ];

    case 'facility':
      return [
        ts, d.date, d.systemType, d.equipmentId, d.location,
        d.readingValue, d.unit, d.status, d.techName, d.notes
      ];

    case 'virtuous':
      return [
        ts, d.date, d.reporter || '(anonymous)', d.department,
        d.logType, d.severity, d.equipmentSystem || '—',
        d.description, d.actionTaken || '—', d.status
      ];

    case 'buyer':
      return [
        ts, d.name, d.company, d.email, d.phone || '—',
        d.product, d.sessionId || '—', d.amount || '—',
        d.status || 'Pending Review', d.notes || ''
      ];

    case 'compliance':
      return [
        ts, d.date, d.reporter, d.area,
        d.findingType, d.severity, d.description,
        d.correctiveAction || '—', d.status
      ];

    default:
      return [ts, system, JSON.stringify(d)];
  }
}

// ── Utility: manually seed a test buyer row (run from Apps Script editor) ────
function testBuyerEntry() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getOrCreateSheet(ss, 'Prospect Buyers');
  sheet.appendRow([
    new Date(), 'Jane Smith', 'Riverside Municipal', 'jane@riverside.gov', '555-0101',
    'Boiler Intelligence Package + Looker Studio', 'cs_test_abc123', '149',
    'Pending Review', 'Test entry — delete before launch'
  ]);
  Logger.log('Test buyer row added.');
}
