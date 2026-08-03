import { useEffect, useRef } from 'preact/hooks';

interface Props {
  label: string;
  poster: string;
  src: string;
}

export default function HeroVideo({ label, poster, src }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute('muted', '');

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let started = false;
    let resumeWhenVisible = false;
    const playMuted = () => {
      video.muted = true;
      void video
        .play()
        .then(() => {
          started = true;
        })
        .catch(() => {});
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (motion.matches) {
          video.pause();
        } else if (entry.isIntersecting && (!started || resumeWhenVisible)) {
          resumeWhenVisible = false;
          playMuted();
        } else if (!entry.isIntersecting) {
          resumeWhenVisible = !video.paused;
          video.pause();
        }
      },
      { threshold: 0.25 },
    );
    const handleMotion = () => {
      if (motion.matches) video.pause();
    };

    if (!motion.matches) observer.observe(video);
    motion.addEventListener('change', handleMotion);
    return () => {
      observer.disconnect();
      motion.removeEventListener('change', handleMotion);
      video.pause();
    };
  }, []);

  return (
    <video
      ref={videoRef}
      aria-label={label}
      muted
      playsInline
      preload="none"
      poster={poster}
      src={src}
    />
  );
}
