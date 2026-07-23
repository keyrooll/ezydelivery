// =====================
// EZY DELIVERY CONFIG
// =====================
// Delivery / customer-management module for EzyDurian.
// Data lives in Cloudflare D1 (via ezydelivery-worker), NOT Google Sheets.

// Customer service number shown in the WA footer. Leave '' to hide the line.
const CS_PHONE = '';  // cth '03-1234 5678'

// Base URL of the public customer tracking page (track.html).
const TRACK_BASE = 'https://keyrooll.github.io/ezydelivery/track.html';

const MS_MONTHS = ['Januari','Februari','Mac','April','Mei','Jun','Julai','Ogos','September','Oktober','November','Disember'];
function fmtDate(x){ if(!x) return '-'; const d=new Date(x); return isNaN(d)?String(x):(d.getDate()+' '+MS_MONTHS[d.getMonth()]+' '+d.getFullYear()); }
function fmtItems(products){ const a=Array.isArray(products)?products:[]; return a.length ? a.map(p=>'• '+p.name+(p.qty?' × '+p.qty:'')).join('\n') : '• -'; }

const DELIVERY_CONFIG = {
  id: 'ezydelivery',
  name: 'EzyDurian Delivery',
  shortName: 'EzyDelivery',
  themeColor: '#1a7a4a',
  version: 'v1.2',  // bumped on every file change (see header + track.html)

  // Google Sign-In — identifies staff. Worker checks the email allowlist.
  clientId: '27154479564-ufljm52nmlh4gg7ie54knphff44jvrrq.apps.googleusercontent.com',

  // ezydelivery-worker base URL (no trailing slash). Set after first deploy.
  workerUrl: 'https://ezydelivery.keyrooll.workers.dev',

  // Live Google Sheet (fed by =IMPORTDATA from workerUrl/orders.csv). The
  // "Buka Google Sheet" button opens this. Leave '' to hide the button.
  sheetUrl: 'https://docs.google.com/spreadsheets/d/1tEn5oSoYrFsiDQ_CtQnLSVHMk5vplhjvdP0XOvwY_I4/edit',

  // (Runner list now comes from D1 via /runners — no static list here.)

  // ---- Message templates -------------------------------------------------
  // THE SENDER IS DECOUPLED FROM THESE. Today they are turned into wa.me
  // links (staff taps send). If you later move to the WhatsApp API, only the
  // sender changes — these templates stay identical.
  // `o.runner` is a display label (freelance runner name; empty for Lalamove).
  waTemplates: {
    // Message #1 — sent when a runner is assigned / out for delivery.
    onDelivery: (o) =>
`Assalamualaikum ${o.customer_name}. 😊

Terima kasih kerana membuat tempahan dengan EzyDurian.

🚚 Tempahan anda kini sedang dalam proses penghantaran.

*Maklumat Tempahan*
• No. Tempahan: #${o.order_id}
• Tarikh Tempahan: ${fmtDate(o.created_at)}

*Item Ditempah*
${fmtItems(o.products)}

*Maklumat Penghantaran*${o.runner ? `
• Nama Runner: ${o.runner}${o.runner_phone ? `
• No. Telefon Runner: ${o.runner_phone}` : ''}` : `
• Kaedah: Lalamove`}
• Status: Dalam Perjalanan${o.tracking ? `
• Tracking: ${o.tracking}` : ''}${o.est_time ? `
• Anggaran Tiba: ${o.est_time}` : ''}
${o.track_token ? `
📍 Jejak lokasi runner secara langsung:
${TRACK_BASE}?o=${encodeURIComponent(o.order_id)}&t=${o.track_token}
` : ''}
⚠️ Mesej ini dihantar secara automatik oleh sistem EzyDurian. Sila jangan balas mesej ini kerana ia tidak dipantau.${CS_PHONE ? `

Sekiranya perlu bantuan, hubungi khidmat pelanggan: ${CS_PHONE}.` : ''}

Terima kasih kerana memilih EzyDurian. 💛`,

    // Message #2 — sent when the order is marked delivered.
    delivered: (o) =>
`Assalamualaikum ${o.customer_name}.

Tempahan durian anda telah selamat sampai. Semoga berpuas hati!

Terima kasih kerana memilih EzyDurian. 🌱`,

    // Self-pickup — order ready to collect.
    pickup: (o) =>
`Assalamualaikum ${o.customer_name}.

Tempahan durian anda sedia untuk diambil di EzyDurian Batu Caves (4PM - 9PM).
Sila tunjukkan No. Order: ${o.order_id}

Terima kasih kerana memilih EzyDurian. 🌱`,
  },
};
