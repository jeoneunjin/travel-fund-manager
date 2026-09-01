"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { STAGES } from "./hero-content";
import { HeroStageBlock } from "./hero-stage";
import { HeroAirplaneDivider } from "./hero-airplane-divider";

export function HeroSection() {
  const reducedMotion = useReducedMotion();

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 md:py-24">
      {/* 시작 상태 — 빈 손 */}
      <motion.div
        className="relative mx-auto aspect-square w-full max-w-xs md:max-w-sm"
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 1, stiffness: 120 }}
      >
        <Image
          src="/hero/hand-empty.png"
          alt=""
          fill
          priority
          className="object-contain"
          sizes="(max-width: 768px) 80vw, 384px"
        />
      </motion.div>

      <div className="mt-20 space-y-20 md:mt-32 md:space-y-32">
        {STAGES.map((stage, index) => (
          <div key={stage.id} className="space-y-10 md:space-y-16">
            <HeroAirplaneDivider fromLeft={index % 2 === 0} />
            <HeroStageBlock stage={stage} imageOnLeft={index % 2 === 0} />
          </div>
        ))}
      </div>
    </div>
  );
}
