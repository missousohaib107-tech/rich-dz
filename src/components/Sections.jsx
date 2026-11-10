import { useState } from "react";
import { brand, customOffer, faqs, packages, tutorials, workCategories, works } from "../site.config.js";
import { contentsLabel, formatDZD } from "../lib/orders.js";
import VideoTile from "./VideoTile.jsx";
import { PlayIcon, WhatsAppIcon } from "./icons.jsx";

export function WeekSteps() {
  return (
    <section className="section" id="how">
      <div className="wrap">
        <div className="section__head">
          <h2 className="section__title">كيفاش يمشي الأسبوع معانا</h2>
        </div>
        <ol className="steps">
          <li className="steps__item">
            <h3 className="steps__title">تخيّر باقة وتبعث الطلب</h3>
            <p className="steps__text">تعمر معلوماتك وروابط صفحاتك هنا في الموقع. دقيقة وتكمل.</p>
          </li>
          <li className="steps__item">
            <h3 className="steps__title">تخلّص الأسبوع</h3>
            <p className="steps__text">بـ BaridiMob ولا CCP. الأسبوع يبدا من نهار ما يتأكد الدفع.</p>
          </li>
          <li className="steps__item">
            <h3 className="steps__title">تشوف كل فيديو قبل</h3>
            <p className="steps__text">يوصلك رابط معاينة. إذا تحب تبدل حاجة تقولنا ونعدلوها.</p>
          </li>
          <li className="steps__item">
            <h3 className="steps__title">تستلم وتنشر</h3>
            <p className="steps__text">النسخة النهائية توصلك جاهزة، ونوريوك كيفاش تنشرها في فيسبوك، انستغرام وتيك توك.</p>
          </li>
        </ol>
      </div>
    </section>
  );
}

