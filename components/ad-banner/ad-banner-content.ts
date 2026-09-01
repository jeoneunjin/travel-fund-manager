// 광고 배너 슬라이드 데이터 — 첫 번째(own-service)는 항상 고정, 나머지는
// 나중에 호텔/여행지 등 실제 광고로 채워질 자리. imageUrl이 없으면 플레이스홀더로
// 렌더되고, href가 없으면 클릭 불가능한 카드로 렌더됨 (ad-banner-slide.tsx 참고).
export type AdSlide = {
  id: string;
  headline: string;
  subcopy: string;
  imageUrl?: string;
  imageAlt?: string;
  href?: string;
};

export const SLIDES: AdSlide[] = [
  {
    id: "own-service",
    headline: "여행 자금, 이제 마음 편히",
    subcopy: "모으고, 기록하고, 정산까지 한 번에",
    imageUrl: "/ads/travel-woman-hero.png",
    imageAlt: "",
    href: "/rooms/new",
  },
  {
    id: "placeholder-1",
    headline: "곧 만나요",
    subcopy: "다양한 여행 혜택을 준비 중이에요",
  },
  {
    id: "placeholder-2",
    headline: "곧 만나요",
    subcopy: "호텔·여행지 특가가 곧 찾아옵니다",
  },
];
