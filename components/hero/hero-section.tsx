import { STAGES } from "./hero-content";
import { HeroStageSection } from "./hero-stage-section";

export function HeroSection() {
  return (
    // 페이지 전체 배경(layout.tsx의 옅은 파란색)과 분리해서 이 섹션만 흰색으로 —
    // 바깥에 폭 제약이 없어서(부모인 <main>도 제약 없음) 이 div만으로 화면 끝까지 채워짐
    <div className="bg-white">
      <div className="mx-auto max-w-5xl px-4 py-16 md:py-24">
        <div className="space-y-20 md:space-y-32">
          {STAGES.map((stage, index) => (
            <HeroStageSection key={stage.id} stage={stage} imageOnLeft={index % 2 === 0} />
          ))}
        </div>
      </div>
    </div>
  );
}
