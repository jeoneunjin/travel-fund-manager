// 히어로 섹션 콘텐츠 — 이미지/타이틀/설명 데이터만 (모션 로직은 각 컴포넌트에)

export type HeroStage = {
  id: string;
  image: "hand-coin" | "hand-receipt" | "hand-check";
  title: string;
  description: string;
};

export const STAGES: HeroStage[] = [
  { id: "coin", image: "hand-coin", title: "함께 모으기", description: "여행 전, 다 같이 자금을 모아요" },
  { id: "receipt", image: "hand-receipt", title: "가볍게 기록", description: "여행 중 쓴 돈, 그때그때 남겨요" },
  { id: "check", image: "hand-check", title: "깔끔한 정산", description: "여행 후, 복잡한 계산은 끝" },
];
