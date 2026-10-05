import { useState, useEffect } from "react";

const services = [
  {
    icon: "🍽️",
    title: "مواقع المطاعم",
    desc: "موقع احترافي مع منيو رقمي، صور الأطباق، ونظام حجز",
    price: "8,000",
  },
  {
    icon: "🏥",
    title: "مواقع الأطباء",
    desc: "نظام حجز مواعيد أونلاين، تعريف بالتخصصات، وموقع موثوق",
    price: "20,000",
  },
  {
    icon: "💈",
    title: "مواقع الصالونات",
    desc: "عرض الخدمات والأسعار مع إمكانية الحجز المباشر",
    price: "8,000",
  },
  {
    icon: "🛒",
    title: "متاجر إلكترونية",
    desc: "منصة بيع أونلاين مع كتالوج منتجات وسلة شراء",
    price: "20,000",
  },
  {
    icon: "🏢",
    title: "مواقع الشركات",
    desc: "موقع تعريفي احترافي يعكس هوية شركتك ويجذب الزبائن",
    price: "20,000",
  },
  {
    icon: "🎬",
    title: "فيديو كرياتيف + موقع",
    desc: "موقع احترافي مع فيديو تسويقي بالذكاء الاصطناعي لنشاطك",
    price: "20,000",
  },
];

const stats = [
  { num: "50+", label: "موقع تم إنجازه" },
  { num: "100%", label: "زبائن راضين" },
  { num: "1-2", label: "أيام التسليم" },
  { num: "24/7", label: "دعم فني" },
];

const steps = [
  { num: "01", title: "تواصل معانا", desc: "قولنا واش تحتاج ونعطيوك استشارة مجانية" },
  { num: "02", title: "نخدمولك التصميم", desc: "نصمملك موقع احترافي حسب نشاطك" },
  { num: "03", title: "نطلقو الموقع", desc: "موقعك يكون جاهز في أقل من أسبوع" },
];

const plans = [
  {
    name: "الأساسي",
    price: "8,000",
    period: "دج",
    features: ["صفحة تعريفية واحدة", "تصميم متجاوب", "شهادة SSL مجانية", "تسليم في يوم واحد"],
    highlight: false,
  },
  {
    name: "الاحترافي",
    price: "20,000",
    period: "دج",
    features: [
      "موقع متعدد الصفحات",
      "نظام حجز / منيو رقمي",
      "ربط مع وسائل التواصل",
      "لوحة تحكم",
      "🎬 فيديو كرياتيف احترافي مجانا",
      "تسليم في يومين",
    ],
    highlight: true,
  },
  {
    name: "المتقدم",
    price: "80,000+",
    period: "دج",
    features: [
      "منصة كاملة مخصصة",
      "قاعدة بيانات + حسابات",
      "لوحة إدارة متقدمة",
      "تطبيق ويب تفاعلي",
      "دعم سنة كاملة",
    ],
    highlight: false,
  },
];

const faqs = [
  { q: "شحال يدوم خدمة الموقع؟", a: "الموقع الأساسي يكمل في يوم واحد فقط! والاحترافي في يومين. المنصات المتقدمة 2-4 أسابيع حسب التعقيد." },
  { q: "واش نحتاج نفهم في البرمجة؟", a: "لا أبدا! نسلمولك موقع جاهز وسهل الاستعمال، ونعلموك كيفاه تبدل المحتوى." },
  { q: "كيفاه الدفع؟", a: "50% مقدم قبل البداية و50% عند التسليم. الدفع بالـ CCP أو نقدا." },
  { q: "واش الاشتراك الشهري إجباري؟", a: "لا، بصح ننصح بيه باش نضمنولك الاستضافة والصيانة والتحديثات." },
];

