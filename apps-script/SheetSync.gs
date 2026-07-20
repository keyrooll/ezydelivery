/**
 * Ezydelivery — Google Sheet -> System sync
 * Install on the "ezy delivery" spreadsheet:
 *   Extensions > Apps Script > paste this > Save.
 *   Run syncOrders() once (authorize when asked).
 *   Then add a time trigger: Triggers (clock icon) > Add Trigger >
 *     function: syncOrders, event: Time-driven, Every 5 minutes.
 *
 * Reads the "Order Onpay" tab, maps columns by HEADER NAME (so column order
 * can change safely), and pushes confirmed (DISAHKAN) orders to the worker.
 * The worker upserts by No. Invois, so re-running never duplicates orders and
 * never overwrites staff-entered fields (runner, status, claim, remark).
 */

var WORKER_URL = 'https://ezydelivery.keyrooll.workers.dev/sheet-ingest';
var TOKEN      = '852bb9b669e63e50912088b4ad77cdb73420eaade4047ef1';
var SHEET_NAME = 'Order Onpay';
var ONLY_CONFIRMED = true; // only push rows with Status Jualan = DISAHKAN

// Map our fields -> the exact header text in the sheet.
var HEADERS = {
  invois:     'No. Invois',
  nama:       'Nama',
  telefon:    'No. Telefon',
  alamat:     'Alamat (Ringkas)',
  session:    'Tambahan #2',
  produk:     'Produk',
  jumlah:     'Jumlah Keseluruhan (RM)',
  dimasukkan: 'Tarikh & Masa (Dimasukkan)',
  status:     'Status Jualan'
};

function syncOrders() {
  var sh = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
  if (!sh) throw new Error('Tab "' + SHEET_NAME + '" tak jumpa');
  var values = sh.getDataRange().getValues();
  if (values.length < 2) return;

  // Build header -> index (normalised: trim + lowercase).
  var norm = function (s) { return String(s).trim().toLowerCase(); };
  var idx = {};
  var head = values[0];
  for (var c = 0; c < head.length; c++) idx[norm(head[c])] = c;
  var col = {};
  for (var key in HEADERS) col[key] = idx[norm(HEADERS[key])];

  var rows = [];
  for (var r = 1; r < values.length; r++) {
    var row = values[r];
    var invois = col.invois != null ? String(row[col.invois]).trim() : '';
    if (!invois) continue;
    if (ONLY_CONFIRMED && col.status != null &&
        String(row[col.status]).trim().toUpperCase().indexOf('DISAHKAN') === -1) continue;

    rows.push({
      invois:     invois,
      nama:       get(row, col.nama),
      telefon:    get(row, col.telefon),
      alamat:     get(row, col.alamat),
      session:    get(row, col.session),
      produk:     get(row, col.produk),
      jumlah:     get(row, col.jumlah),
      dimasukkan: get(row, col.dimasukkan)
    });
  }
  if (!rows.length) return;

  var res = UrlFetchApp.fetch(WORKER_URL, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({ token: TOKEN, rows: rows }),
    muteHttpExceptions: true
  });
  Logger.log('Sync: ' + res.getResponseCode() + ' ' + res.getContentText());
}

function get(row, i) { return i != null ? row[i] : ''; }
