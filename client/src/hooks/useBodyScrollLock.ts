import { useEffect } from "react";

let activeLocks = 0;
let previousBodyOverflow = "";
let previousScrollbarGutter = "";

export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked || typeof window === "undefined") return;

    const { body, documentElement } = document;

    if (activeLocks === 0) {
      previousBodyOverflow = body.style.overflow;
      previousScrollbarGutter = documentElement.style.scrollbarGutter;

      body.style.overflow = "hidden";
      body.classList.add("app-modal-scroll-locked");
      documentElement.style.scrollbarGutter = "stable";
    }

    activeLocks += 1;

    return () => {
      activeLocks = Math.max(0, activeLocks - 1);

      if (activeLocks === 0) {
        body.style.overflow = previousBodyOverflow;
        body.classList.remove("app-modal-scroll-locked");
        documentElement.style.scrollbarGutter = previousScrollbarGutter;
      }
    };
  }, [locked]);
}
