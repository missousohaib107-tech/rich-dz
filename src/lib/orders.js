import { backend, brand, packages } from "../site.config.js";
import { getClient } from "./supa.js";

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
  if (o.offer.trim().length < 3) errors.offer = "اكتب واش تبيع، باش نحضرو المحتوى على حسابك.";
  return errors;
}

// يسجل الطلب في قاعدة البيانات ويرجع رمز الطلب.
// يرجع { ok: true, code } ولا { ok: false, reason }
export async function submitOrder(o) {
  if (!backendReady) return { ok: false, reason: "no-backend" };
  try {
    const client = await getClient();
    const { data, error } = await client.rpc("create_order", {
      p_first_name: o.firstName.trim(),
      p_last_name: o.lastName.trim(),
      p_phone: normalizePhone(o.phone),
      p_activity: o.activity.trim(),
      p_package: o.packageId,
      p_offer: o.offer.trim(),
      p_has_pages: o.hasPages,
      p_facebook: o.hasPages ? o.facebook.trim() : "",
      p_instagram: o.hasPages ? o.instagram.trim() : "",
      p_tiktok: o.hasPages ? o.tiktok.trim() : "",
      p_notes: o.notes.trim(),
    });
    if (!error) return { ok: true, code: data };
    const msg = String(error.message || "");
    if (msg.includes("too_many_orders")) return { ok: false, reason: "too-many" };
    if (msg.includes("invalid_")) return { ok: false, reason: "invalid" };
    return { ok: false, reason: "server" };
  } catch {
    return { ok: false, reason: "network" };
  }
}

// ── صور الزبون: وصل الدفع وصور المنتوج ──
// نصغرو الصورة ونحولوها JPEG قبل الرفع: تطلع بسرعة حتى بكونيكسيون ضعيفة.
async function toJpeg(file, maxSide, quality) {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
  } catch {
    return null;
  }
}

function randomName() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, "0")).join("");
}

const PLAIN_TYPES = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

// يرفع صورة ويربطها بالطلب. يرجع { ok: true } ولا { ok: false, reason }
// reason: "not-image" | "too-big" | "not-found" | "too-many" | "network"
async function sendImage({ bucket, rpc, maxSide, quality, maxBytes }, { code, phone, file }) {
  const cleanCode = String(code || "").trim().toUpperCase();
  if (!/^RDZ-C-[A-Z0-9]{5}$/.test(cleanCode) || !isValidPhone(phone)) return { ok: false, reason: "not-found" };
  if (!file || !file.type.startsWith("image/")) return { ok: false, reason: "not-image" };

  let blob = await toJpeg(file, maxSide, quality);
  let ext = "jpg";
  if (!blob) {
    // المتصفح ما قدرش يقرا الصورة: نبعثوها كيما هي إذا كانت من نوع مقبول
    if (!PLAIN_TYPES[file.type]) return { ok: false, reason: "not-image" };
    blob = file;
    ext = PLAIN_TYPES[file.type];
  }
  if (blob.size > maxBytes) return { ok: false, reason: "too-big" };

  try {
    const client = await getClient();
    const path = `${cleanCode}/${randomName()}.${ext}`;
    const up = await client.storage.from(bucket).upload(path, blob, { contentType: blob.type, upsert: false });
    if (up.error) return { ok: false, reason: "network" };
    const { error } = await client.rpc(rpc, { p_code: cleanCode, p_phone: normalizePhone(phone), p_path: path });
    if (!error) return { ok: true };
    const msg = String(error.message || "");
    if (msg.includes("order_not_found")) return { ok: false, reason: "not-found" };
    if (msg.includes("too_many_files")) return { ok: false, reason: "too-many" };
    return { ok: false, reason: "network" };
  } catch {
    return { ok: false, reason: "network" };
  }
}

export const uploadReceipt = (args) =>
  sendImage({ bucket: "receipts", rpc: "attach_receipt", maxSide: 1600, quality: 0.85, maxBytes: 5 * 1024 * 1024 }, args);

// صور المنتوج تتخدم بيها الفيديوهات، على هذا نخليوها كبار وبجودة عالية
export const uploadMaterial = (args) =>
  sendImage({ bucket: "materials", rpc: "attach_material", maxSide: 2400, quality: 0.92, maxBytes: 10 * 1024 * 1024 }, args);

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
    `واش نبيع: ${o.offer.trim()}`,
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
