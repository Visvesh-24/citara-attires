"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import type { ImageRef } from "@/lib/products";
import { SmartImage } from "../ui/SmartImage";
import { ChevronIcon } from "../ui/Icons";

/** Native scroll-snap carousel: swipeable on phones, arrows + thumbnails on larger screens. */
export function ProductGallery({ images, name, category }: { images: ImageRef[]; name: string; category: string }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const slides: (ImageRef | null)[] = images.length ? images : [null];

  const goTo = (i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const index = Math.max(0, Math.min(slides.length - 1, i));
    track.scrollTo({ left: index * track.clientWidth, behavior: "smooth" });
  };

  const onScroll = () => {
    const track = trackRef.current;
    if (track) setActive(Math.round(track.scrollLeft / track.clientWidth));
  };

  return (
    <div>
      <div className="group relative">
        <div
          ref={trackRef}
          onScroll={onScroll}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain rounded-sm bg-sand"
          aria-label={`${name} photos`}
        >
          {slides.map((img, i) => (
            <div key={i} className="relative aspect-[3/4] w-full shrink-0 snap-center snap-always">
              <SmartImage
                image={img}
                alt={`${name}${slides.length > 1 ? ` — photo ${i + 1}` : ""}`}
                sizes="(min-width:1024px) 55vw, 100vw"
                priority={i === 0}
                placeholderLabel={`${category} · photo coming soon`}
              />
            </div>
          ))}
        </div>

        {slides.length > 1 && (
          <>
            {(["prev", "next"] as const).map((dir) => (
              <button
                key={dir}
                onClick={() => goTo(active + (dir === "next" ? 1 : -1))}
                aria-label={dir === "next" ? "Next photo" : "Previous photo"}
                className={`absolute top-1/2 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-ivory/85 text-emerald-900 opacity-0 shadow backdrop-blur transition-opacity duration-300 group-hover:opacity-100 hover:bg-ivory disabled:hidden sm:grid ${
                  dir === "next" ? "right-4" : "left-4"
                }`}
                disabled={dir === "next" ? active >= slides.length - 1 : active <= 0}
              >
                <ChevronIcon className={`size-5 ${dir === "prev" ? "rotate-180" : ""}`} />
              </button>
            ))}
            <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2 sm:hidden">
              {slides.map((_, i) => (
                <span
                  key={i}
                  className={`h-1 rounded-full transition-all duration-500 ${i === active ? "w-6 bg-ivory" : "w-1.5 bg-ivory/50"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-4 hidden gap-3 sm:flex">
          {images.map((img, i) => (
            <button
              key={img.src}
              onClick={() => goTo(i)}
              aria-label={`Show photo ${i + 1}`}
              className={`relative aspect-[3/4] w-20 overflow-hidden rounded-sm transition-opacity duration-300 ${
                i === active ? "opacity-100 ring-1 ring-gold-600 ring-offset-2 ring-offset-ivory" : "opacity-50 hover:opacity-100"
              }`}
            >
              <Image src={img.src} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