// كل سطر = أسبوع (7 أيام). سطر واحد = فيديو في اليوم، زوج سطور = زوج في اليوم.
export function Week({ perDay, label }) {
  return (
    <div className="weeks" role="img" aria-label={label}>
      {Array.from({ length: perDay }, (_, row) => (
        <div className="week" key={row}>
          {Array.from({ length: 7 }, (_, i) => (
            <span key={i} className="week__day week__day--on" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function Packages({ onChoose }) {
  return (
    <section className="section" id="packages">
      <div className="wrap">
        <div className="section__head">
          <h2 className="section__title">الباقات الأسبوعية</h2>
          <p className="section__lead">
            كل باقة هي أسبوع محتوى كامل، من أول نهار لسابع نهار. ومع كل باقة نوريوك كيفاش تنشر، خطوة بخطوة.
          </p>
        </div>
        <div className="rates">
          {packages.map((p) => (
            <article className="rate" key={p.id}>
              <div>
                <h3 className="rate__name">{p.name}</h3>
                <p className="rate__line">{p.line}</p>
              </div>
              <p className="rate__price">
                <span className="rate__amount">
                  <span className="latin">{formatDZD(p.price)}</span> دج
                </span>
                <span className="rate__unit">في الأسبوع، يعني {p.spoken}</span>
              </p>
              <div className="rate__week">
                <Week perDay={p.perDay} label={`${p.perDay} فيديو في كل يوم من أيام الأسبوع السبعة`} />
              </div>
              <p className="rate__counts">{contentsLabel(p)}</p>
              <div className="rate__action">
                <a className="btn btn--gold btn--block" href="#order" onClick={() => onChoose(p.id)}>
                  اطلب باقة {p.name}
                </a>
              </div>
            </article>
          ))}
          <article className="rate rate--custom">
            <div>
              <h3 className="rate__name">{customOffer.name}</h3>
              <p className="rate__line">{customOffer.line}</p>
            </div>
            <div className="rate__action">
              <a
                className="btn btn--line btn--block"
                href={`https://wa.me/${brand.whatsapp}?text=${encodeURIComponent("السلام عليكم، حاب عرض خاص لأكثر من 14 فيديو في الأسبوع")}`}
                target="_blank"
                rel="noopener"
              >
                <WhatsAppIcon />
                اطلب عرض خاص
              </a>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

export function Works({ onPlay }) {
  const [filter, setFilter] = useState("all");
  const used = workCategories.filter((c) => works.some((w) => w.category === c.id));
  const hasConcepts = works.some((w) => w.concept);
  const shown = works.filter((w) => {
    if (filter === "all") return true;
    if (filter === "concept") return w.concept;
    return w.category === filter;
  });

  return (
    <section className="section" id="works">
      <div className="wrap">
        <div className="section__head">
          <h2 className="section__title">أعمالنا</h2>
          <p className="section__lead">فيديوهات خدمناها لمحلات ومؤسسات جزائرية. اضغط على أي واحد وشوفو كامل.</p>
        </div>
        <div className="chips" role="group" aria-label="نوع النشاط">
          <button type="button" className="chip" aria-pressed={filter === "all"} onClick={() => setFilter("all")}>
            الكل
          </button>
          {used.map((c) => (
            <button type="button" className="chip" key={c.id} aria-pressed={filter === c.id} onClick={() => setFilter(c.id)}>
              {c.label}
            </button>
          ))}
          {hasConcepts && (
            <button type="button" className="chip" aria-pressed={filter === "concept"} onClick={() => setFilter("concept")}>
              نماذج تصورية
            </button>
          )}
        </div>
        <ul className="works">
          {shown.map((w) => (
            <li key={w.path}>
              <VideoTile video={w} onPlay={onPlay} />
              <h3 className="work__title">{w.title}</h3>
              <p className="work__client">{w.client}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Guides({ onPlay }) {
  return (
    <section className="section" id="guides">
      <div className="wrap">
        <div className="section__head">
          <h2 className="section__title">ما عندكش صفحة؟ نوريوك كيفاش تحلها</h2>
          <p className="section__lead">ثلاث شروحات قصار. تبّع الخطوات وصفحتك توجد في دقايق.</p>
        </div>
        <div className="guides">
          {tutorials.map((t) =>
            t.path ? (
              <button type="button" className="guide" key={t.id} onClick={() => onPlay({ path: t.path, title: t.title })}>
                <span>
                  <span className="guide__name">{t.name}</span>
                  <span className="guide__title">{t.title}</span>
                </span>
                <span className="guide__go">
                  <PlayIcon />
                </span>
              </button>
            ) : (
              <div className="guide" key={t.id}>
                <span>
                  <span className="guide__name">{t.name}</span>
                  <span className="guide__title">{t.title}</span>
                </span>
                <span className="guide__state">الفيديو قريب</span>
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}

export function Sites() {
  const link = `https://wa.me/${brand.whatsapp}?text=${encodeURIComponent("سلام، حاب نخدم موقع")}`;
  return (
    <section className="section" id="sites">
      <div className="wrap">
        <div className="section__head">
          <h2 className="section__title">ونخدمو المواقع ثاني</h2>
          <p className="section__lead">إذا تحب موقع لمحلك مع المحتوى، نخدموهولك حنا.</p>
        </div>
        <div className="sites__list">
          <div className="sites__row">
            <p className="sites__name">
              موقع أساسي
              <span className="sites__what">صفحة تعريفية وحدة، تتسلم في نهار</span>
            </p>
            <p className="sites__price">
              <span className="latin">8,000</span> دج
            </p>
          </div>
          <div className="sites__row">
            <p className="sites__name">
              موقع احترافي
              <span className="sites__what">عدة صفحات، حجز ولا منيو، لوحة تحكم، تسليم في يومين</span>
            </p>
            <p className="sites__price">
              <span className="latin">20,000</span> دج
            </p>
          </div>
          <div className="sites__row">
            <p className="sites__name">
              منصة مخصصة
              <span className="sites__what">حسابات، قاعدة بيانات ولوحة إدارة</span>
            </p>
            <p className="sites__price">
              من <span className="latin">80,000</span> دج
            </p>
          </div>
        </div>
        <a className="btn btn--line" href={link} target="_blank" rel="noopener">
          <WhatsAppIcon />
          اسقسينا على موقع
        </a>
      </div>
    </section>
  );
}

export function Faq() {
  return (
    <section className="section" id="faq">
      <div className="wrap">
        <div className="section__head">
          <h2 className="section__title">أسئلة يسقسيوها بزاف</h2>
        </div>
        <div className="faq">
          {faqs.map((f) => (
            <details className="faq__item" key={f.q}>
              <summary className="faq__q">{f.q}</summary>
              <p className="faq__a">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="foot">
      <div className="wrap foot__row">
        <span className="wordmark">RICH DZ</span>
        <div className="foot__links">
          <a href={`tel:${brand.phoneDisplay.replace(/\s/g, "")}`} className="latin">
            {brand.phoneDisplay}
          </a>
          <a href={`mailto:${brand.email}`} className="latin">
            {brand.email}
          </a>
          <a href={`${import.meta.env.BASE_URL}privacy.html`}>الخصوصية</a>
        </div>
        <span>© 2026 RICH DZ</span>
      </div>
    </footer>
  );
}
