"use client";

import { type RefObject, useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useFlightPath } from "@/hooks/use-flight-path";
import { cn } from "@/lib/utils";

// 예전엔 섹션 전체 폭(992px 기준)을 viewBox로 잡아서 궤적이 텍스트 컬럼까지
// 가로질렀음 — 이제 일러스트 컬럼(md:max-w-sm ≈ 384px, 섹션의 대략 42%) 안에서만
// 시작~끝나도록 viewBox와 SVG 자체의 렌더 너비를 그 컬럼 크기에 맞춤.
const VIEWBOX_WIDTH = 420;
const VIEWBOX_HEIGHT = 387;
const PLANE_SIZE = 56;
const ILLUSTRATION_COLUMN_WIDTH = "42%";

// 손이 왼쪽인 섹션: 일러스트 컬럼(0~420) 안에서만 완만하게 솟았다가 내려오는 곡선
const PATH_LEFT_TO_RIGHT = "M 30 300 C 100 130 320 130 390 250";
// 손이 오른쪽인 섹션: 위 곡선을 좌우로 그대로 미러링
const PATH_RIGHT_TO_LEFT = "M 390 300 C 320 130 100 130 30 250";

// 섹션을 가로지르는 비행기 — 곡선(paper-airplane.png 한 장)을 따라 이동.
// 손이 왼쪽인 섹션은 왼쪽→오른쪽(손의 반대쪽으로), 손이 오른쪽인 섹션은
// 오른쪽→왼쪽으로. progress는 useScroll(["start end","center center"])로 구해서
// "섹션 슬로건이 뷰포트 정중앙에 오는 시점"에 맞춰 사라지도록 함.
export function HeroAirplaneDivider({
  sectionRef,
  imageOnLeft,
}: {
  sectionRef: RefObject<HTMLDivElement | null>;
  imageOnLeft: boolean;
}) {
  const reducedMotion = useReducedMotion();
  const pathRef = useRef<SVGPathElement>(null);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "center center"] });

  // 0~0.15 등장 / 0.15~0.85 곡선 이동 / 0.85~1 소멸(콘텐츠 중앙 정렬 시점)
  const opacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0]);
  const travel = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, 0, 1, 1]);

  const { x, y, rotate } = useFlightPath(pathRef, travel, imageOnLeft ? "forward" : "mirrored");
  const scaleX = imageOnLeft ? 1 : -1;

  if (reducedMotion) return null; // 장식 요소라 리듀스 모션에서는 생략

  return (
    <svg
      viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
      preserveAspectRatio="xMidYMid meet"
      // 일러스트 컬럼 쪽에만 붙여서 텍스트 컬럼과 아예 안 겹치게 함.
      // 모바일(이미지/텍스트가 세로로 쌓이는 레이아웃)에서는 "컬럼"이라는
      // 개념 자체가 없어져서 md 이상에서만 보여줌
      className={cn(
        "pointer-events-none absolute inset-y-0 hidden h-full md:block",
        imageOnLeft ? "left-0" : "right-0"
      )}
      style={{ width: ILLUSTRATION_COLUMN_WIDTH }}
      aria-hidden
    >
      {/* 점선 궤적 — 비행기와 같은 opacity 타이밍 공유 */}
      <motion.path
        ref={pathRef}
        d={imageOnLeft ? PATH_LEFT_TO_RIGHT : PATH_RIGHT_TO_LEFT}
        fill="none"
        stroke="#93c5fd"
        strokeWidth={3}
        strokeDasharray="14 10"
        strokeLinecap="round"
        style={{ opacity }}
      />
      <motion.g style={{ x, y, rotate, scaleX, opacity }}>
        <image
          href="/hero/paper-airplane.png"
          x={-PLANE_SIZE / 2}
          y={-PLANE_SIZE / 2}
          width={PLANE_SIZE}
          height={PLANE_SIZE}
          // 흰 배경 위에서 "떠 있는" 느낌만 은은하게 — box-shadow는 사각형이라 PNG
          // 알파 채널을 못 따라가서 filter: drop-shadow 사용. 작은 장식 요소라
          // 블러/오프셋 다 작게(apple-design: 작은 표면은 얕은 그림자)
          style={{ filter: "drop-shadow(0 3px 6px rgba(15, 23, 42, 0.18))" }}
        />
      </motion.g>
    </svg>
  );
}
