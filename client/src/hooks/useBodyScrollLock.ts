import { useEffect } from "react";

let activeLocks = 0;
let previousBodyOverflow = "";

export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked || typeof window === "undefined") return;

    const { body, documentElement } = document;

    if (activeLocks === 0) {
      previousBodyOverflow = body.style.overflow;

      body.style.overflow = "hidden";
      documentElement.style.scrollbarGutter = "stable";
    }

    activeLocks += 1;

    return () => {
      activeLocks = Math.max(0, activeLocks - 1);

      if (activeLocks === 0) {
        body.style.overflow = previousBodyOverflow;
      }
    };
  }, [locked]);
}
