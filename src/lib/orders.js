import { backend, brand, packages } from "../site.config.js";

export const backendReady = Boolean(backend.supabaseUrl && backend.supabaseKey);

export function formatDZD(n) {
  return n.toLocaleString("en-US");
}

// 3 إلى 10 "صور"، من 11 "صورة"
export function imagesLabel(n) {
  return n <= 10 ? `${n} صور` : `${n} صورة`;
}

export function contentsLabel(p) {
  return `${p.videos} فيديو و${imagesLabel(p.images)}`;
}

export function packageById(id) {
  return packages.find((p) => p.id === id);
}

// 0559 55 53 13 / +213 559… / 00213… → 0559555313
export function normalizePhone(raw) {
  let d = String(raw || "").replace(/[^0-9]/g, "");
  if (d.startsWith("00213")) d = "0" + d.slice(5);
  else if (d.startsWith("213")) d = "0" + d.slice(3);
  return d;
}

export function isValidPhone(raw) {
  return /^0[1-9][0-9]{7,8}$/.test(normalizePhone(raw));
}

export function validateOrder(o) {
  const errors = {};
  if (!packageById(o.packageId)) errors.packageId = "اختار باقة باش نكملو.";
  if (o.firstName.trim().length < 2) errors.firstName = "اكتب الاسم تاعك.";
  if (o.lastName.trim().length < 2) errors.lastName = "اكتب اللقب تاعك.";
  if (!isValidPhone(o.phone)) errors.phone = "الرقم ناقص ولا غالط. مثال: 0559555313";
  if (o.activity.trim().length < 2) errors.activity = "قولنا واش هو النشاط تاعك.";
  return errors;
}

function headers() {
  const h = { "Content-Type": "application/json", apikey: backend.supabaseKey };
  // المفاتيح القديمة (JWT) لازمها Authorization، الجديدة (sb_publishable_) يكفيها apikey
  if (backend.supabaseKey.startsWith("eyJ")) h.Authorization = `Bearer ${backend.supabaseKey}`;
  return h;
}

// يسجل الطلب في قاعدة البيانات ويرجع رمز الطلب.
// يرجع { ok: true, code } ولا { ok: false, reason }
export async function submitOrder(o) {
  if (!backendReady) return { ok: false, reason: "no-backend" };
  try {
    const res = await fetch(`${backend.supabaseUrl}/rest/v1/rpc/create_order`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        p_first_name: o.firstName.trim(),
        p_last_name: o.lastName.trim(),
        p_phone: normalizePhone(o.phone),
        p_activity: o.activity.trim(),
        p_package: o.packageId,
        p_has_pages: o.hasPages,
        p_facebook: o.hasPages ? o.facebook.trim() : "",
        p_instagram: o.hasPages ? o.instagram.trim() : "",
        p_tiktok: o.hasPages ? o.tiktok.trim() : "",
        p_notes: o.notes.trim(),
      }),
    });
    if (res.ok) return { ok: true, code: await res.json() };
    const body = await res.json().catch(() => ({}));
    const msg = String(body.message || "");
    if (msg.includes("too_many_orders")) return { ok: false, reason: "too-many" };
    if (msg.includes("invalid_")) return { ok: false, reason: "invalid" };
    return { ok: false, reason: "server" };
  } catch {
    return { ok: false, reason: "network" };
  }
}

// رابط واتساب فيه الطلب كامل. يخدم كي قاعدة البيانات ما تكونش مربوطة
// ولا كي الأنترنت تاع الزبون تقطع، باش حتى طلب ما يضيع.
export function orderWhatsAppLink(o) {
  const p = packageById(o.packageId);
  const lines = [
    "السلام عليكم، حاب نطلب باقة محتوى",
    `الباقة: ${p.name} (${contentsLabel(p)}) بـ ${formatDZD(p.price)} دج في الأسبوع`,
    `الاسم: ${o.firstName.trim()} ${o.lastName.trim()}`,
    `الهاتف: ${normalizePhone(o.phone)}`,
    `النشاط: ${o.activity.trim()}`,
  ];
  if (o.hasPages) {
    if (o.facebook.trim()) lines.push(`فيسبوك: ${o.facebook.trim()}`);
    if (o.instagram.trim()) lines.push(`انستغرام: ${o.instagram.trim()}`);
    if (o.tiktok.trim()) lines.push(`تيك توك: ${o.tiktok.trim()}`);
  } else {
    lines.push("ما عنديش صفحات مازال");
  }
  if (o.notes.trim()) lines.push(`ملاحظة: ${o.notes.trim()}`);
  return `https://wa.me/${brand.whatsapp}?text=${encodeURIComponent(lines.join("\n"))}`;
}

export function receiptWhatsAppLink(code) {
  const text = `السلام عليكم، هذا وصل الدفع\nرمز الطلب: ${code}`;
  return `https://wa.me/${brand.whatsapp}?text=${encodeURIComponent(text)}`;
}
