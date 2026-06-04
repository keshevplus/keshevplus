import { useEffect } from "react";

let activeLocks = 0;
let previousBodyOverflow = "";
let previousBodyPaddingRight = "";

export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked || typeof window === "undefined") return;

    const { body, documentElement } = document;

    if (activeLocks === 0) {
      previousBodyOverflow = body.style.overflow;
      previousBodyPaddingRight = body.style.paddingRight;

      const scrollbarWidth = window.innerWidth - documentElement.clientWidth;
      const bodyPaddingRight = parseFloat(window.getComputedStyle(body).paddingRight) || 0;

      body.style.overflow = "hidden";
      if (scrollbarWidth > 0) {
        body.style.paddingRight = `${bodyPaddingRight + scrollbarWidth}px`;
      }
    }

    activeLocks += 1;

    return () => {
      activeLocks = Math.max(0, activeLocks - 1);

      if (activeLocks === 0) {
        body.style.overflow = previousBodyOverflow;
        body.style.paddingRight = previousBodyPaddingRight;
      }
    };
  }, [locked]);
}
