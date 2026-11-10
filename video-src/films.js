// The four films as data: each scene has a duration (seconds), its markup,
// and "cues" (seconds into the scene) where a soft sound lands on something appearing.

// words rising one after another
const W = (text, d = 0, step = 0.09) =>
  text.split(" ").map((w, i) => `<span class="w" style="--d:${(d + i * step).toFixed(2)}s">${w}</span>`).join(" ");

const week = (d, step = 0.12) =>
  `<div class="week">${Array.from({ length: 7 }, (_, i) => `<span class="cell on" style="--d:${(d + i * step).toFixed(2)}s"></span>`).join("")}</div>`;

const days = (d) =>
  `<div class="days fade" style="--d:${d}s">${[1, 2, 3, 4, 5, 6, 7].map((n) => `<span>${n}</span>`).join("")}</div>`;

const POSTERS = [
  "works/ab-nutrition", "works/knf-bld-01", "preview/RDZ-DIDA-01", "works/kaftan-atl-1011",
  "preview/RDZ-MILINA-0911", "works/eurl-cgd", "preview/RDZ-KIP-0111",
];

const intro = {
  code: "RDZ-INTRO-01",
  scenes: [
    {
      dur: 4.8, cues: [0.1, 1.9],
      html: `<div class="inner">
        <h1 class="display huge">${W("صفحتك راقدة؟", 0.1, 0.16)}</h1>
        <div class="week fade" style="--d:1s">${"<span class='cell'></span>".repeat(7)}</div>
        <p class="hint fade" style="--d:1.2s">0 منشور هذا الأسبوع</p>
        <p class="body">${W("الزبون يشوف غير اللي ينشر كل يوم", 1.9, 0.08)}</p>
      </div>`,
    },
    {
      dur: 5.6, cues: [0.1, 1.0, 1.25, 1.5, 1.75, 2.0, 2.25, 2.5],
      html: `<div class="inner">
        <p class="wordmark fade" style="--d:.1s">RICH DZ</p>
        <h1 class="display big">${W("محتوى محلك، جاهز كل أسبوع", 0.2, 0.12)}</h1>
        <div class="shots">${POSTERS.map((p, i) =>
          `<div class="shot pop" style="--d:${(1 + i * 0.25).toFixed(2)}s"><img src="../public/${p}/poster.jpg" alt=""><b>${i + 1}</b></div>`).join("")}</div>
        <p class="body gold">${W("فيديو وصورة إعلانية كل يوم", 3.1, 0.08)}</p>
      </div>`,
    },
    {
      dur: 5.6, cues: [0.1, 0.9, 2.1],
      html: `<div class="inner">
        <h1 class="display huge up" style="--d:.1s">اليومي</h1>
        <p class="head">${W("7 فيديو و7 صور في الأسبوع", 0.5, 0.09)}</p>
        ${week(0.9)}${days(1.0)}
        <div class="price up" style="--d:2s"><span class="num gold ltr" data-from="0" data-to="10000" data-at="2.1" data-len="1.1">0</span><span class="unit">دج</span></div>
        <p class="hint">${W("في الأسبوع، يعني مليون", 3.1, 0.08)}</p>
      </div>`,
    },
    {
      dur: 5.8, cues: [0.1, 0.9, 1.5, 2.4],
      html: `<div class="inner">
        <h1 class="display huge up" style="--d:.1s">المضاعف</h1>
        <p class="head">${W("14 فيديو و14 صورة في الأسبوع", 0.5, 0.09)}</p>
        ${week(0.9, 0.08)}${week(1.5, 0.08)}${days(1.1)}
        <div class="price up" style="--d:2.3s"><span class="num gold ltr" data-from="10000" data-to="18000" data-at="2.4" data-len="1.1">10,000</span><span class="unit">دج</span></div>
        <p class="hint">${W("في الأسبوع، يعني مليون و800", 3.4, 0.08)}</p>
      </div>`,
    },
    {
      dur: 3.4, cues: [0.1],
      html: `<div class="inner">
        <h1 class="display big">${W("تحب أكثر؟", 0.1, 0.14)}</h1>
        <p class="head gold">${W("نديرولك عرض خاص يليق بيك", 0.7, 0.1)}</p>
      </div>`,
    },
    {
      dur: 6.8, cues: [0.1, 0.8, 1.6, 2.4, 3.2],
      html: `<div class="inner">
        <h1 class="display big up" style="--d:.1s">كيفاش تمشي</h1>
        <div class="steps">
          <div class="step up" style="--d:.8s"><i>1</i><span>تطلب باقتك من الموقع</span></div>
          <div class="step up" style="--d:1.6s"><i>2</i><span>تخلّص الأسبوع بـ BaridiMob ولا CCP</span></div>
          <div class="step up" style="--d:2.4s"><i>3</i><span>تشوف كل فيديو قبل ما تستلمو</span></div>
          <div class="step up" style="--d:3.2s"><i>4</i><span>تستلم، ونوريوك كيفاش تنشر</span></div>
        </div>
      </div>`,
    },
    {
      dur: 5.2, cues: [0.1, 1.2],
      html: `<div class="inner">
        <h1 class="display huge">${W("اطلب باقتك اليوم", 0.1, 0.16)}</h1>
        <div class="rule" style="--d:1s"></div>
        <p class="wordmark up" style="--d:1.2s; font-size:76px">RICH DZ</p>
        <p class="head up" style="--d:1.6s"><span class="ltr">0559 555 313</span></p>
      </div>`,
    },
  ],
};

