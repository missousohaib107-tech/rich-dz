-- ─────────────────────────────────────────────────────────────
-- RICH DZ — قاعدة بيانات الطلبيات (Supabase / Postgres)
-- تتنفذ مرة وحدة: Supabase → SQL Editor → الصق كلش → Run
--
-- الحماية:
--   • الزائر ما يقدر يقرا حتى حاجة. يقدر برك ينادي create_order.
--   • الطلبيات يقراها ويبدلها غير الحساب اللي مسجل في جدول admins.
--   • السعر ما يجيش من المتصفح، يتحسب هنا من جدول packages.
--   • الزائر يقدر يرفع صورة وصل، بصح ما يقدرش يشوف حتى وصل. الوصولات يشوفهم المسؤول برك.
-- ─────────────────────────────────────────────────────────────

create table if not exists public.packages (
  id         text primary key,
  name       text not null,
  videos     int  not null check (videos > 0),
  images     int  not null check (images >= 0),
  price_dzd  int  not null check (price_dzd >= 0),   -- 0 = عرض مجاني
  active     boolean not null default true,
  weekly_cap int  check (weekly_cap is null or weekly_cap > 0)   -- أقصى عدد طلبيات في 7 أيام
);

-- العرض المجاني: مرة لكل رقم هاتف، وما يتعداش weekly_cap في الأسبوع.
insert into public.packages (id, name, videos, images, price_dzd, weekly_cap) values
  ('trial',  'فيديو تجريبي', 1,  0,     0, 10),
  ('single', 'فيديو واحد',   1,  0,  3500, null),
  ('daily',  'اليومي',       7,  7, 10000, null),
  ('double', 'المضاعف',     14, 14, 18000, null)
on conflict (id) do nothing;

create table if not exists public.orders (
  id              uuid primary key default gen_random_uuid(),
  code            text not null unique,
  created_at      timestamptz not null default now(),

  first_name      text not null,
  last_name       text not null,
  phone           text not null,
  activity        text not null,
  offer           text not null default '',   -- واش يبيع الزبون بالضبط

  package_id      text not null references public.packages(id),
  package_name    text not null,
  videos_total    int  not null,
  images_total    int  not null,
  price_dzd       int  not null,

  has_pages       boolean not null default true,
  facebook_url    text not null default '',
  instagram_url   text not null default '',
  tiktok_url      text not null default '',
  notes           text not null default '',

  payment_status  text not null default 'unpaid'
                  check (payment_status in ('unpaid', 'paid')),
  paid_at         timestamptz,
  work_status     text not null default 'new'
                  check (work_status in ('new', 'in_progress', 'delivered', 'cancelled')),
  videos_done     int  not null default 0 check (videos_done >= 0),
  images_done     int  not null default 0 check (images_done >= 0),
  admin_notes     text not null default '',

  -- وصل الدفع اللي يرفعو الزبون من الموقع
  receipt_path    text,
  receipt_at      timestamptz,
  -- none: ما كاين وصل | waiting: وصل مازال ما تقراش | ok: المعلومات تطابق | problem: فيه حاجة ماشي هي
  receipt_check   text not null default 'none'
                  check (receipt_check in ('none', 'waiting', 'ok', 'problem')),
  receipt_note    text not null default '',

  -- صور المنتوج واللوغو اللي يبعثهم الزبون (مسارات في المخزن materials)
  materials       text[] not null default '{}',

  -- خطة المحتوى اللي يحضرها Claude: { "summary": "...", "items": [ { "day", "idea", "script",
  --   "video_prompt", "image_prompt", "caption" } ] }
  plan            jsonb,
  plan_at         timestamptz
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_phone_idx on public.orders (phone);

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

alter table public.packages enable row level security;
alter table public.orders   enable row level security;
alter table public.admins   enable row level security;

-- الدوال المساعدة تاع الحماية في مخطط خاص: السياسات تستعملهم، بصح ما يتنادوش من برا (API).
create schema if not exists app_private;
grant usage on schema app_private to anon, authenticated;

create or replace function app_private.is_admin()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()));
$$;
revoke all on function app_private.is_admin() from public;
grant execute on function app_private.is_admin() to authenticated;

drop policy if exists "admin reads own row" on public.admins;
create policy "admin reads own row" on public.admins
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "admin reads orders" on public.orders;
create policy "admin reads orders" on public.orders
  for select to authenticated using (app_private.is_admin());

drop policy if exists "admin updates orders" on public.orders;
create policy "admin updates orders" on public.orders
  for update to authenticated using (app_private.is_admin()) with check (app_private.is_admin());

drop policy if exists "admin reads packages" on public.packages;
create policy "admin reads packages" on public.packages
  for select to authenticated using (app_private.is_admin());

drop policy if exists "admin updates packages" on public.packages;
create policy "admin updates packages" on public.packages
  for update to authenticated using (app_private.is_admin()) with check (app_private.is_admin());

-- الزائر ما عندو حتى صلاحية مباشرة على الجداول.
-- الحساب المسجل عندو صلاحية، بصح السياسات الفوق تخلي غير المسؤول يشوف.
revoke all on public.orders, public.packages, public.admins from anon, authenticated;
grant select, update on public.orders   to authenticated;
grant select, update on public.packages to authenticated;
grant select         on public.admins   to authenticated;

