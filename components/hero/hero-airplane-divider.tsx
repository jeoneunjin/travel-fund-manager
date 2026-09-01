"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

// 스테이지 사이를 잇는 장식용 비행기 — 위→아래로 내려가는 흐름 안에서
// 한 번은 왼쪽, 한 번은 오른쪽에서 등장하도록 fromLeft를 번갈아 받음
export function HeroAirplaneDivider({ fromLeft }: { fromLeft: boolean }) {
  const reducedMotion = useReducedMotion();
  if (reducedMotion) return null; // 리듀스 모션에서는 장식 요소라 생략

  const side = fromLeft ? -1 : 1;

  return (
    <div className={fromLeft ? "flex justify-start" : "flex justify-end"}>
      <motion.div
        className="relative h-14 w-14 md:h-16 md:w-16"
        initial={{ opacity: 0, x: side * 80, y: -24, rotate: fromLeft ? -20 : 20 }}
        whileInView={{ opacity: 1, x: 0, y: 0, rotate: fromLeft ? 15 : -15 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ type: "spring", damping: 1, stiffness: 100 }}
      >
        <Image src="/hero/paper-airplane.png" alt="" fill className="object-contain" sizes="64px" />
      </motion.div>
    </div>
  );
}
