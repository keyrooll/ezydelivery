// =====================
// EZY DELIVERY CONFIG
// =====================
// Delivery / customer-management module for EzyDurian.
// Data lives in Cloudflare D1 (via ezydelivery-worker), NOT Google Sheets.
const DELIVERY_CONFIG = {
  id: 'ezydelivery',
  name: 'EzyDurian Delivery',
  shortName: 'EzyDelivery',
  themeColor: '#1a7a4a',

  // Google Sign-In — identifies staff. Worker checks the email allowlist.
  clientId: '27154479564-ufljm52nmlh4gg7ie54knphff44jvrrq.apps.googleusercontent.com',

  // ezydelivery-worker base URL (no trailing slash). Set after first deploy.
  workerUrl: 'https://ezydelivery.keyrooll.workers.dev',

  // (Runner list now comes from D1 via /runners — no static list here.)

  // ---- Message templates -------------------------------------------------
  // THE SENDER IS DECOUPLED FROM THESE. Today they are turned into wa.me
  // links (staff taps send). If you later move to the WhatsApp API, only the
  // sender changes — these templates stay identical.
  // `o.runner` is a display label (freelance runner name; empty for Lalamove).
  waTemplates: {
    // Message #1 — sent when a runner is assigned / out for delivery.
    onDelivery: (o) =>
`Assalamualaikum ${o.customer_name}.

Tempahan durian anda sedang dalam penghantaran.${o.runner ? `
Runner: ${o.runner}` : ''}${o.tracking ? `
Tracking: ${o.tracking}` : ''}${o.est_time ? `
Anggaran tiba: ${o.est_time}` : ''}

Terima kasih kerana memilih EzyDurian.`,

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