-- ── تسجيل طلب جديد (الحاجة الوحيدة اللي يقدر يديرها الزائر) ──
create or replace function public.create_order(
  p_first_name text,
  p_last_name  text,
  p_phone      text,
  p_activity   text,
  p_package    text,
  p_offer      text default '',
  p_has_pages  boolean default true,
  p_facebook   text default '',
  p_instagram  text default '',
  p_tiktok     text default '',
  p_notes      text default ''
)
returns text
language plpgsql security definer set search_path = public
as $$
declare
  v_first  text := btrim(coalesce(p_first_name, ''));
  v_last   text := btrim(coalesce(p_last_name, ''));
  v_act    text := btrim(coalesce(p_activity, ''));
  v_phone  text := regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g');
  v_pkg    public.packages%rowtype;
  v_code   text;
  v_free   boolean;
  v_chars  constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
begin
  if v_phone like '00213%' then v_phone := '0' || substr(v_phone, 6);
  elsif v_phone like '213%' then v_phone := '0' || substr(v_phone, 4);
  end if;

  if v_phone !~ '^0[1-9][0-9]{7,8}$'               then raise exception 'invalid_phone'; end if;
  if char_length(v_first) not between 2 and 60     then raise exception 'invalid_first_name'; end if;
  if char_length(v_last)  not between 2 and 60     then raise exception 'invalid_last_name'; end if;
  if char_length(v_act)   not between 2 and 120    then raise exception 'invalid_activity'; end if;
  if char_length(coalesce(p_notes, '')) > 1000     then raise exception 'invalid_notes'; end if;
  if char_length(coalesce(p_offer, '')) > 600      then raise exception 'invalid_offer'; end if;
  if greatest(char_length(coalesce(p_facebook, '')),
              char_length(coalesce(p_instagram, '')),
              char_length(coalesce(p_tiktok, ''))) > 300 then raise exception 'invalid_links'; end if;

  select * into v_pkg from public.packages where id = p_package and active;
  if not found then raise exception 'invalid_package'; end if;
  v_free := v_pkg.price_dzd = 0;

  -- نفس الرقم ما يبعثش أكثر من 3 طلبيات في ساعة
  if (select count(*) from public.orders
      where phone = v_phone and created_at > now() - interval '1 hour') >= 3 then
    raise exception 'too_many_orders';
  end if;

  -- العرض المجاني: مرة وحدة لكل رقم
  if v_free and exists (select 1 from public.orders
      where phone = v_phone and package_id = v_pkg.id and work_status <> 'cancelled') then
    raise exception 'trial_used';
  end if;

  -- وعدد محدود في الأسبوع، باش الخدمة المجانية تبقى محسوبة
  if v_pkg.weekly_cap is not null and (select count(*) from public.orders
      where package_id = v_pkg.id and work_status <> 'cancelled'
        and created_at > now() - interval '7 days') >= v_pkg.weekly_cap then
    raise exception 'trial_full';
  end if;

  loop
    select 'RDZ-C-' || string_agg(substr(v_chars, 1 + floor(random() * length(v_chars))::int, 1), '')
      into v_code from generate_series(1, 5);
    begin
      insert into public.orders (
        code, first_name, last_name, phone, activity, offer,
        package_id, package_name, videos_total, images_total, price_dzd,
        has_pages, facebook_url, instagram_url, tiktok_url, notes,
        payment_status, paid_at
      ) values (
        v_code, v_first, v_last, v_phone, v_act, btrim(coalesce(p_offer, '')),
        v_pkg.id, v_pkg.name, v_pkg.videos, v_pkg.images, v_pkg.price_dzd,
        coalesce(p_has_pages, true),
        btrim(coalesce(p_facebook, '')), btrim(coalesce(p_instagram, '')),
        btrim(coalesce(p_tiktok, '')), btrim(coalesce(p_notes, '')),
        -- العرض المجاني ما فيه حتى دفع: يروح مباشرة لطابور الخدمة
        case when v_free then 'paid' else 'unpaid' end,
        case when v_free then now() end
      );
      exit;
    exception when unique_violation then
      -- الرمز خرج مكرر، نولدو واحد آخر
    end;
  end loop;

  return v_code;
end;
$$;

revoke all on function public.create_order(text, text, text, text, text, text, boolean, text, text, text, text) from public;
grant execute on function public.create_order(text, text, text, text, text, text, boolean, text, text, text, text) to anon, authenticated;

