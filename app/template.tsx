"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";

// The first page load renders instantly (good for LCP); later navigations fade in.
let hasNavigated = false;

/** Re-mounts on every navigation, giving each page a soft fade-in. */
export default function Template({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    hasNavigated = true;
  }, []);

  return (
    <motion.div
      initial={hasNavigated ? { opacity: 0, y: 16 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