function Navbar({ active }) {
  const [open, setOpen] = useState(false);
  const links = [
    { id: "hero", label: "الرئيسية" },
    { id: "services", label: "خدماتنا" },
    { id: "pricing", label: "الأسعار" },
    { id: "faq", label: "أسئلة شائعة" },
    { id: "contact", label: "تواصل" },
  ];
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: "rgba(7,11,20,0.92)", backdropFilter: "blur(16px)",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
    }}>
      <div style={{
        maxWidth: 1100, margin: "0 auto", padding: "0 24px",
        display: "flex", justifyContent: "space-between", alignItems: "center", height: 64,
      }}>
        <a href="#hero" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg,#2E7DFF,#0AB4FF)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 800, fontSize: 18, color: "#fff",
          }}>R</div>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 18, letterSpacing: "-0.02em" }}>RICH DZ</span>
        </a>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {links.map(l => (
            <a key={l.id} href={`#${l.id}`} style={{
              color: active === l.id ? "#2E7DFF" : "rgba(255,255,255,0.65)",
              textDecoration: "none", fontSize: 14, fontWeight: 500,
              padding: "6px 14px", borderRadius: 8, transition: "all 0.2s",
              background: active === l.id ? "rgba(46,125,255,0.1)" : "transparent",
            }}>{l.label}</a>
          ))}
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section id="hero" style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "radial-gradient(ellipse at 50% 0%, #0f2847 0%, #070B14 70%)",
      position: "relative", overflow: "hidden", padding: "120px 24px 80px",
    }}>
      <div style={{
        position: "absolute", top: "-20%", left: "50%", transform: "translateX(-50%)",
        width: 700, height: 700, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(46,125,255,0.12) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{ textAlign: "center", maxWidth: 720, position: "relative", zIndex: 1 }}>
        <div style={{
          display: "inline-block", padding: "6px 18px", borderRadius: 20,
          background: "rgba(46,125,255,0.12)", border: "1px solid rgba(46,125,255,0.25)",
          color: "#5BA3FF", fontSize: 13, fontWeight: 600, marginBottom: 24,
          letterSpacing: "0.02em",
        }}>
          🚀 الحل الرقمي للتجار الجزائريين
        </div>
        <h1 style={{
          fontSize: "clamp(32px, 6vw, 56px)", fontWeight: 800, color: "#fff",
          lineHeight: 1.15, margin: "0 0 20px",
          letterSpacing: "-0.03em",
        }}>
          نخدمولك موقع احترافي
          <span style={{
            background: "linear-gradient(135deg,#2E7DFF,#0AB4FF)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}> يجيبلك زبائن</span>
        </h1>
        <p style={{
          color: "rgba(255,255,255,0.55)", fontSize: 18, lineHeight: 1.7,
          margin: "0 0 36px", maxWidth: 520, marginInline: "auto",
        }}>
          موقعك الإلكتروني جاهز في أقل من أسبوع. تصميم عصري، سرعة عالية، وسعر يناسب الجميع.
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="#contact" style={{
            padding: "14px 32px", borderRadius: 12, border: "none", fontSize: 16,
            fontWeight: 700, cursor: "pointer", textDecoration: "none",
            background: "linear-gradient(135deg,#2E7DFF,#0AB4FF)", color: "#fff",
            boxShadow: "0 4px 24px rgba(46,125,255,0.35)", transition: "transform 0.2s",
          }}>
            اطلب موقعك الآن ←
          </a>
          <a href="#services" style={{
            padding: "14px 32px", borderRadius: 12, fontSize: 16,
            fontWeight: 600, cursor: "pointer", textDecoration: "none",
            background: "rgba(255,255,255,0.06)", color: "#fff",
            border: "1px solid rgba(255,255,255,0.1)", transition: "all 0.2s",
          }}>
            شوف خدماتنا
          </a>
        </div>
        <div style={{
          display: "flex", justifyContent: "center", gap: 40, marginTop: 56, flexWrap: "wrap",
        }}>
          {stats.map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{
                fontSize: 28, fontWeight: 800, color: "#fff",
                background: "linear-gradient(135deg,#2E7DFF,#0AB4FF)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>{s.num}</div>
              <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Services() {
  return (
    <section id="services" style={{
      padding: "100px 24px", background: "#070B14",
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <h2 style={{
            fontSize: 36, fontWeight: 800, color: "#fff", margin: "0 0 12px",
            letterSpacing: "-0.02em",
          }}>خدماتنا</h2>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 16 }}>حلول رقمية مخصصة لكل نشاط</p>
        </div>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20,
        }}>
          {services.map((s, i) => (
            <div key={i} style={{
              background: "rgba(255,255,255,0.03)", borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.06)", padding: 28,
              transition: "all 0.3s",
            }}>
              <div style={{ fontSize: 36, marginBottom: 16 }}>{s.icon}</div>
              <h3 style={{ color: "#fff", fontSize: 20, fontWeight: 700, margin: "0 0 10px" }}>{s.title}</h3>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, lineHeight: 1.7, margin: "0 0 16px" }}>{s.desc}</p>
              <div style={{
                color: "#2E7DFF", fontWeight: 700, fontSize: 15,
              }}>ابتداءً من {s.price} دج</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Steps() {
  return (
    <section style={{
      padding: "80px 24px",
      background: "linear-gradient(180deg, #070B14 0%, #0a1628 100%)",
    }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <h2 style={{
          textAlign: "center", fontSize: 36, fontWeight: 800, color: "#fff",
          margin: "0 0 56px", letterSpacing: "-0.02em",
        }}>كيفاه نخدمو؟</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {steps.map((s, i) => (
            <div key={i} style={{
              display: "flex", gap: 24, alignItems: "flex-start",
              padding: "28px 0",
              borderBottom: i < steps.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
            }}>
              <div style={{
                minWidth: 52, height: 52, borderRadius: 14,
                background: "linear-gradient(135deg,#2E7DFF,#0AB4FF)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 800, fontSize: 18, color: "#fff", flexShrink: 0,
              }}>{s.num}</div>
              <div>
                <h3 style={{ color: "#fff", fontSize: 20, fontWeight: 700, margin: "0 0 6px" }}>{s.title}</h3>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 15, margin: 0, lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" style={{
      padding: "100px 24px", background: "#070B14",
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: "#fff", margin: "0 0 12px" }}>أسعارنا</h2>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 16 }}>أسعار واضحة بدون مفاجآت</p>
        </div>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20,
          alignItems: "stretch",
        }}>
          {plans.map((p, i) => (
            <div key={i} style={{
              borderRadius: 20, padding: 32,
              background: p.highlight
                ? "linear-gradient(160deg, rgba(46,125,255,0.15), rgba(10,180,255,0.08))"
                : "rgba(255,255,255,0.03)",
              border: p.highlight
                ? "1px solid rgba(46,125,255,0.35)"
                : "1px solid rgba(255,255,255,0.06)",
              position: "relative", display: "flex", flexDirection: "column",
            }}>
              {p.highlight && (
                <div style={{
                  position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                  background: "linear-gradient(135deg,#2E7DFF,#0AB4FF)",
                  color: "#fff", fontSize: 12, fontWeight: 700,
                  padding: "4px 16px", borderRadius: 20,
                }}>⭐ الأكثر طلبا</div>
              )}
              <h3 style={{ color: "#fff", fontSize: 22, fontWeight: 700, margin: "0 0 16px" }}>{p.name}</h3>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 24 }}>
                <span style={{
                  fontSize: 40, fontWeight: 800, color: "#fff",
                  ...(p.highlight ? {
                    background: "linear-gradient(135deg,#2E7DFF,#0AB4FF)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  } : {}),
                }}>{p.price}</span>
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 16 }}>{p.period}</span>
              </div>
              <div style={{ flex: 1 }}>
                {p.features.map((f, j) => (
                  <div key={j} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "8px 0", color: "rgba(255,255,255,0.7)", fontSize: 14,
                  }}>
                    <span style={{ color: "#2E7DFF", fontSize: 16 }}>✓</span>
                    {f}
                  </div>
                ))}
              </div>
              <a href="#contact" style={{
                display: "block", textAlign: "center", marginTop: 24,
                padding: "12px 24px", borderRadius: 12, textDecoration: "none",
                fontWeight: 700, fontSize: 15, transition: "all 0.2s",
                ...(p.highlight
                  ? { background: "linear-gradient(135deg,#2E7DFF,#0AB4FF)", color: "#fff", border: "none" }
                  : { background: "transparent", color: "#2E7DFF", border: "1px solid rgba(46,125,255,0.3)" }),
              }}>اطلب الآن</a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const [openIdx, setOpenIdx] = useState(null);
  return (
    <section id="faq" style={{
      padding: "100px 24px",
      background: "linear-gradient(180deg, #070B14 0%, #0a1628 100%)",
    }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <h2 style={{
          textAlign: "center", fontSize: 36, fontWeight: 800, color: "#fff",
          margin: "0 0 48px",
        }}>أسئلة شائعة</h2>
        {faqs.map((f, i) => (
          <div key={i} style={{
            borderBottom: "1px solid rgba(255,255,255,0.06)", overflow: "hidden",
          }}>
            <button onClick={() => setOpenIdx(openIdx === i ? null : i)} style={{
              width: "100%", background: "none", border: "none", cursor: "pointer",
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "20px 0", color: "#fff", fontSize: 16, fontWeight: 600,
              textAlign: "right",
            }}>
              <span>{f.q}</span>
              <span style={{
                transform: openIdx === i ? "rotate(45deg)" : "rotate(0deg)",
                transition: "transform 0.3s", fontSize: 22, color: "#2E7DFF",
                flexShrink: 0, marginLeft: 16,
              }}>+</span>
            </button>
            <div style={{
              maxHeight: openIdx === i ? 200 : 0, overflow: "hidden",
              transition: "max-height 0.3s ease",
            }}>
              <p style={{
                color: "rgba(255,255,255,0.5)", fontSize: 14, lineHeight: 1.8,
                margin: "0 0 20px", paddingRight: 8,
              }}>{f.a}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Contact() {
  const [sent, setSent] = useState(false);
  return (
    <section id="contact" style={{
      padding: "100px 24px", background: "#070B14",
    }}>
      <div style={{
        maxWidth: 600, margin: "0 auto", borderRadius: 24,
        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
        padding: "48px 36px",
      }}>
        <h2 style={{
          textAlign: "center", fontSize: 32, fontWeight: 800, color: "#fff",
          margin: "0 0 8px",
        }}>جاهز تبدا؟</h2>
        <p style={{
          textAlign: "center", color: "rgba(255,255,255,0.45)", fontSize: 15,
          margin: "0 0 36px",
        }}>ابعتلنا رسالة ونتواصلو معاك في أقل من 24 ساعة</p>

        {sent ? (
          <div style={{
            textAlign: "center", padding: 40, color: "#2E7DFF", fontSize: 18, fontWeight: 600,
          }}>
            ✓ تم إرسال طلبك بنجاح! رايحين نتواصلو معاك قريبا
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { ph: "الاسم الكامل", type: "text" },
              { ph: "رقم الهاتف", type: "tel" },
              { ph: "نوع النشاط (مطعم، محل، طبيب...)", type: "text" },
            ].map((inp, i) => (
              <input key={i} type={inp.type} placeholder={inp.ph} style={{
                padding: "14px 18px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: 15,
                outline: "none", direction: "rtl",
              }} />
            ))}
            <textarea placeholder="واش تحتاج بالضبط؟" rows={4} style={{
              padding: "14px 18px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: 15,
              outline: "none", resize: "vertical", direction: "rtl", fontFamily: "inherit",
            }} />
            <button onClick={() => setSent(true)} style={{
              padding: "16px", borderRadius: 12, border: "none", cursor: "pointer",
              background: "linear-gradient(135deg,#2E7DFF,#0AB4FF)", color: "#fff",
              fontSize: 16, fontWeight: 700, marginTop: 8,
              boxShadow: "0 4px 24px rgba(46,125,255,0.3)",
            }}>
              ابعث الطلب ←
            </button>
          </div>
        )}

        <a href="https://wa.me/213559555313?text=%D8%B3%D9%84%D8%A7%D9%85%20%D8%AD%D8%A7%D8%A8%20%D9%86%D8%AE%D8%AF%D9%85%20%D9%85%D9%88%D9%82%D8%B9" target="_blank" rel="noopener" style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          marginTop: 28, padding: "14px 28px", borderRadius: 12, textDecoration: "none",
          background: "#25D366", color: "#fff", fontWeight: 700, fontSize: 16,
          boxShadow: "0 4px 20px rgba(37,211,102,0.3)",
        }}>
          💬 راسلنا على الواتساب مباشرة
        </a>

        <div style={{
          marginTop: 28, padding: "20px 24px", borderRadius: 14,
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
        }}>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, margin: "0 0 12px", textAlign: "center" }}>
            💳 طرق الدفع
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "8px 14px", borderRadius: 8, background: "rgba(255,255,255,0.03)",
            }}>
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>CCP</span>
              <span style={{ color: "#fff", fontSize: 14, fontWeight: 600, direction: "ltr" }}>0043286798 clé 17</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "8px 14px", borderRadius: 8, background: "rgba(255,255,255,0.03)",
            }}>
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Barid Mob</span>
              <span style={{ color: "#fff", fontSize: 14, fontWeight: 600, direction: "ltr" }}>00799999004328679817</span>
            </div>
            <div style={{ textAlign: "center", marginTop: 4 }}>
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>باسم: Missoum Sohaib</span>
            </div>
          </div>
        </div>

        <div style={{
          display: "flex", justifyContent: "center", gap: 32, marginTop: 24, flexWrap: "wrap",
        }}>
          {[
            { icon: "📞", text: "0559 555 313" },
            { icon: "📧", text: "missousohaib107@gmail.com" },
          ].map((c, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 8,
              color: "rgba(255,255,255,0.5)", fontSize: 14,
            }}>
              <span>{c.icon}</span>{c.text}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{
      padding: "32px 24px", background: "#050810",
      borderTop: "1px solid rgba(255,255,255,0.05)",
      textAlign: "center",
    }}>
      <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, margin: 0 }}>
        © 2026 RICH DZ — جميع الحقوق محفوظة
      </p>
    </footer>
  );
}

export default function App() {
  const [active, setActive] = useState("hero");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { threshold: 0.3 }
    );
    ["hero", "services", "pricing", "faq", "contact"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div style={{
      fontFamily: "'Inter', 'Segoe UI', 'SF Pro', system-ui, -apple-system, sans-serif",
      direction: "rtl", background: "#070B14", minHeight: "100vh",
      color: "#fff", overflowX: "hidden",
    }}>
      <Navbar active={active} />
      <Hero />
      <Services />
      <Steps />
      <Pricing />
      <FAQ />
      <Contact />
      <Footer />
    </div>
  );
}
