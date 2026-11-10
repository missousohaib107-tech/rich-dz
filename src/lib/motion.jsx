import { useEffect, useRef, useState } from "react";

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// يشغل الحركة في الصفحة: كل عنصر فيه data-reveal ياخذ الكلاس is-in كي يدخل للشاشة.
// بلا جافاسكريبت ولا مع "تقليل الحركة" المحتوى يبان عادي (شوف motion.css).
export function useScrollMotion() {
  useEffect(() => {
    // الكلاس .motion يتزاد في index.html قبل ما ترسم الصفحة، باش ما يبانش وميض
    if (!document.documentElement.classList.contains("motion")) return;
    const seen = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("is-in");
          seen.unobserve(e.target);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => seen.observe(el));
    return () => seen.disconnect();
  }, []);
}

// عنوان كلماتو يطلعو وحدة بوحدة. قارئ الشاشة يقرا الجملة كاملة.
export function Words({ text, as: Tag = "span", className, step = 90, start = 0 }) {
  return (
    <Tag className={className} aria-label={text}>
      {text.split(" ").flatMap((word, i) => [
        <span className="word" aria-hidden="true" key={i} style={{ "--w": `${start + i * step}ms` }}>
          {word}
        </span>,
        " ",
      ])}
    </Tag>
  );
}

// رقم يعدّ من صفر كي يبان في الشاشة
export function CountUp({ value, format = (n) => n.toLocaleString("en-US"), duration = 1100 }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(value);

  useEffect(() => {
    const el = ref.current;
    if (reduced() || !("IntersectionObserver" in window)) return;
    setShown(0);
    let frame;
    const seen = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        seen.disconnect();
        const t0 = performance.now();
        const tick = (now) => {
          const p = Math.min(1, (now - t0) / duration);
          setShown(Math.round(value * (1 - Math.pow(1 - p, 3))));
          if (p < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    seen.observe(el);
    return () => {
      seen.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, duration]);

  return (
    <span ref={ref} className="latin" aria-label={format(value)}>
      {format(shown)}
    </span>
  );
}
