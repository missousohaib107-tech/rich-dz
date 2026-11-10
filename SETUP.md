# RICH DZ — كيفاش يخدم الموقع

الموقع فيه زوج صفحات:

- **الموقع للزبائن**: `https://missousohaib107-tech.github.io/rich-dz/`
- **لوحة الطلبيات (ليك وحدك)**: `https://missousohaib107-tech.github.io/rich-dz/admin/`

وروابط المعاينة تاع الزبائن (`/preview/<CODE>/`) باقيين كيما كانو.

## 1. ربط قاعدة البيانات (مرة وحدة)

حتى تدير هذي الخطوات، الطلب يروح في واتساب واللوحة تبان بطلبيات تجريبية.

1. حل حساب مجاني في [supabase.com](https://supabase.com) ودير **New project** (سميه `rich-dz`).
2. ادخل **SQL Editor**، الصق كل ما في الملف `supabase/schema.sql` واضغط **Run**.
3. ادخل **Authentication ← Users ← Add user** ودير الإيمايل وكلمة السر اللي تدخل بيهم للوحة.
4. ارجع لـ **SQL Editor** ونفذ هذا السطر (بدل الإيمايل بتاعك):

   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'YOUR_EMAIL_HERE';
   ```

5. ادخل **Project Settings ← API Keys** وانسخ:
   - **Project URL**
   - **Publishable key** (في المشاريع القديمة اسمو `anon` key)
6. حطهم في `src/site.config.js`:

   ```js
   export const backend = {
     supabaseUrl: "https://xxxx.supabase.co",
     supabaseKey: "sb_publishable_xxxx",
   };
   ```

> المفتاح **Publishable / anon** عادي يكون في الموقع، الحماية راهي في قاعدة البيانات.
> المفتاح **Secret / service_role** ما تحطوش في الموقع وما تبعثو لحتى واحد.

المشروع المجاني في Supabase يتوقف إذا قعد أسبوع بلا حركة. الملف
`.github/workflows/keepalive.yml` يبعث نداء صغير 3 مرات في اليوم باش يبقى صاحي.

## 2. تبديل المحتوى

كلش في ملف واحد: `src/site.config.js`

| واش تحب تبدل | وين |
| --- | --- |
| الأسعار والباقات | `packages` (وبدل نفس السعر في جدول `packages` في Supabase) |
| عمل جديد في «أعمالنا» | زيد سطر في `works` |
| الفيديو بوجهك | `introVideo` |
| شروحات فتح الصفحات | `tutorials` |
| الأسئلة | `faqs` |

كل فيديو هو مجلد فيه `poster.jpg` و `hls/index.m3u8`:

- أعمال الواجهة في `public/works/<الاسم>/`
- معاينات الزبائن في `public/preview/<CODE>/`

إذا درنا عمل تصوري لشركة ما طلبتوش منا، نزيدو `concept: true` في السطر تاعو.
يبان عليه شريط «نموذج تصوري» باش الزائر يعرف بلي ماشي طلبية من الشركة.

## 3. النشر

كل `push` للفرع `main` ينشر الموقع وحدو (GitHub Actions).

```bash
npm install
npm run dev      # تجربة في الجهاز
npm run build    # نسخة النشر
```
