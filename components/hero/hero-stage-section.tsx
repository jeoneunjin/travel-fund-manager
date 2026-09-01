"use client";

import { useRef } from "react";
import { HeroAirplaneDivider } from "./hero-airplane-divider";
import { HeroStageBlock } from "./hero-stage";
import type { HeroStage } from "./hero-content";

// 섹션 하나(비행기 + 손/텍스트)를 감싸는 wrapper. relative + ref를 여기서 만들어서
// - HeroAirplaneDivider가 이 섹션 너비를 기준으로 절대 위치 이동
// - useScroll이 이 섹션의 진입/이탈 구간을 기준으로 progress 계산
// 둘 다 같은 ref를 보게 함
export function HeroStageSection({ stage, imageOnLeft }: { stage: HeroStage; imageOnLeft: boolean }) {
  const sectionRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={sectionRef} className="relative space-y-10 md:space-y-16">
      <HeroAirplaneDivider sectionRef={sectionRef} imageOnLeft={imageOnLeft} />
      <HeroStageBlock stage={stage} imageOnLeft={imageOnLeft} />
    </div>
  );
}
