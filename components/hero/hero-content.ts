// 히어로 섹션 콘텐츠 — 이미지/타이틀/설명 데이터만 (모션 로직은 각 컴포넌트에)

export type HeroStage = {
  id: string;
  image: "hand-coin" | "hand-receipt" | "hand-check";
  title: string;
  description: string;
  detail: string; // title/description 아래 붙는, 실제 기능 동작을 한 문장으로 풀어주는 설명
};

export const STAGES: HeroStage[] = [
  {
    id: "coin",
    image: "hand-coin",
    title: "함께 모으기",
    description: "여행 전, 다 같이 자금을 모아요",
    detail: "방을 만들고 목표 금액을 정하면, 인원수에 맞춰 1인당 모을 금액이 자동으로 나뉘어요.",
  },
  {
    id: "receipt",
    image: "hand-receipt",
    title: "가볍게 기록",
    description: "여행 중 쓴 돈, 그때그때 남겨요",
    detail: "누가 결제했는지, 누구랑 나눠 썼는지만 입력하면 지출 내역이 카테고리별로 쌓여요.",
  },
  {
    id: "check",
    image: "hand-check",
    title: "깔끔한 정산",
    description: "여행 후, 복잡한 계산은 끝",
    detail: "누가 더 냈고 덜 냈는지 자동으로 계산해서, 최소한의 송금 횟수로 정산 방법을 알려줘요.",
  },
];
