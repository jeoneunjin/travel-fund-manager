"use client";

import { type RefObject, useEffect, useRef } from "react";
import { useMotionValue, useMotionValueEvent, type MotionValue } from "framer-motion";

const TANGENT_EPSILON = 0.01;

// paper-airplane.png 원본이 향하는 기본 각도(실측) — 오른쪽 위로 약 15도.
const ARTWORK_HEADING_DEG = -15;

export type FlightDirection = "forward" | "mirrored";

// SVG path 위의 한 지점(progress 0~1)의 좌표(x/y, path의 viewBox 단위)와
// 접선 각도 기반 rotate를 계산해서 모션값으로 내려줌.
//
// direction: "forward"면 아트웍을 그대로(scaleX 1) 쓴다는 전제로 rotate를 계산하고,
// "mirrored"면 호출부에서 scaleX(-1)를 같이 적용한다는 전제로 rotate를 미리 보정함.
// Framer Motion이 rotate를 원본 좌표계에 먼저 적용한 뒤 scaleX로 미러링하는 합성
// 순서라(실제 렌더링해서 확인함), 단순히 rotate 부호만 반대로 주면 안 되고
// `180 - ARTWORK_HEADING_DEG - tangent` 공식으로 계산해야 함.
export function useFlightPath(
  pathRef: RefObject<SVGPathElement | null>,
  progress: MotionValue<number>,
  direction: FlightDirection,
) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useMotionValue(0);
  const lengthRef = useRef(0);

  const sample = (t: number) => {
    const path = pathRef.current;
    if (!path) return;
    if (!lengthRef.current) lengthRef.current = path.getTotalLength();
    const length = lengthRef.current;
    const clamped = Math.min(Math.max(t, 0), 1);

    // 접선 각도는 현재 지점 앞뒤로 아주 살짝 떨어진 두 점의 차이로 추정 (중심차분)
    const behindT = Math.max(clamped - TANGENT_EPSILON, 0);
    const aheadT = Math.min(clamped + TANGENT_EPSILON, 1);
    const point = path.getPointAtLength(clamped * length);
    const behind = path.getPointAtLength(behindT * length);
    const ahead = path.getPointAtLength(aheadT * length);
    const tangent = Math.atan2(ahead.y - behind.y, ahead.x - behind.x) * (180 / Math.PI);

    const finalRotate =
      direction === "forward"
        ? tangent - ARTWORK_HEADING_DEG
        : 180 - ARTWORK_HEADING_DEG - tangent;

    x.set(point.x);
    y.set(point.y);
    rotate.set(finalRotate);
  };

  useEffect(() => {
    sample(progress.get());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useMotionValueEvent(progress, "change", (latest) => sample(latest));

  return { x, y, rotate };
}
