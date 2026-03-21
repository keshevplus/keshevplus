import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";

const StickySectionTitle = () => {
  const [currentTitle, setCurrentTitle] = useState<string | null>(null);
  const [navHeight, setNavHeight] = useState(56);
  const { isRTL } = useLanguage();
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const nav = document.querySelector("nav[role='navigation']");

    const measure = () => {
      if (nav) setNavHeight(nav.getBoundingClientRect().height);
    };

    measure();
    const ro = new ResizeObserver(measure);
    if (nav) ro.observe(nav);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const nav = document.querySelector("nav[role='navigation']");
        const threshold = nav ? nav.getBoundingClientRect().height : navHeight;

        const headers = Array.from(
          document.querySelectorAll("[data-sticky-title]"),
        );

        let current: string | null = null;
        for (const el of headers) {
          const rect = el.getBoundingClientRect();
          if (rect.bottom < threshold) {
            current = el.getAttribute("data-sticky-title");
          }
        }

        setCurrentTitle(current);
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [navHeight]);

  return (
    <div
      className="fixed left-0 right-0 z-[9985] pointer-events-none overflow-hidden"
      style={{ top: navHeight }}
    >
      <AnimatePresence mode="popLayout">
        {currentTitle && (
          <motion.div
            key={currentTitle}
            className="green-section-bg pointer-events-auto w-full"
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
          >
            <div className="w-full px-4 py-1.5 text-center">
              <span className="text-sm font-bold text-primary-foreground tracking-wide leading-tight">
                {currentTitle}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StickySectionTitle;
