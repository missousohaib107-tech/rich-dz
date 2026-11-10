import { backend } from "../site.config.js";

// عميل Supabase للموقع العمومي. يتحمل غير كي نحتاجوه (بعث طلب ولا رفع وصل)
// باش الصفحة الرئيسية تبقى خفيفة. بلا حفظ جلسة: الزائر ديما "زائر".
let clientPromise;

export function getClient() {
  if (!clientPromise) {
    clientPromise = import("@supabase/supabase-js").then(({ createClient }) =>
      createClient(backend.supabaseUrl, backend.supabaseKey, {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      }),
    );
  }
  return clientPromise;
}
