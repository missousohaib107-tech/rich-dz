import { createClient } from "@supabase/supabase-js";
import { backend } from "../site.config.js";

// live = قاعدة البيانات مربوطة. بلا بيها اللوحة تخدم بطلبيات وهمية (وضع تجريبي).
export const live = Boolean(backend.supabaseUrl && backend.supabaseKey);
const supabase = live ? createClient(backend.supabaseUrl, backend.supabaseKey) : null;

const hoursAgo = (h) => new Date(Date.now() - h * 3600 * 1000).toISOString();

let demoOrders = [
  {
    id: "d1", code: "RDZ-C-7K3QF", created_at: hoursAgo(1.5),
    first_name: "نبيل", last_name: "تجريبي", phone: "0550000001", activity: "محل ملابس",
    package_id: "daily", package_name: "اليومي", videos_total: 7, images_total: 7, price_dzd: 10000,
    has_pages: true, facebook_url: "https://facebook.com/example", instagram_url: "example.shop", tiktok_url: "",
    notes: "عندي تخفيضات هذا الأسبوع، نحب نركزو عليها.",
    payment_status: "unpaid", paid_at: null, work_status: "new", videos_done: 0, images_done: 0, admin_notes: "",
  },
  {
    id: "d2", code: "RDZ-C-M4T8W", created_at: hoursAgo(5),
    first_name: "سارة", last_name: "تجريبية", phone: "0660000002", activity: "صالون تجميل أو حلاقة",
    package_id: "daily", package_name: "اليومي", videos_total: 7, images_total: 7, price_dzd: 10000,
    has_pages: false, facebook_url: "", instagram_url: "", tiktok_url: "", notes: "",
    payment_status: "unpaid", paid_at: null, work_status: "new", videos_done: 0, images_done: 0, admin_notes: "",
  },
  {
    id: "d3", code: "RDZ-C-B9XDR", created_at: hoursAgo(52),
    first_name: "ياسين", last_name: "تجريبي", phone: "0770000003", activity: "قاعة رياضة",
    package_id: "double", package_name: "المضاعف", videos_total: 14, images_total: 14, price_dzd: 18000,
    has_pages: true, facebook_url: "https://facebook.com/example", instagram_url: "https://instagram.com/example", tiktok_url: "https://tiktok.com/@example",
    notes: "", payment_status: "paid", paid_at: hoursAgo(48), work_status: "in_progress",
    videos_done: 5, images_done: 6, admin_notes: "بعث صور القاعة. يستنى فيديو العرض الجديد.",
  },
  {
    id: "d4", code: "RDZ-C-H2PKN", created_at: hoursAgo(30),
    first_name: "أمين", last_name: "تجريبي", phone: "0550000004", activity: "مطعم أو فاست فود",
    package_id: "daily", package_name: "اليومي", videos_total: 7, images_total: 7, price_dzd: 10000,
    has_pages: true, facebook_url: "مطعم تجريبي", instagram_url: "", tiktok_url: "",
    notes: "", payment_status: "paid", paid_at: hoursAgo(20), work_status: "new",
    videos_done: 0, images_done: 0, admin_notes: "",
  },
  {
    id: "d5", code: "RDZ-C-Q6VZE", created_at: hoursAgo(230),
    first_name: "ليلى", last_name: "تجريبية", phone: "0660000005", activity: "محل أثاث أو ديكور",
    package_id: "daily", package_name: "اليومي", videos_total: 7, images_total: 7, price_dzd: 10000,
    has_pages: true, facebook_url: "https://facebook.com/example", instagram_url: "", tiktok_url: "",
    notes: "", payment_status: "paid", paid_at: hoursAgo(220), work_status: "delivered",
    videos_done: 7, images_done: 7, admin_notes: "",
  },
];

// ── الدخول ──
export async function currentUser() {
  if (!live) return { email: "demo" };
  const { data } = await supabase.auth.getSession();
  return data.session ? data.session.user : null;
}

export async function signIn(email, password) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return !error;
}

export async function signOut() {
  if (live) await supabase.auth.signOut();
}

export async function isAdmin() {
  if (!live) return true;
  const { data, error } = await supabase.from("admins").select("user_id").limit(1);
  return !error && data.length === 1;
}

// ── الطلبيات ──
export async function listOrders() {
  if (!live) return demoOrders.map((o) => ({ ...o }));
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) throw error;
  return data;
}

export async function updateOrder(id, patch) {
  if (!live) {
    demoOrders = demoOrders.map((o) => (o.id === id ? { ...o, ...patch } : o));
    return { ...demoOrders.find((o) => o.id === id) };
  }
  const { data, error } = await supabase.from("orders").update(patch).eq("id", id).select().single();
  if (error) throw error;
  return data;
}
