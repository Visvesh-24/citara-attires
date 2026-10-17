import { siteImage } from "@/lib/products";
import { Hero } from "@/components/home/Hero";
import { CategoryTiles } from "@/components/home/CategoryTiles";
import { ScrollMarquee } from "@/components/home/ScrollMarquee";
import { NewArrivals } from "@/components/home/NewArrivals";
import { BrandStory } from "@/components/home/BrandStory";
import { Promises } from "@/components/home/Promises";
import { InstagramStrip } from "@/components/home/InstagramStrip";
import { WhatsAppCTA } from "@/components/home/WhatsAppCTA";

export default function HomePage() {
  return (
    <>
      <Hero primary={siteImage("hero-1")} secondary={siteImage("hero-2")} />
      <CategoryTiles />
      <ScrollMarquee />
      <NewArrivals />
      <BrandStory image={siteImage("story")} inset={siteImage("about")} />
      <Promises />
      <InstagramStrip images={[siteImage("hero-1"), siteImage("story"), siteImage("hero-2"), siteImage("about")]} />
      <WhatsAppCTA />
    </>
  );
}
