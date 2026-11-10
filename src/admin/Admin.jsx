import { useCallback, useEffect, useMemo, useState } from "react";
import { formatDZD, imagesLabel } from "../lib/orders.js";
import { currentUser, isAdmin, listOrders, live, receiptUrl, signIn, signOut, updateOrder } from "./data.js";

const relative = new Intl.RelativeTimeFormat("ar-DZ", { numeric: "auto" });
const dateOnly = new Intl.DateTimeFormat("ar-DZ", { day: "numeric", month: "long" });

function timeAgo(iso) {
  const min = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return "دروك";
  if (min < 60) return relative.format(-min, "minute");
  const h = Math.round(min / 60);
  if (h < 24) return relative.format(-h, "hour");
  const d = Math.round(h / 24);
  if (d < 7) return relative.format(-d, "day");
  return dateOnly.format(new Date(iso));
}

function phonePretty(p) {
  return p.length === 10 ? `${p.slice(0, 4)} ${p.slice(4, 6)} ${p.slice(6, 8)} ${p.slice(8)}` : p;
}

// الروابط يكتبها الزبون، ما نديروش فيها ثقة: نفتحو غير http/https
function safeLink(value) {
  const v = value.trim();
  if (/^https?:\/\/\S+$/i.test(v)) return v;
  if (/^(www\.)?(facebook|fb|instagram|tiktok)\.com\/\S+$/i.test(v)) return `https://${v}`;
  return null;
}

const TABS = [
  { id: "queue", label: "للخدمة", empty: "ما كاين حتى طلبية مخلّصة تستنى الخدمة." },
  { id: "unpaid", label: "تستنى الدفع", empty: "ما كاين حتى طلبية تستنى الدفع." },
  { id: "delivered", label: "مسلّمة", empty: "مازال ما سلّمت حتى طلبية." },
  { id: "all", label: "الكل", empty: "مازال ما وصلت حتى طلبية. كي يبعث زبون طلب من الموقع يبان هنا." },
];

function bucket(o) {
  if (o.work_status === "cancelled") return "cancelled";
  if (o.work_status === "delivered") return "delivered";
  return o.payment_status === "paid" ? "queue" : "unpaid";
}

function SignIn({ onDone }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [wrong, setWrong] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setWrong(false);
    const ok = await signIn(email.trim(), password);
    setBusy(false);
    if (ok) onDone();
    else setWrong(true);
  }

  return (
    <main className="gate">
      <span className="wordmark">RICH DZ</span>
      <h1 className="gate__title">لوحة الطلبيات</h1>
      <form className="gate__form" onSubmit={submit}>
        <div className="field">
          <label className="field__label" htmlFor="email">
            الإيمايل
          </label>
          <input className="input latin" id="email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="field">
          <label className="field__label" htmlFor="password">
            كلمة السر
          </label>
          <input className="input latin" id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {wrong && (
          <p className="field__error" role="alert">
            الإيمايل ولا كلمة السر غالطين.
          </p>
        )}
        <button className="btn btn--gold btn--block" disabled={busy}>
          {busy ? "راهو يدخل" : "ادخل"}
        </button>
      </form>
    </main>
  );
}

function Stepper({ label, done, total, onChange }) {
  return (
    <div className="count">
      <span className="count__label">{label}</span>
      <div className="count__bar" role="img" aria-label={`${label}: ${done} من ${total}`}>
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={i < done ? "count__cell count__cell--on" : "count__cell"} />
        ))}
      </div>
      <div className="count__ctl">
        <button type="button" onClick={() => onChange(done - 1)} disabled={done <= 0} aria-label={`نقّص ${label}`}>
          −
        </button>
        <span className="count__num latin">
          {done}/{total}
        </span>
        <button type="button" onClick={() => onChange(done + 1)} disabled={done >= total} aria-label={`زيد ${label}`}>
          +
        </button>
      </div>
    </div>
  );
}

