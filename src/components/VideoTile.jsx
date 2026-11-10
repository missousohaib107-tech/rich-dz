import { PlayIcon } from "./icons.jsx";

export const assetUrl = (path) => `${import.meta.env.BASE_URL}${path}`;

// بلاطة 9:16 فيها صورة الفيديو. كي تتضغط تفتح المشغل.
export default function VideoTile({ video, onPlay, face = false, eager = false }) {
  const label = video.client ? `شغّل: ${video.title}، ${video.client}` : `شغّل: ${video.title}`;
  return (
    <button
      type="button"
      className={face ? "tile tile--face" : "tile"}
      onClick={() => onPlay(video)}
      aria-label={label}
    >
      <img
        src={assetUrl(`${video.path}/poster.jpg`)}
        alt=""
        width="540"
        height="960"
        loading={eager ? "eager" : "lazy"}
        decoding="async"
      />
      {video.concept && <span className="tile__flag">نموذج تصوري</span>}
      {face && <span className="tile__flag">صهيب يشرحلك الخدمة</span>}
      <span className="tile__play">
        <PlayIcon />
      </span>
      {video.duration && <span className="tile__time latin">{video.duration}</span>}
    </button>
  );
}
