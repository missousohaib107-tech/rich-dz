// نداء خفيف لقاعدة البيانات. Supabase يوقف المشاريع المجانية اللي ما فيها حتى حركة
// لمدة أسبوع، وهذا النداء اليومي يخليها صاحية. يتنفذ من GitHub Actions.
import { backend } from "../src/site.config.js";

if (!backend.supabaseUrl || !backend.supabaseKey) {
  console.log("Supabase is not configured yet, nothing to ping.");
  process.exit(0);
}

const headers = { "Content-Type": "application/json", apikey: backend.supabaseKey };
if (backend.supabaseKey.startsWith("eyJ")) headers.Authorization = `Bearer ${backend.supabaseKey}`;

const res = await fetch(`${backend.supabaseUrl}/rest/v1/rpc/ping`, { method: "POST", headers, body: "{}" });
console.log("ping:", res.status, await res.text());
if (!res.ok) process.exit(1);
