"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import type { HeroStage } from "./hero-content";

// 뷰포트에 들어올 때 한 번 등장하는(정지 상태로 안착하는) 리빌이라, 계속 스크롤과
// 1:1로 붙어 있어야 하는 스크럽 애니메이션과 달리 스프링을 쓰는 게 맞는 상황임
// (apple-design §4). 제스처 모멘텀이 없는 인터랙션이라 damping: 1(critically
// damped, no bounce) — 이 히어로 전체에서 쓰는 기본 스프링.
const REVEAL_SPRING = { type: "spring" as const, damping: 1, stiffness: 120 };

export function HeroStageBlock({ stage, imageOnLeft }: { stage: HeroStage; imageOnLeft: boolean }) {
  const reducedMotion = useReducedMotion();
  const side = imageOnLeft ? -1 : 1;

  const imageInitial = reducedMotion ? { opacity: 0 } : { opacity: 0, x: side * 60 };
  const textInitial = reducedMotion ? { opacity: 0 } : { opacity: 0, x: side * 30 };

  return (
    <div
      className={`flex flex-col items-center gap-8 md:gap-16 ${
        imageOnLeft ? "md:flex-row" : "md:flex-row-reverse"
      }`}
    >
      <motion.div
        className="relative aspect-square w-full max-w-xs shrink-0 md:max-w-sm"
        initial={imageInitial}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={REVEAL_SPRING}
      >
        <Image
          src={`/hero/${stage.image}.png`}
          alt=""
          fill
          className="object-contain"
          sizes="(max-width: 768px) 80vw, 384px"
        />
      </motion.div>
      <motion.div
        className="text-center md:text-left"
        initial={textInitial}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        // 이미지가 먼저 자리 잡고 텍스트가 살짝 뒤따라오는 느낌 — 이미지와 같은
        // 스프링에 delay만 살짝 줌
        transition={{ ...REVEAL_SPRING, delay: reducedMotion ? 0 : 0.12 }}
      >
        <h3 className="text-3xl font-bold tracking-tight md:text-5xl">{stage.title}</h3>
        <p className="mt-3 text-lg text-muted-foreground md:text-xl">{stage.description}</p>
      </motion.div>
    </div>
  );
}
