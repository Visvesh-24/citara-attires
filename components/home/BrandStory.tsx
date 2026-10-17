"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import type { ImageRef } from "@/lib/products";
import { SmartImage } from "../ui/SmartImage";
import { Reveal, WordReveal } from "../ui/Reveal";
import { ArrowIcon, LotusIcon } from "../ui/Icons";

const ease = [0.22, 1, 0.36, 1] as const;

export function BrandStory({ image, inset }: { image: ImageRef | null; inset: ImageRef | null }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["-8%", "8%"]);
  const insetY = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["30%", "-30%"]);

  return (
    <section ref={ref} className="relative overflow-hidden bg-sand py-20 lg:py-36">
      <div className="container-x grid items-center gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-24">
        {/* Image with curtain reveal + parallax */}
        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="relative aspect-[4/5] overflow-hidden rounded-t-full">
            <motion.div style={{ y: imgY }} className="absolute -inset-y-[10%] inset-x-0">
              <SmartImage image={image} alt="Citara Attires — our story" sizes="(min-width:1024px) 45vw, 90vw" className="object-cover object-[50%_35%]" />
            </motion.div>
            <motion.div
              className="absolute inset-0 origin-top bg-emerald-800"
              initial={{ scaleY: 1 }}
              whileInView={{ scaleY: 0 }}
              viewport={{ once: true, margin: "0px 0px -20% 0px" }}
              transition={{ duration: 1.4, ease }}
            />
          </div>
          {inset && (
            <motion.div
              style={{ y: insetY }}
              className="absolute -right-4 -bottom-10 hidden aspect-[3/4] w-[38%] overflow-hidden rounded-sm border-[6px] border-sand shadow-2xl sm:block lg:-right-12"
            >
              <SmartImage image={inset} alt="" sizes="20vw" className="object-cover object-[50%_25%]" />
            </motion.div>
          )}
          <motion.div
            className="absolute -top-6 -left-6 size-28 text-gold-500/60 lg:size-36"
            initial={{ rotate: -40, opacity: 0 }}
            whileInView={{ rotate: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.6, ease }}
            aria-hidden
          >
            <svg viewBox="0 0 100 100" className="size-full animate-spin-slow">
              <defs>
                <path id="circlePath" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
              </defs>
              <text fill="currentColor" fontSize="8.5" letterSpacing="3.2">
                <textPath href="#circlePath">CITARA ✦ ATTIRES ✦ SINCE DAY ONE ✦</textPath>
              </text>
            </svg>
          </motion.div>
        </div>

        {/* Quote */}
        <div>
          <Reveal y={12}>
            <div className="flex items-center gap-4 text-gold-600">
              <LotusIcon className="h-8 w-12" />
              <p className="eyebrow text-gold-700">Our story</p>
            </div>
          </Reveal>
          <blockquote className="mt-8 font-display text-[clamp(2rem,4.6vw,3.9rem)] leading-[1.08] font-light text-emerald-900">
            <span className="text-gold-500">“</span>
            <WordReveal
              text="Clothes that carry a story — of the hands that wove them, and the woman who wears them."
              inView
              stagger={0.035}
            />
            <span className="text-gold-500">”</span>
          </blockquote>
          <Reveal delay={0.2}>
            <p className="mt-8 max-w-lg text-[15px] leading-relaxed text-muted">
              Citara began with a simple wish: ethnic wear that feels as easy as your favourite tee, yet as special
              as your grandmother&apos;s trunk of heirlooms. Breathable fabrics, honest craft and silhouettes that
              move with you — from a Monday meeting to a Sunday celebration.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <Link
              href="/about"
              className="group mt-10 inline-flex items-center gap-3 border-b border-emerald-900/30 pb-2 text-[12px] tracking-[0.22em] text-emerald-900 uppercase transition-colors hover:border-gold-600 hover:text-gold-700"
            >
              Read our story
              <ArrowIcon className="size-4 transition-transform duration-500 group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
