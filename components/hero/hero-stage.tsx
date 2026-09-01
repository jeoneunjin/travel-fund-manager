"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { HeroStage } from "./hero-content";

// 단순 페이드 + 아주 살짝의 방향성 이동. 예전엔 스프링(type:"spring", damping:1,
// stiffness:120)을 썼는데, Framer Motion의 damping은 apple-design 스킬에서 말하는
// 0~1 감쇠비가 아니라 stiffness/mass에 종속된 절댓값이라 — damping:1은 stiffness:120
// 기준 임계감쇠(약 22)에 한참 못 미쳐서 심하게 통통 튀는(underdamped) 스프링이 됐음.
// 그게 "흔들거리는" 원인. 스프링 없이 tween easeOut으로 교체.
const REVEAL_TRANSITION = { duration: 0.6, ease: "easeOut" as const };

export function HeroStageBlock({ stage, imageOnLeft }: { stage: HeroStage; imageOnLeft: boolean }) {
  const reducedMotion = useReducedMotion();
  const side = imageOnLeft ? -1 : 1;

  const imageInitial = reducedMotion ? { opacity: 0 } : { opacity: 0, x: side * 40 };
  const textInitial = reducedMotion ? { opacity: 0 } : { opacity: 0, x: side * 40 };

  return (
    <div
      // 비행기 SVG가 position:absolute라 z-index 없어도 기본적으로 일반 흐름
      // 콘텐츠보다 위에 그려짐(화면 좁아지면 궤적이 텍스트를 가리는 원인) —
      // relative + z-10으로 콘텐츠가 항상 위에 오도록 명시
      className={`relative z-10 flex flex-col items-center gap-8 md:gap-16 ${
        imageOnLeft ? "md:flex-row" : "md:flex-row-reverse"
      }`}
    >
      <motion.div
        className="relative aspect-square w-full max-w-xs shrink-0 md:max-w-sm"
        initial={imageInitial}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={REVEAL_TRANSITION}
      >
        <Image
          src={`/hero/${stage.image}.png`}
          alt=""
          fill
          // 원본이 왼쪽 배치 기준으로 그려져 있어서, 오른쪽 섹션에서는 좌우 반전
          className={cn("object-contain", !imageOnLeft && "-scale-x-100")}
          sizes="(max-width: 768px) 80vw, 384px"
        />
      </motion.div>
      <motion.div
        // 궤적 SVG를 일러스트 컬럼 안으로 가뒀지만(hero-airplane-divider.tsx),
        // 뷰포트 폭에 따라 컬럼 경계가 살짝 어긋날 수 있어서 텍스트 뒤에도
        // 반투명 배경을 깔아 이중으로 막음. z-10은 이 블록의 부모(위 div)에 있어서
        // 궤적(z-index 없음, 기본값)보다 항상 위에 그려짐
        className="rounded-2xl bg-white/90 px-4 py-3 text-center md:text-left"
        initial={textInitial}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        // 이미지가 먼저 자리 잡고 텍스트가 살짝 뒤따라오는 느낌 — 같은 트랜지션에 delay만 줌
        transition={{ ...REVEAL_TRANSITION, delay: reducedMotion ? 0 : 0.15 }}
      >
        <h3 className="text-3xl font-bold tracking-tight md:text-5xl">{stage.title}</h3>
        <p className="mt-3 text-lg text-muted-foreground md:text-xl">{stage.description}</p>
        <p className="mt-2 text-sm text-muted-foreground/80 md:text-base">{stage.detail}</p>
      </motion.div>
    </div>
  );
}
