"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useSpring, type MotionValue } from "framer-motion";
import { usePathProgress } from "@/hooks/use-path-progress";
import { AIRPLANE_PATH_D, AIRPLANE_VIEWBOX } from "./hero-motion-config";

export function HeroAirplane({
  progress,
  reducedMotion,
}: {
  progress: MotionValue<number>;
  reducedMotion: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const { x, y, rotate } = usePathProgress(pathRef, containerRef, progress);

  // 회전각 계산에서 나오는 국소적인 튐만 죽이는 용도의 스프링. damping: 1 = critically
  // damped, no bounce — apple-design 기본값(§4)이고, 이 인터랙션엔 flick/드래그처럼
  // 모멘텀을 실어줄 제스처가 없어서 bounce를 줄 이유가 없음.
  // x/y(위치)는 스크롤과 1:1로 붙어 있어야 해서 스프링을 걸지 않음 — 회전에만 적용.
  const smoothRotate = useSpring(rotate, { damping: 1, stiffness: 300 });

  return (
    <div ref={containerRef} className="pointer-events-none absolute inset-0">
      {/* 눈에 보이지 않는 안내선 — 좌표 샘플링 용도 */}
      <svg viewBox={AIRPLANE_VIEWBOX} className="absolute inset-0 h-full w-full" aria-hidden>
        <path ref={pathRef} d={AIRPLANE_PATH_D} fill="none" stroke="none" />
      </svg>

      {!reducedMotion && (
        <motion.div
          style={{ x, y, rotate: smoothRotate }}
          className="absolute left-0 top-0 h-10 w-10 -translate-x-1/2 -translate-y-1/2"
        >
          <Image src="/hero/paper-airplane.png" alt="" fill className="object-contain" sizes="40px" />
        </motion.div>
      )}
    </div>
  );
}