function CopyButton({ text, label = "انسخ" }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="btn btn--line btn--small"
      onClick={() => {
        if (!navigator.clipboard) return;
        navigator.clipboard.writeText(text).then(() => {
          setDone(true);
          setTimeout(() => setDone(false), 1800);
        });
      }}
    >
      {done ? "تنسخ" : label}
    </button>
  );
}

// طلب جاهز تلصقو في Claude كي تحب تحضر الخطة بيدك
function claudeBrief(o) {
  const pages = [o.facebook_url, o.instagram_url, o.tiktok_url].filter(Boolean).join("، ");
  return [
    "حضّرلي خطة محتوى أسبوع لزبون RICH DZ.",
    `الزبون: ${o.first_name} ${o.last_name}`,
    `النشاط: ${o.activity}`,
    `واش يبيع: ${o.offer || "ما كتبش"}`,
    `الباقة: ${o.videos_total} فيديو و${imagesLabel(o.images_total)} في الأسبوع`,
    `الصفحات: ${o.has_pages ? pages || "ما كتبش الروابط" : "ما عندوش صفحات مازال"}`,
    o.notes ? `ملاحظة الزبون: ${o.notes}` : null,
    "",
    "لكل فيديو: الفكرة، السكريبت بالدارجة، برومبت الفيديو، برومبت الصورة، والكابشن. كلش جاهز للنسخ.",
  ]
    .filter((line) => line !== null)
    .join("\n");
}

const RECEIPT_STATE = {
  waiting: "الوصل ترفع. قارنو مع حسابك وأكّد الدفع.",
  ok: "Claude قرا الوصل: المبلغ والحساب يطابقو.",
  problem: "Claude قرا الوصل: فيه حاجة ماشي هي.",
};

function Receipt({ order: o }) {
  const [url, setUrl] = useState(null);
  const [failed, setFailed] = useState(false);

  if (!o.receipt_path) return null;

  async function show() {
    setFailed(false);
    try {
      setUrl(await receiptUrl(o.receipt_path));
    } catch {
      setFailed(true);
    }
  }

  return (
    <section className={`receipt receipt--${o.payment_status === "paid" ? "paid" : o.receipt_check}`}>
      <div className="receipt__head">
        <div>
          <h3 className="card__sub">وصل الدفع</h3>
          <p className="receipt__state">
            {o.payment_status === "paid" && o.receipt_check !== "problem" ? "الدفع مأكد." : RECEIPT_STATE[o.receipt_check] || RECEIPT_STATE.waiting}
          </p>
        </div>
        {!url && (
          <button type="button" className="btn btn--line btn--small" onClick={show}>
            شوف الوصل
          </button>
        )}
      </div>
      {o.receipt_note && <p className="receipt__note">{o.receipt_note}</p>}
      {failed && (
        <p className="field__error" role="alert">
          الصورة ما تحملتش. عاود جرب.
        </p>
      )}
      {url && (
        <a className="receipt__img" href={url} target="_blank" rel="noopener">
          <img src={url} alt={`وصل الدفع تاع ${o.first_name} ${o.last_name}`} />
        </a>
      )}
      {o.payment_status !== "paid" && <p className="receipt__warn">الصورة وحدها ماشي دليل. تأكد بلي الدراهم دخلو لحسابك قبل ما تأكد.</p>}
    </section>
  );
}

const PLAN_PARTS = [
  ["script", "السكريبت"],
  ["video_prompt", "برومبت الفيديو"],
  ["image_prompt", "برومبت الصورة"],
  ["caption", "الكابشن"],
];