// one tutorial step: counter, what to do, and a plain phone list with the row to tap
const tutoStep = (n, total, title, hint, rows, hi) => ({
  dur: 4.8, cues: [0.1, 1.5],
  html: `<div class="inner">
    <p class="count up" style="--d:.1s">${n}/${total}</p>
    <h1 class="tut">${W(title, 0.25, 0.08)}</h1>
    <p class="hint up" style="--d:.9s">${hint}</p>
    <div class="phone up" style="--d:.5s">${rows.map((r, i) => {
      const on = hi.includes(i);
      const d = (1.5 + hi.indexOf(i) * 0.45).toFixed(2);
      return `<div class="row${on ? " hi" : ""}" style="--d:${d}s">${r}${on ? `<span class="tap" style="--d:${d}s"></span>` : ""}</div>`;
    }).join("")}</div>
  </div>`,
});

const tutoTitle = (platform, title, count) => ({
  dur: 4, cues: [0.1, 1.0],
  html: `<div class="inner">
    <p class="wordmark fade" style="--d:.1s">RICH DZ</p>
    <p class="head gold up" style="--d:.2s">${platform}</p>
    <h1 class="tut" style="font-size:128px">${W(title, 0.4, 0.11)}</h1>
    <div class="rule" style="--d:1.3s"></div>
    <p class="body up" style="--d:1.5s">في ${count} خطوات</p>
    <p class="hint up" style="--d:1.9s">الأسماء تقدر تتبدل شوية حسب لغة التطبيق</p>
  </div>`,
});

const tutoDone = (title, line) => ({
  dur: 5.4, cues: [0.1, 1.2, 2.6],
  html: `<div class="inner center">
    <svg class="check" viewBox="0 0 300 300"><circle cx="150" cy="150" r="130" style="--len:820; --d:.1s"/><path d="M92 156 l42 42 l78 -92" style="--len:180; --d:.6s"/></svg>
    <h1 class="tut" style="font-size:128px">${W(title, 0.9, 0.12)}</h1>
    <p class="body">${W(line, 1.7, 0.08)}</p>
    <div class="rule" style="--d:2.5s; transform-origin:center"></div>
    <p class="head gold up" style="--d:2.7s">اطلب باقتك من</p>
    <p class="wordmark up" style="--d:3s; font-size:76px">RICH DZ</p>
  </div>`,
});

