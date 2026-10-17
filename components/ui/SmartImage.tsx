import Image from "next/image";
import type { ImageRef } from "@/lib/products";
import { Placeholder } from "./Placeholder";

type Props = {
  image: ImageRef | null | undefined;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  placeholderLabel?: string;
  placeholderTone?: "light" | "dark";
};

/** next/image with blur-up when the photo exists, branded placeholder when it doesn't. */
export function SmartImage({
  image,
  alt,
  sizes,
  priority,
  className = "object-cover",
  placeholderLabel,
  placeholderTone,
}: Props) {
  if (!image) return <Placeholder label={placeholderLabel} tone={placeholderTone} />;
  return (
    <Image
      src={image.src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      placeholder={image.blur ? "blur" : "empty"}
      blurDataURL={image.blur}
      className={className}
    />
  );
}
