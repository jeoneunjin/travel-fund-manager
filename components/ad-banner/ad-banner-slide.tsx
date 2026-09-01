import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { AdSlide } from "./ad-banner-content";

// 나중에 실제 사진 없는 광고가 들어올 수 있어서 폴백 톤 하나만 유지 (필요시 슬라이드별로 다르게 확장)
const PLACEHOLDER_GRADIENT = "from-sky-400 to-blue-600";

export function AdBannerSlide({ slide, priority }: { slide: AdSlide; priority?: boolean }) {
  const body = slide.imageUrl ? (
    <div className="relative h-full w-full">
      <Image
        src={slide.imageUrl}
        alt={slide.imageAlt ?? ""}
        fill
        priority={priority}
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 1024px"
      />
      {/* 사진 명암만으로 텍스트 가독성이 부족할 수 있어서 하단 방향 스크림 추가 */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 px-6 pb-9 pt-6 text-white sm:px-8 sm:pb-10">
        <p className="text-3xl font-bold sm:text-5xl md:text-5xl">{slide.headline}</p>
        <p className="mt-5 text-base text-white/85 sm:text-xl">{slide.subcopy}</p>
      </div>
    </div>
  ) : (
    <div
      className={cn(
        "flex h-full w-full flex-col items-center justify-center gap-1 bg-gradient-to-br p-6 text-center text-white",
        PLACEHOLDER_GRADIENT
      )}
    >
      <p className="text-xl font-bold sm:text-2xl">{slide.headline}</p>
      <p className="text-base text-white/80 sm:text-lg">{slide.subcopy}</p>
    </div>
  );

  if (slide.href) {
    return (
      <Link href={slide.href} className="block h-full w-full">
        {body}
      </Link>
    );
  }

  return <div className="h-full w-full">{body}</div>;
}
