import { useEffect, useRef, useState } from "react";
import { activities, packages, payment } from "../site.config.js";
import {
  backendReady,
  contentsLabel,
  formatDZD,
  orderWhatsAppLink,
  packageById,
  receiptWhatsAppLink,
  submitOrder,
  uploadMaterial,
  uploadReceipt,
  validateOrder,
} from "../lib/orders.js";
import { CheckIcon, WhatsAppIcon } from "./icons.jsx";

const OTHER = "__other__";

const empty = {
  firstName: "",
  lastName: "",
  phone: "",
  activityChoice: "",
  activityOther: "",
  offer: "",
  hasPages: true,
  facebook: "",
  instagram: "",
  tiktok: "",
  notes: "",
  trap: "",
};

function CopyButton({ text }) {
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
      {done ? "تنسخ" : "انسخ"}
    </button>
  );
}

function Field({ id, label, hint, error, children }) {
  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      {children}
      {hint && !error && <span className="field__hint">{hint}</span>}
      {error && (
        <span className="field__error" id={`${id}-error`} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

const RECEIPT_ERRORS = {
  "not-image": "هذا الملف ماشي صورة. ارفع صورة ولا سكرين شوت تاع الوصل.",
  "too-big": "الصورة ثقيلة بزاف. ابعث سكرين شوت بلاصتها.",
  "not-found": "ما لقيناش طلب بهذا الرمز وهذا الرقم. شوف الرمز ورقم الهاتف اللي طلبت بيه.",
  "too-many": "وصلت للحد: 12 صورة للطلب. الباقي ابعثهم في واتساب.",
  network: "الصورة ما طلعتش. شوف الأنترنت وعاود، ولا ابعثها في واتساب.",
};

// رفع صور المنتوج واللوغو (حتى 12 صورة). كل صورة تطلع وحدها باش وحدة خاسرة ما تحبسش الباقي.
function MaterialsUpload({ code, phone }) {
  const [sent, setSent] = useState(0);
  const [busy, setBusy] = useState(null); // null ولا { done, total }
  const [error, setError] = useState("");

  async function onFiles(e) {
    const files = [...e.target.files].slice(0, 12);
    e.target.value = "";
    if (!files.length) return;
    setError("");
    let ok = 0;
    let failed = "";
    for (let i = 0; i < files.length; i += 1) {
      setBusy({ done: i, total: files.length });
      const result = await uploadMaterial({ code, phone, file: files[i] });
      if (result.ok) ok += 1;
      else failed = result.reason;
      if (result.reason === "too-many" || result.reason === "not-found") break;
    }
    setBusy(null);
    setSent((n) => n + ok);
    if (failed) setError(RECEIPT_ERRORS[failed] || RECEIPT_ERRORS.network);
  }

  return (
    <div className="upload">
      {sent > 0 && (
        <p className="upload__done" role="status">
          <CheckIcon />
          وصلتنا {sent === 1 ? "صورة وحدة" : sent === 2 ? "زوج صور" : `${sent} صور`}. تقدر تزيد صور أخرى.
        </p>
      )}
      <label className={busy ? "btn btn--line btn--block upload__btn is-busy" : "btn btn--line btn--block upload__btn"} htmlFor={`materials-${code || "later"}`}>
        {busy ? `الصور راهم يطلعو (${busy.done + 1} من ${busy.total})` : "ارفع صور المنتوج واللوغو"}
      </label>
      <input className="upload__input" id={`materials-${code || "later"}`} type="file" accept="image/*" multiple onChange={onFiles} disabled={Boolean(busy)} />
      {error && (
        <p className="field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

// رفع صورة وصل الدفع
function ReceiptUpload({ code, phone, later = false }) {
  const [state, setState] = useState("idle"); // idle | busy | done
  const [error, setError] = useState("");
  const id = later ? "receipt-later" : "receipt-now";

  async function onFile(e) {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    setState("busy");
    setError("");
    const result = await uploadReceipt({ code, phone, file });
    if (result.ok) return setState("done");
    setState("idle");
    setError(RECEIPT_ERRORS[result.reason] || RECEIPT_ERRORS.network);
  }

  if (state === "done") {
    return (
      <p className="upload__done" role="status">
        <CheckIcon />
        الوصل وصلنا. نأكدو الدفع ويبدا الأسبوع تاعك.
      </p>
    );
  }

  return (
    <div className="upload">
      <label className={state === "busy" ? "btn btn--main btn--block upload__btn is-busy" : "btn btn--main btn--block upload__btn"} htmlFor={id}>
        {state === "busy" ? "الصورة راهي تطلع" : "ارفع صورة الوصل"}
      </label>
      <input className="upload__input" id={id} type="file" accept="image/*" onChange={onFile} disabled={state === "busy"} />
      {error && (
        <p className="field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

// للي طلب من قبل: يكتب رمز الطلب ورقم الهاتف مرة وحدة، ويرفع الوصل ولا صور المنتوج
function LaterUploads() {
  const [code, setCode] = useState("");
  const [phone, setPhone] = useState("");
  return (
    <div className="upload">
      <div className="form__pair">
        <Field id="receipt-code" label="رمز الطلب">
          <input className="input latin" id="receipt-code" placeholder="RDZ-C-" value={code} onChange={(e) => setCode(e.target.value)} />
        </Field>
        <Field id="receipt-phone" label="رقم الهاتف">
          <input className="input latin" id="receipt-phone" type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </Field>
      </div>
      <ReceiptUpload code={code} phone={phone} later />
      <MaterialsUpload code={code} phone={phone} />
    </div>
  );
}

// وصل الطلب: يبان بعد ما يتسجل الطلب في قاعدة البيانات
function OrderSlip({ code, phone, pkg, onAgain }) {
  const ref = useRef(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);
  const free = pkg.price === 0;

  return (
    <div className="slip">
      <h3 className="slip__title" tabIndex={-1} ref={ref}>
        طلبك وصلنا
      </h3>

      <div className="slip__box">
        <span className="slip__label">رمز الطلب</span>
        <div className="slip__row">
          <span className="code slip__code">{code}</span>
          <CopyButton text={code} />
        </div>
      </div>

      <div className="slip__box">
        <span className="slip__label">
          {pkg.kind === "week" ? `باقة ${pkg.name}: ${contentsLabel(pkg)}` : pkg.kind === "trial" ? `${pkg.name}: ${contentsLabel(pkg)}` : pkg.name}
        </span>
        <span className="slip__amount">
          {free ? (
            "مجاني"
          ) : (
            <>
              <span className="latin">{formatDZD(pkg.price)}</span> دج{pkg.kind === "week" ? " للأسبوع" : ""}
            </>
          )}
        </span>
      </div>

      {free ? (
        <ol className="slip__steps">
          <li>ارفع صور المنتوج واللوغو تحت.</li>
          <li>نخدمولك فيديو {pkg.seconds} ثانية ونبعثولك رابط تشوفو فيه.</li>
          <li>عجبك؟ خيّر فيديو واحد ولا باقة.</li>
        </ol>
      ) : (
        <>
          <ol className="slip__steps">
            <li>خلّص المبلغ في واحد من الحسابين اللي تحت.</li>
            <li>ارفع صورة الوصل هنا في الموقع.</li>
            <li>نأكدو الدفع ونبداو الخدمة. الدفع قبل الخدمة.</li>
          </ol>

          <div className="slip__box">
            <span className="slip__label">BaridiMob (RIP)</span>
            <div className="slip__row">
              <span className="code slip__num">{payment.rip}</span>
              <CopyButton text={payment.rip} />
            </div>
          </div>

          <div className="slip__box">
            <span className="slip__label">CCP</span>
            <div className="slip__row">
              <span className="code slip__num">{payment.ccp}</span>
              <CopyButton text={payment.ccp} />
            </div>
            <span className="slip__label">
              صاحب الحساب: <bdi>{payment.holder}</bdi>
            </span>
          </div>

          <ReceiptUpload code={code} phone={phone} />

          <a className="btn btn--line btn--block" href={receiptWhatsAppLink(code)} target="_blank" rel="noopener">
            <WhatsAppIcon />
            ولا ابعث الوصل في واتساب
          </a>
        </>
      )}

      <div className="slip__box">
        <span className="slip__label">{free ? "صور المنتوج" : "باش نبداو المحتوى تاعك"}</span>
        <p className="slip__text">ابعثلنا صور المنتوج واللوغو إذا عندك. كل ما كانت الصور واضحة، الفيديو يخرج خير.</p>
        <MaterialsUpload code={code} phone={phone} />
      </div>

      {!free && <p className="form__after">تخلّص من بعد؟ احفظ رمز الطلب، وارجع ارفع الوصل من قسم الطلب.</p>}

      <button type="button" className="slip__again" onClick={onAgain}>
        طلب آخر
      </button>
    </div>
  );
}

export default function OrderForm({ packageId, onPackage }) {
  const [v, setV] = useState(empty);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | done | whatsapp
  const [code, setCode] = useState("");
  const [problem, setProblem] = useState(null); // null | "offline" | "too-many" | "trial-used" | "trial-full"

  // كي الزبون يصحح خانة، رسالة الخطأ تاعها تروح
  const set = (key) => (e) => {
    setV((s) => ({ ...s, [key]: e.target.value }));
    const errorKey = key.startsWith("activity") ? "activity" : key;
    setErrors((found) => {
      if (!found[errorKey]) return found;
      const { [errorKey]: _cleared, ...rest } = found;
      return rest;
    });
  };

  const order = {
    ...v,
    packageId,
    activity: v.activityChoice === OTHER ? v.activityOther : v.activityChoice,
  };

  async function onSubmit(e) {
    e.preventDefault();
    if (v.trap) return; // روبوت عمّر الحقل المخبي
    const found = validateOrder(order);
    setErrors(found);
    setProblem(null);
    const first = Object.keys(found)[0];
    if (first) {
      const target = first === "activity" ? "activityChoice" : first;
      document.getElementById(`order-${target}`)?.focus();
      return;
    }

    // قاعدة البيانات مازال ما تربطتش: الطلب يروح في واتساب مباشرة
    if (!backendReady) {
      window.open(orderWhatsAppLink(order), "_blank", "noopener");
      setStatus("whatsapp");
      return;
    }

    setStatus("sending");
    const result = await submitOrder(order);
    if (result.ok) {
      setCode(result.code);
      setStatus("done");
      return;
    }
    setStatus("idle");
    setProblem(["too-many", "trial-used", "trial-full"].includes(result.reason) ? result.reason : "offline");
  }

  if (status === "done") {
    return (
      <OrderSlip
        code={code}
        phone={v.phone}
        pkg={packageById(packageId)}
        onAgain={() => {
          setV(empty);
          setStatus("idle");
        }}
      />
    );
  }

  if (status === "whatsapp") {
    return (
      <div className="slip">
        <h3 className="slip__title">كمّل الطلب في واتساب</h3>
        <p>فتحنالك واتساب والطلب مكتوب فيه كامل. اضغط «إرسال» باش يوصلنا.</p>
        <a className="btn btn--wa btn--block" href={orderWhatsAppLink(order)} target="_blank" rel="noopener">
          <WhatsAppIcon />
          افتح واتساب
        </a>
        <button type="button" className="slip__again" onClick={() => setStatus("idle")}>
          ارجع للطلب
        </button>
      </div>
    );
  }

  const invalid = (key) => (errors[key] ? { "aria-invalid": true, "aria-describedby": `order-${key}-error` } : {});

  return (
    <form className="form" onSubmit={onSubmit} noValidate>
      <fieldset className="form__group">
        <legend className="form__legend">العرض</legend>
        {packages.map((p) => (
          <label className="pick" key={p.id}>
            <input
              type="radio"
              name="package"
              id={p.id === packages[0].id ? "order-packageId" : undefined}
              value={p.id}
              checked={packageId === p.id}
              onChange={() => onPackage(p.id)}
            />
            <span className="pick__dot" aria-hidden="true" />
            <span className="pick__name">
              {p.name}
              <span className="pick__sub">
                {p.kind === "week" ? `${contentsLabel(p)} في الأسبوع` : p.kind === "trial" ? `${p.seconds} ثانية، مرة وحدة لكل زبون` : "فيديو إعلاني لمنتوجك"}
              </span>
            </span>
            <span className="pick__price">{p.price === 0 ? "مجاني" : <><span className="latin">{formatDZD(p.price)}</span> دج</>}</span>
          </label>
        ))}
        {errors.packageId && (
          <span className="field__error" role="alert">
            {errors.packageId}
          </span>
        )}
      </fieldset>

      <fieldset className="form__group">
        <legend className="form__legend">معلوماتك</legend>
        <div className="form__pair">
          <Field id="order-firstName" label="الاسم" error={errors.firstName}>
            <input
              className="input"
              id="order-firstName"
              autoComplete="given-name"
              value={v.firstName}
              onChange={set("firstName")}
              {...invalid("firstName")}
            />
          </Field>
          <Field id="order-lastName" label="اللقب" error={errors.lastName}>
            <input
              className="input"
              id="order-lastName"
              autoComplete="family-name"
              value={v.lastName}
              onChange={set("lastName")}
              {...invalid("lastName")}
            />
          </Field>
        </div>
        <Field id="order-phone" label="رقم الهاتف" hint="باش نتواصلو معاك على الطلب." error={errors.phone}>
          <input
            className="input latin"
            id="order-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="05 / 06 / 07"
            value={v.phone}
            onChange={set("phone")}
            {...invalid("phone")}
          />
        </Field>
        <Field id="order-activityChoice" label="نوع النشاط" error={v.activityChoice !== OTHER && errors.activity}>
          <select
            className="input"
            id="order-activityChoice"
            value={v.activityChoice}
            onChange={set("activityChoice")}
            {...(errors.activity && v.activityChoice !== OTHER
              ? { "aria-invalid": true, "aria-describedby": "order-activityChoice-error" }
              : {})}
          >
            <option value="" disabled>
              اختار
            </option>
            {activities.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
            <option value={OTHER}>نشاط آخر</option>
          </select>
        </Field>
        {v.activityChoice === OTHER && (
          <Field id="order-activityOther" label="واش هو النشاط تاعك؟" error={errors.activity}>
            <input
              className="input"
              id="order-activityOther"
              value={v.activityOther}
              onChange={set("activityOther")}
              {...(errors.activity ? { "aria-invalid": true, "aria-describedby": "order-activityOther-error" } : {})}
            />
          </Field>
        )}
        <Field
          id="order-offer"
          label="واش تبيع بالضبط؟"
          hint="مثلا: ملابس نسائية وأحذية، ولا بيتزا وطاكوس، ولا قص وصباغة الشعر."
          error={errors.offer}
        >
          <textarea
            className="input input--short"
            id="order-offer"
            maxLength={600}
            value={v.offer}
            onChange={set("offer")}
            {...invalid("offer")}
          />
        </Field>
      </fieldset>

      <fieldset className="form__group">
        <legend className="form__legend">صفحاتك</legend>
        <div className="toggle">
          <button type="button" aria-pressed={v.hasPages} onClick={() => setV((s) => ({ ...s, hasPages: true }))}>
            عندي صفحات
          </button>
          <button type="button" aria-pressed={!v.hasPages} onClick={() => setV((s) => ({ ...s, hasPages: false }))}>
            ما عنديش مازال
          </button>
        </div>
        {v.hasPages ? (
          <>
            <Field id="order-facebook" label="فيسبوك" hint="الرابط ولا اسم الصفحة. عمّر غير اللي عندك.">
              <input className="input" id="order-facebook" value={v.facebook} onChange={set("facebook")} dir="auto" />
            </Field>
            <Field id="order-instagram" label="انستغرام">
              <input className="input" id="order-instagram" value={v.instagram} onChange={set("instagram")} dir="auto" />
            </Field>
            <Field id="order-tiktok" label="تيك توك">
              <input className="input" id="order-tiktok" value={v.tiktok} onChange={set("tiktok")} dir="auto" />
            </Field>
          </>
        ) : (
          <p className="form__note">
            ما كاين حتى مشكل. ابعث الطلب، ونوريوك كيفاش تحل صفحاتك قبل ما يبدا الأسبوع.{" "}
            <a href="#guides">شوف الشروحات</a>
          </p>
        )}
      </fieldset>

      <fieldset className="form__group">
        <legend className="form__legend">حاجة تحب تزيدها؟</legend>
        <Field id="order-notes" label="ملاحظة" hint="مثلا: منتوج تحب نركزو عليه، ولا عرض عندك هذا الأسبوع.">
          <textarea className="input" id="order-notes" maxLength={1000} value={v.notes} onChange={set("notes")} />
        </Field>
      </fieldset>

      <div className="form__trap" aria-hidden="true">
        <label>
          لا تعمر هذا الحقل
          <input tabIndex={-1} autoComplete="off" value={v.trap} onChange={set("trap")} />
        </label>
      </div>

      {problem === "trial-used" && (
        <p className="form__alert" role="alert">
          الفيديو التجريبي مرة وحدة لكل رقم، وهذا الرقم جرّب من قبل. خيّر فيديو واحد ولا باقة.
        </p>
      )}

      {problem === "trial-full" && (
        <p className="form__alert" role="alert">
          الفيديوهات التجريبية تاع هذا الأسبوع كملو. جرّب الأسبوع الجاي، ولا خيّر فيديو واحد.
        </p>
      )}

      {problem === "too-many" && (
        <p className="form__alert" role="alert">
          بعثت بزاف طلبيات بهذا الرقم. استنى شوية ولا راسلنا في واتساب.
        </p>
      )}

      {problem === "offline" ? (
        <div className="form__group">
          <p className="form__alert" role="alert">
            الطلب ما تسجلش في الموقع. ابعثو في واتساب، كل المعلومات اللي عمرتها تروح معاه.
          </p>
          <a className="btn btn--wa btn--block" href={orderWhatsAppLink(order)} target="_blank" rel="noopener">
            <WhatsAppIcon />
            ابعث الطلب في واتساب
          </a>
          <button type="submit" className="btn btn--line btn--block" disabled={status === "sending"}>
            عاود جرب في الموقع
          </button>
        </div>
      ) : (
        <div className="form__group">
          <button type="submit" className="btn btn--main btn--block" disabled={status === "sending"}>
            {status === "sending" ? "الطلب راهو يتبعث" : backendReady ? "ابعث الطلب" : "ابعث الطلب في واتساب"}
          </button>
          <p className="form__after">
            {packageById(packageId)?.price === 0 ? "الفيديو التجريبي مجاني، ما كاين حتى دفع." : "ما تخلّص والو دروك. طرق الدفع تبانلك بعد ما تبعث الطلب."}
          </p>
        </div>
      )}
    </form>
  );
}

export function OrderSection({ packageId, onPackage }) {
  return (
    <section className="section order" id="order">
      <div className="wrap order__grid">
        <div className="order__intro" data-reveal="up">
          <h2 className="section__title">ابعث طلبك</h2>
          <p className="section__lead">عمّر الطلب وحنا نتكفلو بالباقي. كلش يتسجل عندنا منظم، وما يضيع حتى تفصيل.</p>
          <ul className="order__points">
            <li>
              <CheckIcon />
              الطلب يدي دقيقة
            </li>
            <li>
              <CheckIcon />
              يوصلك رمز خاص بطلبك
            </li>
            <li>
              <CheckIcon />
              نوريوك كيفاش تنشر كل فيديو
            </li>
          </ul>
          {backendReady && (
            <details className="later">
              <summary className="later__q">طلبت من قبل؟ ارفع الوصل ولا صور المنتوج</summary>
              <LaterUploads />
            </details>
          )}
        </div>
        <OrderForm packageId={packageId} onPackage={onPackage} />
      </div>
    </section>
  );
}
