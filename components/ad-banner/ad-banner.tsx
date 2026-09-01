"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { AdBannerSlide } from "./ad-banner-slide";
import { SLIDES } from "./ad-banner-content";

const AUTOPLAY_DELAY_MS = 5000;
const SLIDE_OFFSET_PX = 24;

// 캐러셀 라이브러리 없이 framer-motion으로 직접 구현. 방향(direction)을 같이 들고 있어야
// 나가는/들어오는 슬라이드가 서로 반대쪽으로 살짝 스치듯 크로스페이드됨(AnimatePresence의
// custom prop으로 전달) — apple-design 원칙상 제스처 모멘텀 없는 "한 번에 정지 상태로
// 안착"하는 전환이라 스프링이 맞는 경우라 bounce:0(no overshoot)의 크리티컬 댐핑 스프링 사용.
export function AdBanner() {
  const reducedMotion = !!useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);

  const paginate = (nextIndex: number, dir: number) => {
    setDirection(dir);
    setActiveIndex((nextIndex + SLIDES.length) % SLIDES.length);
  };
  const goNext = () => paginate(activeIndex + 1, 1);
  const goPrev = () => paginate(activeIndex - 1, -1);
  const goTo = (index: number) => paginate(index, index > activeIndex ? 1 : -1);

  useEffect(() => {
    if (reducedMotion || isPaused) return;
    const id = setInterval(goNext, AUTOPLAY_DELAY_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion, isPaused, activeIndex]);

  const offset = reducedMotion ? 0 : SLIDE_OFFSET_PX;
  const variants = {
    enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? offset : -offset }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -offset : offset }),
  };
  const transition = reducedMotion
    ? { duration: 0.2, ease: "easeOut" as const }
    : { type: "spring" as const, bounce: 0, duration: 0.4 };

  return (
    // 풀블리드 — 부모(max-w-5xl)와 무관하게 뷰포트 전체 폭으로 탈출.
    // 클래식 공식: left/right 50% + 음수 마진 -50vw + width 100vw
    <div className="relative left-1/2 right-1/2 w-screen -mx-[50vw] pt-6">
      <div
        role="region"
        aria-roledescription="carousel"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") goPrev();
          else if (e.key === "ArrowRight") goNext();
        }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="relative aspect-[16/9] w-full overflow-hidden outline-none sm:aspect-[3/1]"
      >
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={activeIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={transition}
            className="absolute inset-0"
          >
            <AdBannerSlide slide={SLIDES[activeIndex]} priority={activeIndex === 0} />
          </motion.div>
        </AnimatePresence>

        <button
          type="button"
          aria-label="이전 광고"
          onClick={goPrev}
          className="absolute left-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-white/20 text-white transition-colors hover:bg-white/30"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="다음 광고"
          onClick={goNext}
          className="absolute right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-white/20 text-white transition-colors hover:bg-white/30"
        >
          <ArrowRight className="h-4 w-4" />
        </button>

        <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
          {SLIDES.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              aria-label={`${index + 1}번째 광고로 이동`}
              onClick={() => goTo(index)}
              className={cn(
                "h-1.5 w-1.5 rounded-full transition-colors",
                index === activeIndex ? "bg-white" : "bg-white/50"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