const tutoFacebook = {
  code: "RDZ-TUTO-FB-01",
  scenes: [
    tutoTitle("فيسبوك", "كيفاش تحل صفحة لمحلك", 5),
    tutoStep(1, 5, "افتح فيسبوك وادخل للقائمة", "الثلاث خطوط ☰ في ركن الشاشة", ["الرئيسية", "الفيديو", "الإشعارات", "القائمة ☰"], [3]),
    tutoStep(2, 5, "اختار «الصفحات»", "تلقاها وسط القائمة", ["الأصدقاء", "المجموعات", "الصفحات", "المحفوظات"], [2]),
    tutoStep(3, 5, "اضغط على «إنشاء»", "صفحة جديدة خاصة بمحلك", ["صفحاتك", "الدعوات", "الصفحات اللي عجبوك", "+ إنشاء"], [3]),
    tutoStep(4, 5, "اكتب اسم محلك واختار الفئة", "مثلا: ملابس، مطعم، صالون", ["اسم الصفحة", "الفئة", "نبذة قصيرة"], [0, 1]),
    tutoStep(5, 5, "زيد الصور ومعلومات الاتصال", "باش الزبون يلقاك ويتصل بيك", ["صورة البروفيل", "صورة الغلاف", "رقم الهاتف", "العنوان"], [0, 1, 2, 3]),
    tutoDone("صفحتك واجدة", "دروك خاصها محتوى كل يوم"),
  ],
};

const tutoInstagram = {
  code: "RDZ-TUTO-IG-01",
  scenes: [
    tutoTitle("انستغرام", "كيفاش تحل حساب مهني", 5),
    tutoStep(1, 5, "ادخل للبروفيل وافتح القائمة", "الثلاث خطوط ☰ في الركن الفوقاني", ["البروفيل", "تعديل البروفيل", "مشاركة البروفيل", "القائمة ☰"], [3]),
    tutoStep(2, 5, "ادخل «الإعدادات والنشاط»", "أول حاجة في القائمة", ["الإعدادات والنشاط", "المحفوظات", "الأرشيف", "نشاطك"], [0]),
    tutoStep(3, 5, "اختار «نوع الحساب والأدوات»", "اهبط شوية تلقاها", ["الإشعارات", "الخصوصية", "نوع الحساب والأدوات", "المساعدة"], [2]),
    tutoStep(4, 5, "اضغط «التبديل إلى حساب احترافي»", "مجاني وما يبدل والو في منشوراتك", ["التبديل إلى حساب احترافي", "إضافة حساب جديد"], [0]),
    tutoStep(5, 5, "اختار الفئة ثم «نشاط تجاري»", "وزيد رقم الهاتف باش يتصلو بيك", ["فئة نشاطك", "نشاط تجاري", "رقم الهاتف"], [0, 1, 2]),
    tutoDone("حسابك ولّى مهني", "تشوف الإحصائيات وتزيد زر الاتصال"),
  ],
};

const tutoTiktok = {
  code: "RDZ-TUTO-TT-01",
  scenes: [
    tutoTitle("تيك توك", "كيفاش تحل حساب لتجارتك", 5),
    tutoStep(1, 5, "افتح تيك توك وادخل للبروفيل", "الأيقونة في الركن التحتاني", ["الرئيسية", "الأصدقاء", "الرسائل", "البروفيل"], [3]),
    tutoStep(2, 5, "افتح القائمة", "الثلاث خطوط ☰ في الركن الفوقاني", ["تعديل البروفيل", "مشاركة البروفيل", "القائمة ☰"], [2]),
    tutoStep(3, 5, "ادخل «الإعدادات والخصوصية»", "", ["أدوات المبدعين", "رمز QR", "الإعدادات والخصوصية"], [2]),
    tutoStep(4, 5, "اختار «الحساب»", "في بعض النسخ اسمها «إدارة الحساب»", ["الحساب", "الخصوصية", "الأمان", "الإشعارات"], [0]),
    tutoStep(5, 5, "اضغط «التبديل إلى حساب تجاري»", "مجاني، ومن بعد اختار فئة نشاطك", ["معلومات الحساب", "كلمة السر", "التبديل إلى حساب تجاري"], [2]),
    tutoDone("حسابك التجاري واجد", "دروك خاصو فيديو كل يوم"),
  ],
};

const FILMS = { intro, "tuto-facebook": tutoFacebook, "tuto-instagram": tutoInstagram, "tuto-tiktok": tutoTiktok };
