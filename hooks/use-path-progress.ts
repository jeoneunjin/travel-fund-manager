"use client";

import { type RefObject, useEffect, useRef } from "react";
import { useMotionValue, useMotionValueEvent, type MotionValue } from "framer-motion";

// SVG path 위의 한 지점(progress 0~1)을 containerRef 기준 픽셀 좌표로 변환해서
// x/y/rotate 모션값으로 내려줌. getScreenCTM()으로 변환하기 때문에 viewBox 크기와
// 실제 렌더링 크기가 달라도(반응형으로 늘어나도) 항상 컨테이너 안의 정확한 픽셀 위치가 나옴.
//
// x/y는 스크롤 progress에 스무딩 없이 1:1로 붙어야 해서(apple-design §1/§2 — 스크롤 중엔
// 입력과 출력이 지연 없이 같이 움직여야 함) 여기서 스프링을 걸지 않음. 회전각만 국소적으로
// 튀는 걸 죽이고 싶으면 이 훅이 반환하는 rotate를 호출부에서 별도로 감싸서 쓸 것.
export function usePathProgress(
  pathRef: RefObject<SVGPathElement | null>,
  containerRef: RefObject<HTMLElement | null>,
  progress: MotionValue<number>,
) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useMotionValue(0);
  const lengthRef = useRef(0);

  const sample = (t: number) => {
    const path = pathRef.current;
    const container = containerRef.current;
    if (!path || !container) return;

    if (!lengthRef.current) lengthRef.current = path.getTotalLength();
    const length = lengthRef.current;
    const ctm = path.getScreenCTM();
    if (!ctm) return;
    const containerBox = container.getBoundingClientRect();

    const toContainerPoint = (lengthAtPoint: number) => {
      const raw = path.getPointAtLength(lengthAtPoint).matrixTransform(ctm);
      return { x: raw.x - containerBox.left, y: raw.y - containerBox.top };
    };

    const point = toContainerPoint(t * length);
    // 살짝 앞선 지점과 비교해 접선 방향(진행 각도)을 구함
    const ahead = toContainerPoint(Math.min(t + 0.005, 1) * length);
    const angle = Math.atan2(ahead.y - point.y, ahead.x - point.x) * (180 / Math.PI);

    x.set(point.x);
    y.set(point.y);
    rotate.set(angle);
  };

  useEffect(() => {
    sample(progress.get());
    // 리사이즈되면 컨테이너 크기/CTM이 바뀌므로 같은 progress로 다시 샘플링
    const handleResize = () => sample(progress.get());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useMotionValueEvent(progress, "change", (latest) => {
    sample(latest);
  });

  return { x, y, rotate };
}
