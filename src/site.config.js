// ─────────────────────────────────────────────────────────────
// RICH DZ — كل محتوى الموقع في ملف واحد.
// تبدل سعر، تزيد عمل جديد، تحط فيديو: كلش من هنا.
// ─────────────────────────────────────────────────────────────

export const brand = {
  name: "RICH DZ",
  phoneDisplay: "0559 555 313",
  whatsapp: "213559555313",
  email: "missousohaib107@gmail.com",
};

export const payment = {
  holder: "Missoum Sohaib",
  rip: "00799999004328679817",
  ccp: "0043286798 clé 17",
};

// قاعدة البيانات (Supabase، مشروع rich-dz). هذا المفتاح عمومي (publishable):
// عادي يكون في الموقع، والحماية راهي في قواعد القاعدة (supabase/schema.sql).
// إذا تفرغو هذو الزوج، الطلب يرجع يتبعث في واتساب.
export const backend = {
  supabaseUrl: "https://ijpjpdkiznvovlgoeevm.supabase.co",
  supabaseKey: "sb_publishable__6AylpgDtLNs8fdkBM_zkQ_B1QM_lzX",
};

// الباقات الأسبوعية. إذا بدلت سعر هنا، بدلو ثاني في جدول packages
// في قاعدة البيانات (السعر اللي يتسجل في الطلب يجي من تما).
// perDay = شحال من فيديو (وصورة) في اليوم. spoken = السعر كيما يتقال.
export const packages = [
  {
    id: "daily",
    name: "اليومي",
    videos: 7,
    images: 7,
    perDay: 1,
    price: 10000,
    spoken: "مليون",
    line: "فيديو وصورة كل يوم",
  },
  {
    id: "double",
    name: "المضاعف",
    videos: 14,
    images: 14,
    perDay: 2,
    price: 18000,
    spoken: "مليون و800",
    line: "زوج فيديوهات وزوج صور كل يوم",
  },
];

export const customOffer = {
  name: "عرض خاص",
  line: "تحب أكثر من 14 فيديو في الأسبوع؟ تواصل معانا ونديرولك عرض يليق بيك.",
};

// فيديو شرح الخدمة (موشن غرافيك، RDZ-INTRO-01). يبان الأول في واجهة الموقع.
// كي تصور الفيديو بوجهك: حطو في مجلد جديد في public/media/ وبدل المسار هنا.
export const introVideo = {
  path: "media/intro",
  title: "RICH DZ: كيفاش نخدمو",
  flag: "شوف كيفاش نخدمو",
  duration: "0:37",
};

// الأعمال. كل عمل هو مجلد فيه poster.jpg و hls/index.m3u8
// الخمسة الأولين هوما اللي يبانو في واجهة الموقع.
// concept: true  ← عمل تصوري درناه من عندنا، ماشي طلبية من الشركة.
//                   يبان عليه شريط "نموذج تصوري" باش الزبون ما يتغلطش.
export const workCategories = [
  { id: "food", label: "مأكولات" },
  { id: "fashion", label: "ملابس" },
  { id: "beauty", label: "تجميل" },
  { id: "sport", label: "رياضة ومكملات" },
  { id: "shops", label: "محلات وديكور" },
  { id: "companies", label: "شركات" },
  { id: "tech", label: "منصات ومواقع" },
  { id: "schools", label: "مدارس وتكوين" },
  { id: "health", label: "صحة" },
];

