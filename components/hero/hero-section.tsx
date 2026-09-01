"use client";

import { useRef } from "react";
import { useReducedMotion, useScroll } from "framer-motion";
import { HeroAirplane } from "./hero-airplane";
import { HeroCaption } from "./hero-caption";
import { HeroHandStack } from "./hero-hand-stack";

export function HeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const reducedMotion = !!useReducedMotion();

  return (
    <section ref={sectionRef} className="relative h-[300vh]">
      <div className="sticky top-14 flex h-[calc(100vh-3.5rem)] flex-col items-center justify-center overflow-hidden px-4">
        <div className="relative w-full max-w-sm">
          <HeroAirplane progress={scrollYProgress} reducedMotion={reducedMotion} />
          <HeroHandStack progress={scrollYProgress} reducedMotion={reducedMotion} />
        </div>
        <HeroCaption progress={scrollYProgress} reducedMotion={reducedMotion} />
      </div>
    </section>
  );
}
