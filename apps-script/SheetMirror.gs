/**
 * Ezydelivery — LIVE MIRROR (System -> Google Sheet, one-way, read-only view)
 * The worker POSTs every order create/update here; this upserts a row by order id.
 * Install on a NEW blank Google Sheet:
 *   Extensions > Apps Script > paste this > set MIRROR_TOKEN (Claude gives it) > Save.
 *   Deploy > New deployment > Web app > Execute as: Me > Who has access: Anyone > Deploy.
 *   Copy the Web app URL and give it to Claude (he appends ?key=TOKEN and sets the worker).
 *
 * This is a VIEW only — editing the sheet does NOT change the system (system = source of truth).
 */
var MIRROR_TOKEN = 'PASTE_TOKEN_HERE'; // <-- token Claude beri (jangan commit ke repo public)

function doPost(e) {
  try {
    if (!e || !e.parameter || e.parameter.key !== MIRROR_TOKEN) {
      return ContentService.createTextOutput('unauthorized');
    }
    var data = JSON.parse(e.postData.contents);
    if (data.type !== 'order' || !data.row) return ContentService.createTextOutput('ignored');
    var r = data.row;

    var ss = SpreadsheetApp.getActive();
    var sh = ss.getSheetByName('Orders') || ss.insertSheet('Orders');
    var headers = ['No. Order','Tarikh','Nama','Telefon','Alamat','Produk','Jumlah (RM)',
                   'Cawangan','Sesi','Runner','Tracking','Status','Claim (RM)','Status Claim','Dikemaskini'];
    if (sh.getLastRow() === 0) { sh.appendRow(headers); sh.setFrozenRows(1); }

    var prod = '';
    try { prod = JSON.parse(r.products || '[]').map(function (x) { return x.name + (x.qty ? (' x' + x.qty) : ''); }).join(', '); }
    catch (_) { prod = r.products || ''; }

    var rowData = [r.order_id, r.created_at, r.customer_name, r.phone, r.address, prod,
                   r.total_amount, r.form_name || r.form_id || '', r.delivery_session || '',
                   r.runner_name || '', r.tracking || '', r.status, r.claim_amount || '',
                   r.claim_status || '', r.updated_at];

    // Upsert by order id (column A).
    var last = sh.getLastRow();
    var found = -1;
    if (last >= 2) {
      var ids = sh.getRange(2, 1, last - 1, 1).getValues();
      for (var i = 0; i < ids.length; i++) { if (String(ids[i][0]) === String(r.order_id)) { found = i + 2; break; } }
    }
    if (found > 0) sh.getRange(found, 1, 1, rowData.length).setValues([rowData]);
    else sh.appendRow(rowData);

    return ContentService.createTextOutput('ok');
  } catch (err) {
    return ContentService.createTextOutput('error: ' + err);
  }
}
