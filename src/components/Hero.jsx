import { introVideo, works } from "../site.config.js";
import VideoTile from "./VideoTile.jsx";
import { CheckIcon } from "./icons.jsx";
import { Words } from "../lib/motion.jsx";

export function Header() {
  return (
    <header className="top">
      <div className="wrap top__row">
        <a className="wordmark" href="#top" aria-label="RICH DZ، الصفحة الرئيسية">
          RICH DZ
        </a>
        <nav className="top__nav" aria-label="أقسام الصفحة">
          <a href="#packages">العروض</a>
          <a href="#works">أعمالنا</a>
          <a href="#faq">أسئلة</a>
        </nav>
        <a className="btn btn--main btn--small" href="#order">
          اطلب دروك
        </a>
      </div>
    </header>
  );
}

export function Hero({ onPlay, onChoose }) {
  // فيديو شرح الخدمة يجي الأول، ومن بعدو الأعمال
  const reel = works.slice(0, introVideo ? 4 : 5);

  return (
    <section className="hero dark" id="top">
      <div className="wrap hero__grid">
        <div>
          <Words as="h1" className="hero__title" text="محتوى محلك، جاهز كل أسبوع" step={110} />
          <p className="hero__lead">
            فيديوهات وصور إعلانية لصفحاتك في فيسبوك، انستغرام وتيك توك. جرّب بفيديو مجاني، ومن بعد خيّر
            فيديو واحد ولا باقة أسبوع كامل.
          </p>
          <div className="hero__actions">
            <a className="btn btn--main" href="#order" onClick={() => onChoose("trial")}>
              جرّب بفيديو مجاني
            </a>
            <a className="btn btn--line" href="#packages">
              شوف العروض
            </a>
          </div>
          <ul className="hero__facts">
            <li>
              <CheckIcon />
              فيديو تجريبي مجاني
            </li>
            <li>
              <CheckIcon />
              تشوف المعاينة قبل ما تستلم
            </li>
            <li>
              <CheckIcon />
              الأفكار والسكريبت علينا
            </li>
          </ul>
        </div>

        <ul className="reel" aria-label="من أعمالنا">
          {introVideo && (
            <li className="reel__item">
              <VideoTile video={introVideo} onPlay={onPlay} face eager />
            </li>
          )}
          {reel.map((w) => (
            <li className="reel__item" key={w.path}>
              <VideoTile video={w} onPlay={onPlay} eager />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
