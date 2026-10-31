"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import type { ImageRef } from "@/lib/products";
import { SmartImage } from "../ui/SmartImage";
import { Placeholder } from "../ui/Placeholder";
import { WordReveal } from "../ui/Reveal";
import { SweepLink } from "../ui/Buttons";

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero({ primary, secondary }: { primary: ImageRef | null; secondary: ImageRef | null }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "18%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "-30%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={ref} className="relative h-[100svh] min-h-[600px] overflow-hidden bg-emerald-950">
      {/* Imagery: slow zoom-out on load + parallax on scroll */}
      <motion.div style={{ y: imageY }} className="absolute inset-0 will-change-transform">
        <motion.div
          className="absolute inset-0 flex"
          initial={{ scale: 1.15 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.8, ease }}
        >
          {primary ? (
            <>
              <div className="relative h-full flex-1">
                <SmartImage image={primary} alt="Citara Attires new collection" sizes="(min-width:1024px) 50vw, 100vw" priority className="object-cover object-[50%_28%]" />
              </div>
              {secondary && (
                <div className="relative hidden h-full flex-1 border-l border-gold-500/20 lg:block">
                  <SmartImage image={secondary} alt="Citara Attires festive edit" sizes="50vw" priority className="object-cover object-[50%_25%]" />
                </div>
              )}
            </>
          ) : (
            <Placeholder tone="dark" showLogo={false} />
          )}
        </motion.div>
      </motion.div>

      {/* Legibility gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/95 via-emerald-950/30 to-emerald-950/10" />
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/50 via-transparent to-transparent" />

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="container-x relative flex h-full flex-col justify-end pb-24 text-ivory sm:pb-28 lg:pb-32"
      >
        <motion.p
          className="eyebrow mb-5 flex items-center gap-3 text-gold-400"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease }}
        >
          <span className="h-px w-10 bg-gold-500" /> The New Collection
        </motion.p>

        <h1 className="max-w-6xl font-display text-[clamp(3.1rem,12vw,9rem)] lg:text-[clamp(4.5rem,7.4vw,7.75rem)] leading-[0.92] font-light tracking-[-0.01em]">
          <WordReveal text="Rooted in tradition," className="block" delay={0.45} />
          <WordReveal text="made for today." className="block text-gold-400 italic" delay={0.75} />
        </h1>

        <motion.p
          className="mt-6 max-w-md text-[15px] leading-relaxed font-light text-ivory/80 sm:text-base"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.3, ease }}
        >
          Kurtis, tunics, co-ords and salwar sets that carry the grace of Indian craft — reimagined with a modern, effortless
          silhouette.
        </motion.p>

        <motion.div
          className="mt-9"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.5, ease }}
        >
          <SweepLink href="/shop">Shop the Collection</SweepLink>
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        className="absolute right-5 bottom-8 flex flex-col items-center gap-3 text-ivory/70 sm:right-8 lg:right-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        aria-hidden
      >
        <span className="text-[10px] tracking-[0.35em] uppercase [writing-mode:vertical-rl]">Scroll</span>
        <span className="relative h-14 w-px overflow-hidden bg-ivory/20">
          <motion.span
            className="absolute inset-x-0 top-0 h-1/2 bg-gold-400"
            animate={{ y: ["-100%", "200%"] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </span>
      </motion.div>
    </section>
  );
}
