import { useState, useEffect, type ImgHTMLAttributes } from "react";

interface SiteImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  slot: string;
  fallback: string;
}

// Renders a CMS-replaceable image: tries the admin-uploaded version for
// `slot` first, and falls back to the bundled default if none was uploaded
// (or it fails to load). This is what lets a cloned site swap its logo,
// hero photo, etc. from the admin dashboard without touching code.
export function SiteImage({ slot, fallback, alt, ...rest }: SiteImageProps) {
  const [src, setSrc] = useState(`/api/images/${encodeURIComponent(slot)}`);

  useEffect(() => {
    setSrc(`/api/images/${encodeURIComponent(slot)}`);
  }, [slot]);

  return (
    <img
      {...rest}
      src={src}
      alt={alt}
      onError={() => setSrc((current) => (current === fallback ? current : fallback))}
    />
  );
}