-- ── وصل الدفع ──
-- الصور تتحط في مخزن خاص (private). الحد 5 ميغا، وصور برك.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('receipts', 'receipts', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- صور المنتوج واللوغو: مخزن خاص ثاني، الحد 10 ميغا للصورة.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('materials', 'materials', false, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- الرفع مسموح غير في مجلد باسم رمز طلب موجود: اللي ما عندوش طلب ما يقدرش يعمر المخزن.
create or replace function app_private.order_code_exists(p_code text)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.orders where code = p_code and work_status <> 'cancelled');
$$;
revoke all on function app_private.order_code_exists(text) from public;
grant execute on function app_private.order_code_exists(text) to anon, authenticated;

drop policy if exists "anyone uploads a receipt" on storage.objects;
drop policy if exists "anyone uploads order images" on storage.objects;
create policy "anyone uploads order images" on storage.objects
  for insert to anon, authenticated
  with check (
    bucket_id in ('receipts', 'materials')
    and app_private.order_code_exists((storage.foldername(name))[1])
  );

drop policy if exists "admin views receipts" on storage.objects;
drop policy if exists "admin views order images" on storage.objects;
create policy "admin views order images" on storage.objects
  for select to authenticated
  using (bucket_id in ('receipts', 'materials') and app_private.is_admin());

-- يربط الصورة اللي ترفعت بالطلب. لازم رمز الطلب ورقم الهاتف يطابقو.
create or replace function public.attach_receipt(p_code text, p_phone text, p_path text)
returns boolean
language plpgsql security definer set search_path = public
as $$
declare
  v_code  text := upper(btrim(coalesce(p_code, '')));
  v_phone text := regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g');
  v_id    uuid;
begin
  if v_phone like '00213%' then v_phone := '0' || substr(v_phone, 6);
  elsif v_phone like '213%' then v_phone := '0' || substr(v_phone, 4);
  end if;

  if v_code !~ '^RDZ-C-[A-Z0-9]{5}$' then raise exception 'order_not_found'; end if;

  -- المسار لازم يبدا برمز الطلب: RDZ-C-XXXXX/اسم-عشوائي.jpg
  if p_path !~ ('^' || v_code || '/[a-z0-9-]{8,64}\.(jpg|png|webp)$') then
    raise exception 'invalid_path';
  end if;

  select id into v_id from public.orders
    where code = v_code and phone = v_phone and work_status <> 'cancelled';
  if not found then raise exception 'order_not_found'; end if;

  update public.orders
     set receipt_path = p_path, receipt_at = now(), receipt_check = 'waiting', receipt_note = ''
   where id = v_id;
  return true;
end;
$$;

revoke all on function public.attach_receipt(text, text, text) from public;
grant execute on function public.attach_receipt(text, text, text) to anon, authenticated;

-- يزيد صورة منتوج للطلب (حتى 12 صورة للطلب الواحد).
create or replace function public.attach_material(p_code text, p_phone text, p_path text)
returns int
language plpgsql security definer set search_path = public
as $$
declare
  v_code  text := upper(btrim(coalesce(p_code, '')));
  v_phone text := regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g');
  v_id    uuid;
  v_files text[];
  v_count int;
begin
  if v_phone like '00213%' then v_phone := '0' || substr(v_phone, 6);
  elsif v_phone like '213%' then v_phone := '0' || substr(v_phone, 4);
  end if;

  if v_code !~ '^RDZ-C-[A-Z0-9]{5}$' then raise exception 'order_not_found'; end if;
  if p_path !~ ('^' || v_code || '/[a-z0-9-]{8,64}\.(jpg|png|webp)$') then
    raise exception 'invalid_path';
  end if;

  select id, materials into v_id, v_files from public.orders
    where code = v_code and phone = v_phone and work_status <> 'cancelled'
    for update;
  if not found then raise exception 'order_not_found'; end if;
  v_count := coalesce(array_length(v_files, 1), 0);
  if p_path = any (v_files) then return v_count; end if;
  if v_count >= 12 then raise exception 'too_many_files'; end if;

  update public.orders set materials = materials || p_path where id = v_id;
  return v_count + 1;
end;
$$;

revoke all on function public.attach_material(text, text, text) from public;
grant execute on function public.attach_material(text, text, text) to anon, authenticated;

-- سطر في كل مرة مهمة Claude المجدولة تشوف الطلبيات، باش اللوحة تبين وقتاش دارت آخر دورة
create table if not exists public.task_runs (
  id        bigint generated always as identity primary key,
  ran_at    timestamptz not null default now(),
  prepared  int not null default 0,
  note      text not null default ''
);

alter table public.task_runs enable row level security;

drop policy if exists "admin reads task runs" on public.task_runs;
create policy "admin reads task runs" on public.task_runs
  for select to authenticated using (app_private.is_admin());

revoke all on public.task_runs from anon, authenticated;
grant select on public.task_runs to authenticated;

-- نداء خفيف يخلي المشروع المجاني صاحي (يناديه GitHub Actions كل يوم)
create or replace function public.ping()
returns timestamptz language sql stable set search_path = '' as $$ select now(); $$;
grant execute on function public.ping() to anon, authenticated;

-- ─────────────────────────────────────────────────────────────
-- الخطوة الأخيرة: دير روحك مسؤول.
-- 1) Supabase → Authentication → Users → Add user (الإيمايل وكلمة السر تاعك)
-- 2) بدل الإيمايل تحت بالإيمايل تاعك ونفذ هذا السطر وحدو:
--
--   insert into public.admins (user_id)
--   select id from auth.users where email = 'YOUR_EMAIL_HERE';
-- ─────────────────────────────────────────────────────────────