function Plan({ order: o }) {
  const items = o.plan?.items || [];

  if (!items.length) {
    return (
      <section className="plan">
        <h3 className="card__sub">خطة المحتوى</h3>
        <p className="plan__empty">الخطة مازال ما تحضرتش لهذا الزبون.</p>
        <CopyButton text={claudeBrief(o)} label="انسخ الطلب لـ Claude" />
      </section>
    );
  }

  return (
    <section className="plan">
      <h3 className="card__sub">
        خطة المحتوى <span className="plan__n">{items.length} من {o.videos_total}</span>
      </h3>
      {o.plan.summary && <p className="plan__summary">{o.plan.summary}</p>}
      {items.map((it, i) => (
        <details className="plan__item" key={i}>
          <summary className="plan__q">
            <span className="plan__day latin">{it.day ?? i + 1}</span>
            {it.idea}
          </summary>
          {PLAN_PARTS.filter(([key]) => it[key]).map(([key, label]) => (
            <div className="plan__part" key={key}>
              <div className="plan__bar">
                <span className="plan__label">{label}</span>
                <CopyButton text={it[key]} />
              </div>
              <p className="plan__text" dir="auto">
                {it[key]}
              </p>
            </div>
          ))}
        </details>
      ))}
    </section>
  );
}

// يبعث للزبون رابط المعاينة تاع فيديو واجد
function SendPreview({ order: o, intl }) {
  const [code, setCode] = useState("");
  const clean = code.trim().toUpperCase();
  const valid = /^[A-Z0-9][A-Z0-9-]{2,40}$/.test(clean);
  const link = `${window.location.origin}${import.meta.env.BASE_URL}preview/${clean}/`;
  const text = `السلام عليكم ${o.first_name}،\nالفيديو تاعك واجد للمعاينة:\n${link}\nرمز الفيديو: ${clean}\nشوفو وقولنا إذا تحب تبدل حاجة.`;

  return (
    <section className="send">
      <h3 className="card__sub">ابعث فيديو للزبون</h3>
      <div className="send__row">
        <input
          className="input latin"
          aria-label="رمز الفيديو"
          placeholder="رمز الفيديو، مثلا RDZ-KIP-0111"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        {valid ? (
          <a className="btn btn--wa" href={`https://wa.me/${intl}?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener">
            ابعث المعاينة
          </a>
        ) : (
          <button type="button" className="btn btn--line" disabled>
            ابعث المعاينة
          </button>
        )}
      </div>
    </section>
  );
}

function OrderCard({ order: o, position, onPatch }) {
  const [note, setNote] = useState(o.admin_notes);
  useEffect(() => setNote(o.admin_notes), [o.admin_notes]);

  const state = bucket(o);
  const intl = `213${o.phone.slice(1)}`;
  const pages = [
    ["فيسبوك", o.facebook_url],
    ["انستغرام", o.instagram_url],
    ["تيك توك", o.tiktok_url],
  ].filter(([, v]) => v);
  const allDone = o.videos_done >= o.videos_total && o.images_done >= o.images_total;

  const progress = (patch) =>
    onPatch(o.id, { ...patch, ...(o.work_status === "new" ? { work_status: "in_progress" } : {}) });

  return (
    <article className={`card card--${state}`}>
      <header className="card__head">
        {position && <span className="card__pos latin">{position}</span>}
        <span className="code card__code">{o.code}</span>
        <span className="card__when">{timeAgo(o.created_at)}</span>
      </header>

      <div className="card__who">
        <h2 className="card__name">
          {o.first_name} {o.last_name}
        </h2>
        <p className="card__activity">{o.activity}</p>
      </div>

      <div className="card__contact">
        <a className="btn btn--line btn--small latin" href={`tel:${o.phone}`}>
          {phonePretty(o.phone)}
        </a>
        <a className="btn btn--line btn--small" href={`https://wa.me/${intl}`} target="_blank" rel="noopener">
          واتساب
        </a>
      </div>

      <p className="card__pack">
        <span>
          باقة {o.package_name}: {o.videos_total} فيديو و{imagesLabel(o.images_total)}
        </span>
        <strong>
          <span className="latin">{formatDZD(o.price_dzd)}</span> دج
        </strong>
      </p>

      {state === "queue" && (
        <div className="card__work">
          <Stepper label="الفيديوهات" done={o.videos_done} total={o.videos_total} onChange={(n) => progress({ videos_done: n })} />
          <Stepper label="الصور" done={o.images_done} total={o.images_total} onChange={(n) => progress({ images_done: n })} />
        </div>
      )}

      <Receipt order={o} />
      {(state === "queue" || o.plan || o.receipt_path) && state !== "cancelled" && <Plan order={o} />}
      {state === "queue" && <SendPreview order={o} intl={intl} />}

      <dl className="card__facts">
        {o.offer && (
          <div>
            <dt>واش يبيع</dt>
            <dd>{o.offer}</dd>
          </div>
        )}
        <div>
          <dt>الصفحات</dt>
          <dd>
            {!o.has_pages && "ما عندوش صفحات، لازم نعاونوه يحلهم"}
            {o.has_pages && pages.length === 0 && "ما كتبش الروابط"}
            {o.has_pages &&
              pages.map(([name, value]) => {
                const href = safeLink(value);
                return href ? (
                  <a key={name} href={href} target="_blank" rel="noopener noreferrer nofollow">
                    {name}
                  </a>
                ) : (
                  <span key={name}>
                    {name}: <bdi>{value}</bdi>
                  </span>
                );
              })}
          </dd>
        </div>
        {o.notes && (
          <div>
            <dt>ملاحظة الزبون</dt>
            <dd>{o.notes}</dd>
          </div>
        )}
      </dl>

      <div className="field">
        <label className="field__label" htmlFor={`note-${o.id}`}>
          ملاحظتي
        </label>
        <textarea
          className="input card__note"
          id={`note-${o.id}`}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onBlur={() => note !== o.admin_notes && onPatch(o.id, { admin_notes: note })}
          placeholder="تتسجل وحدها كي تخرج من الخانة"
        />
      </div>

      <footer className="card__actions">
        {state === "unpaid" && (
          <>
            <button
              type="button"
              className="btn btn--gold"
              onClick={() => onPatch(o.id, { payment_status: "paid", paid_at: new Date().toISOString() })}
            >
              أكّد الدفع
            </button>
            <button
              type="button"
              className="btn btn--line"
              onClick={() => window.confirm(`تلغي الطلبية ${o.code}؟`) && onPatch(o.id, { work_status: "cancelled" })}
            >
              الغي
            </button>
          </>
        )}
        {state === "queue" && (
          <>
            <button
              type="button"
              className={allDone ? "btn btn--gold" : "btn btn--line"}
              onClick={() =>
                (allDone || window.confirm("مازال ما كملتش كل الفيديوهات والصور. تسجلها مسلّمة؟")) &&
                onPatch(o.id, { work_status: "delivered" })
              }
            >
              سجّلها مسلّمة
            </button>
            {o.videos_done === 0 && o.images_done === 0 && (
              <button
                type="button"
                className="card__undo"
                onClick={() => onPatch(o.id, { payment_status: "unpaid", paid_at: null, work_status: "new" })}
              >
                الدفع ما وصلش، رجّعها
              </button>
            )}
          </>
        )}
        {state === "delivered" && (
          <button type="button" className="card__undo" onClick={() => onPatch(o.id, { work_status: "in_progress" })}>
            رجّعها للخدمة
          </button>
        )}
        {state === "cancelled" && (
          <button type="button" className="card__undo" onClick={() => onPatch(o.id, { work_status: "new" })}>
            ملغية. رجّعها
          </button>
        )}
      </footer>
    </article>
  );
}

function Board({ onSignOut }) {
  const [orders, setOrders] = useState(null);
  const [tab, setTab] = useState(null);
  const [problem, setProblem] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setOrders(await listOrders());
      setProblem("");
    } catch {
      setProblem("الطلبيات ما تحملوش. شوف الأنترنت وعاود.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(() => document.visibilityState === "visible" && load(), 60000);
    const onShow = () => document.visibilityState === "visible" && load();
    document.addEventListener("visibilitychange", onShow);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onShow);
    };
  }, [load]);

  const patch = useCallback(async (id, changes) => {
    try {
      const saved = await updateOrder(id, changes);
      setOrders((list) => list.map((o) => (o.id === id ? saved : o)));
      setProblem("");
    } catch {
      setProblem("التبديل ما تسجلش. عاود جرب.");
    }
  }, []);

  const groups = useMemo(() => {
    const g = { queue: [], unpaid: [], delivered: [], all: orders || [] };
    for (const o of orders || []) {
      const b = bucket(o);
      if (g[b]) g[b].push(o);
    }
    // طابور الخدمة: اللي خلّص الأول يتخدم الأول
    g.queue.sort((a, b) => new Date(a.paid_at) - new Date(b.paid_at));
    return g;
  }, [orders]);

  const weekIncome = useMemo(() => {
    const since = Date.now() - 7 * 24 * 3600 * 1000;
    return (orders || [])
      .filter((o) => o.payment_status === "paid" && o.work_status !== "cancelled" && new Date(o.paid_at).getTime() >= since)
      .reduce((sum, o) => sum + o.price_dzd, 0);
  }, [orders]);

  const active = tab || (groups.queue.length || !groups.unpaid.length ? "queue" : "unpaid");
  const shown = groups[active];

  return (
    <>
      <header className="bar">
        <div className="bar__row">
          <span className="wordmark">RICH DZ</span>
          <div className="bar__actions">
            <button type="button" className="btn btn--line btn--small" onClick={load} disabled={loading}>
              {loading ? "يحدّث" : "حدّث"}
            </button>
            {live && (
              <button type="button" className="btn btn--line btn--small" onClick={onSignOut}>
                اخرج
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="board">
        {!live && (
          <p className="board__demo" role="note">
            وضع تجريبي. هذو طلبيات وهمية باش تشوف اللوحة كيفاش تخدم، والتبديلات ما يتسجلوش. الطلبيات الحقيقية يبانو كي نربطو
            قاعدة البيانات.
          </p>
        )}

        <section className="sum" aria-label="ملخص">
          <div>
            <p className="sum__label">مدخول آخر 7 أيام</p>
            <p className="sum__value">
              <span className="latin">{formatDZD(weekIncome)}</span> دج
            </p>
          </div>
          <div>
            <p className="sum__label">تستنى الدفع</p>
            <p className="sum__value latin">{groups.unpaid.length}</p>
          </div>
        </section>

        <div className="tabs" role="tablist" aria-label="الطلبيات">
          {TABS.map((t) => (
            <button
              type="button"
              role="tab"
              key={t.id}
              className="tabs__tab"
              aria-selected={active === t.id}
              onClick={() => setTab(t.id)}
            >
              {t.label}
              <span className="tabs__n latin">{groups[t.id].length}</span>
            </button>
          ))}
        </div>

        {problem && (
          <p className="form__alert" role="alert">
            {problem}
          </p>
        )}

        {orders === null && !problem && <p className="board__empty">الطلبيات راهم يتحملو</p>}
        {orders !== null && shown.length === 0 && <p className="board__empty">{TABS.find((t) => t.id === active).empty}</p>}

        <div className="cards">
          {shown.map((o, i) => (
            <OrderCard key={o.id} order={o} position={active === "queue" ? i + 1 : null} onPatch={patch} />
          ))}
        </div>
      </main>
    </>
  );
}

export default function Admin() {
  const [phase, setPhase] = useState("loading"); // loading | signin | denied | ready

  const check = useCallback(async () => {
    const user = await currentUser();
    if (!user) return setPhase("signin");
    setPhase((await isAdmin()) ? "ready" : "denied");
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  const leave = async () => {
    await signOut();
    setPhase("signin");
  };

  if (phase === "loading") return <main className="gate" aria-busy="true" />;
  if (phase === "signin") return <SignIn onDone={check} />;
  if (phase === "denied") {
    return (
      <main className="gate">
        <span className="wordmark">RICH DZ</span>
        <h1 className="gate__title">هذا الحساب ماشي مسؤول</h1>
        <p className="gate__text">الحساب دخل، بصح ما عندوش الحق يشوف الطلبيات. زيدو في جدول admins (الخطوة الأخيرة في SETUP.md).</p>
        <button type="button" className="btn btn--line" onClick={leave}>
          اخرج
        </button>
      </main>
    );
  }
  return <Board onSignOut={leave} />;
}
