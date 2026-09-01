"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { STAGES, getCaptionEnvelope, type HeroStage } from "./hero-motion-config";

export function HeroCaption({
  progress,
  reducedMotion,
}: {
  progress: MotionValue<number>;
  reducedMotion: boolean;
}) {
  return (
    <div className="relative mt-6 h-16 w-full max-w-sm text-center">
      {STAGES.map((stage, index) =>
        stage.caption ? (
          <CaptionFrame
            key={stage.id}
            index={index}
            caption={stage.caption}
            progress={progress}
            reducedMotion={reducedMotion}
          />
        ) : null
      )}
    </div>
  );
}

function CaptionFrame({
  index,
  caption,
  progress,
  reducedMotion,
}: {
  index: number;
  caption: NonNullable<HeroStage["caption"]>;
  progress: MotionValue<number>;
  reducedMotion: boolean;
}) {
  const { input, output } = getCaptionEnvelope(index, reducedMotion);
  const opacity = useTransform(progress, input, output);

  return (
    <motion.div style={{ opacity }} className="absolute inset-0 flex flex-col items-center justify-center gap-1">
      <h3 className="text-xl font-bold tracking-tight md:text-2xl">{caption.title}</h3>
      <p className="text-sm text-muted-foreground md:text-base">{caption.description}</p>
    </motion.div>
  );
}
