"use client";

import Image from "next/image";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { STAGES, getImageEnvelope } from "./hero-motion-config";

export function HeroHandStack({
  progress,
  reducedMotion,
}: {
  progress: MotionValue<number>;
  reducedMotion: boolean;
}) {
  return (
    <div className="relative aspect-square w-full max-w-sm">
      {STAGES.map((stage, index) => (
        <HandFrame key={stage.id} index={index} image={stage.image} progress={progress} reducedMotion={reducedMotion} />
      ))}
    </div>
  );
}

function HandFrame({
  index,
  image,
  progress,
  reducedMotion,
}: {
  index: number;
  image: string;
  progress: MotionValue<number>;
  reducedMotion: boolean;
}) {
  const { input, output } = getImageEnvelope(index, reducedMotion);
  const opacity = useTransform(progress, input, output);

  return (
    <motion.div style={{ opacity }} className="absolute inset-0">
      <Image
        src={`/hero/${image}.png`}
        alt=""
        fill
        priority={index === 0}
        className="object-contain"
        sizes="(max-width: 768px) 80vw, 384px"
      />
    </motion.div>
  );
}
