import { useEffect, useRef, useState } from "react";
import { assetUrl } from "./VideoTile.jsx";
import { CloseIcon } from "./icons.jsx";

// مشغل الفيديو. نفس منطق صفحات المعاينة: hls.js وين يخدم،
// والمشغل الأصلي تاع Safari في الآيفون.
export default function VideoDialog({ video, onClose }) {
  const dialogRef = useRef(null);
  const videoRef = useRef(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog.open) dialog.showModal();
  }, []);

  useEffect(() => {
    const el = videoRef.current;
    const src = assetUrl(`${video.path}/hls/index.m3u8`);
    const native = () => el.canPlayType("application/vnd.apple.mpegurl");
    let hls = null;
    let cancelled = false;
    setFailed(false);

    const play = () => el.play().catch(() => {});

    import("hls.js/light")
      .then(({ default: Hls }) => {
        if (cancelled) return;
        if (Hls.isSupported()) {
          let tries = 0;
          hls = new Hls({ enableWorker: false });
          hls.on(Hls.Events.ERROR, (_e, data) => {
            if (!data.fatal) return;
            if (data.type === Hls.ErrorTypes.NETWORK_ERROR && tries < 2) {
              tries += 1;
              hls.startLoad();
              return;
            }
            if (data.type === Hls.ErrorTypes.MEDIA_ERROR && tries < 2) {
              tries += 1;
              hls.recoverMediaError();
              return;
            }
            hls.destroy();
            hls = null;
            if (native()) el.src = src;
            else setFailed(true);
          });
          hls.on(Hls.Events.MANIFEST_PARSED, play);
          hls.loadSource(src);
          hls.attachMedia(el);
        } else if (native()) {
          el.src = src;
          play();
        } else {
          setFailed(true);
        }
      })
      .catch(() => {
        if (cancelled) return;
        if (native()) {
          el.src = src;
          play();
        } else {
          setFailed(true);
        }
      });

    return () => {
      cancelled = true;
      if (hls) hls.destroy();
      el.pause();
      el.removeAttribute("src");
      el.load();
    };
  }, [video.path]);

  return (
    <dialog
      ref={dialogRef}
      className="player"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) dialogRef.current.close();
      }}
      aria-label={video.title}
    >
      <div className="player__frame" onContextMenu={(e) => e.preventDefault()}>
        <video
          ref={videoRef}
          controls
          playsInline
          preload="metadata"
          poster={assetUrl(`${video.path}/poster.jpg`)}
          controlsList="nodownload noremoteplayback noplaybackrate"
          disablePictureInPicture
          disableRemotePlayback
        />
        {failed && (
          <div className="player__error" role="alert">
            المتصفح هذا ما شغّلش الفيديو. جرّب تفتح الموقع في Chrome ولا Safari.
          </div>
        )}
      </div>
      <div className="player__bar">
        <p className="player__title">
          {video.title}
          {video.client && <span className="player__client">{video.client}</span>}
        </p>
        <button type="button" className="btn btn--line btn--small" onClick={() => dialogRef.current.close()}>
          <CloseIcon />
          سكّر
        </button>
      </div>
      {video.concept && (
        <p className="player__note">نموذج تصوري درناه من عندنا باش نوريو المستوى. ماشي طلبية من الشركة.</p>
      )}
    </dialog>
  );
}
