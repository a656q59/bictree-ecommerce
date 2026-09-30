import { useState } from "react";

type ImageWithFallbackProps = {
  src?: string | null;
  alt: string;
  className?: string;
};

export function ImageWithFallback({ src, alt, className }: ImageWithFallbackProps) {
  const [failed, setFailed] = useState(false);
  const frame = `flex items-center justify-center bg-surface text-xs text-muted ${className ?? ""}`;

  if (!src || failed) {
    return <div className={frame}>No image</div>;
  }

  return <img src={src} alt={alt} className={className} onError={() => setFailed(true)} />;
}
