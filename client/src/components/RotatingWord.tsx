import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface RotatingWordProps {
  words: string[];
  intervalMs?: number;
  className?: string;
}

// Cycles through `words` forever, one at a time, with a fade/slide
// transition - e.g. "...concentration disorders in" + rotating
// "adults" / "teens" / "children".
export default function RotatingWord({ words, intervalMs = 2200, className }: RotatingWordProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (words.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % words.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [words.length, intervalMs]);

  const current = words[index % words.length] ?? "";

  return (
    <span className="inline-grid" style={{ verticalAlign: "bottom" }}>
      <AnimatePresence mode="wait">
        <motion.span
          key={current}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className={className}
          style={{ gridArea: "1 / 1" }}
        >
          {current}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