export const works = [
  {
    path: "works/ab-nutrition",
    title: "موزع المكملات الغذائية بالجملة",
    client: "AB Nutrition",
    category: "sport",
    duration: "0:55",
  },
  {
    path: "works/knf-bld-01",
    title: "كنافة مقرمشة وحلويات بيتية",
    client: "حلويات بيتية، البليدة",
    category: "food",
    duration: "0:23",
  },
  {
    path: "preview/RDZ-DIDA-01",
    title: "تعريف بالصالون",
    client: "Salon Dida Beauty، باتنة",
    category: "beauty",
    duration: "1:02",
  },
  {
    path: "works/kaftan-atl-1011",
    title: "قفطان القطيفة",
    client: "محل ألبسة تقليدية",
    category: "fashion",
    duration: "0:21",
  },
  {
    path: "preview/RDZ-MILINA-0911",
    title: "تخفيضات تفريغ المحل",
    client: "Milina Déco",
    category: "shops",
    duration: "0:37",
  },
  {
    path: "works/eurl-cgd",
    title: "شبكات مكافحة الحرائق",
    client: "EURL CGD، جيجل",
    category: "companies",
    duration: "0:27",
  },
  {
    path: "preview/RDZ-KIP-0111",
    title: "أوربيتراك KPOWER",
    client: "Yacine Sport",
    category: "sport",
    duration: "1:00",
  },
  {
    path: "works/palmier-affaire",
    title: "فيلم تعريفي بالمنصة",
    client: "Palmier Affaire",
    category: "tech",
    duration: "0:50",
  },
  {
    path: "preview/RDZ-ENS-1006",
    title: "لونسومبل سبور، 3 ألوان",
    client: "محل ملابس",
    category: "fashion",
    duration: "0:36",
  },
  {
    path: "preview/RDZ-AJYAL-FILM-01",
    title: "فيلم تعريفي بالمدرسة",
    client: "École Ajyal، تبسة",
    category: "schools",
    duration: "1:06",
  },
  {
    path: "preview/RDZ-VET-PONT-01",
    title: "عيادة بيطرية مفتوحة ليل ونهار",
    client: "Clinique Vétérinaire du Pont",
    category: "health",
    duration: "0:40",
  },
  {
    path: "preview/RDZ-MF-055",
    title: "إعلان منتوج",
    client: "مراير فطومة",
    category: "food",
    duration: "0:55",
  },
  {
    path: "preview/RDZ-AJYAL-DC-01",
    title: "نادي المحادثة بالألمانية",
    client: "École Ajyal، تبسة",
    category: "schools",
    duration: "0:36",
  },
  {
    path: "preview/RDZ-AJYAL-DC-03",
    title: "إطلاق Ajyal Deutsch Club",
    client: "École Ajyal، تبسة",
    category: "schools",
    duration: "1:33",
  },
];

// شروحات "كيفاش تحل صفحة". كي يوجد الفيديو، بدل null بمسار المجلد
// مثلا: path: "media/tuto-facebook"
export const tutorials = [
  { id: "facebook", name: "فيسبوك", title: "كيفاش تحل صفحة فيسبوك لمحلك", path: "media/tuto-facebook" },
  { id: "instagram", name: "انستغرام", title: "كيفاش تحل حساب انستغرام مهني", path: "media/tuto-instagram" },
  { id: "tiktok", name: "تيك توك", title: "كيفاش تحل حساب تيك توك لتجارتك", path: "media/tuto-tiktok" },
];

export const activities = [
  "محل ملابس",
  "مطعم أو فاست فود",
  "حلويات أو مخبزة",
  "صالون تجميل أو حلاقة",
  "محل أثاث أو ديكور",
  "مواد غذائية",
  "عيادة أو صيدلية",
  "مدرسة أو مركز تكوين",
  "قاعة رياضة",
  "شركة",
  "بيع أونلاين",
];

export const faqs = [
  {
    q: "كيفاش نخلّص؟",
    a: "في بداية كل أسبوع، بـ BaridiMob ولا CCP. تكمل معانا أسبوع بأسبوع.",
  },
  {
    q: "وقتاش يبدا الأسبوع تاعي؟",
    a: "من النهار اللي يتأكد فيه الدفع. من تما كل يوم يوصلك المحتوى تاعو.",
  },
  {
    q: "واش لازم نبعثلكم؟",
    a: "صور ولا فيديوهات للمنتوج تاعك، اللوغو إذا عندك، وروابط صفحاتك. الأفكار والسكريبت والمونتاج علينا.",
  },
  {
    q: "ما نعرفش ننشر، واش ندير؟",
    a: "نوريوك كلش: كيفاش تنشر كل فيديو وكل صورة في فيسبوك، انستغرام وتيك توك، خطوة بخطوة.",
  },
  {
    q: "إذا ما عجبنيش فيديو؟",
    a: "كل فيديو يوصلك معاينة قبل. تقولنا واش تبدل، نعدلوه، ومن بعد تستلم النسخة النهائية.",
  },
  {
    q: "نحب أكثر من 14 فيديو في الأسبوع؟",
    a: "تواصل معانا ونديرولك عرض خاص يليق بالنشاط تاعك.",
  },
  {
    q: "ما عنديش صفحات مازال، واش ندير؟",
    a: "اختار «ما عنديش مازال» في الطلب. نوريوك كيفاش تحلهم، ونبداو المحتوى مع بعض من الأول.",
  },
];
