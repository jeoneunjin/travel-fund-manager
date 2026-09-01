// 히어로 섹션 스크롤 스테이지 정의 — hand-stack/caption/airplane이 전부 이 배열의
// peak(0~1 스크롤 진행률)을 기준으로 opacity envelope을 계산해서 타이밍이 어긋나지 않게 함

export type HeroStage = {
  id: string;
  peak: number; // 0~1, 이 지점에서 완전히 보임
  image: "hand-empty" | "hand-coin" | "hand-receipt" | "hand-check";
  caption?: { title: string; description: string };
};

export const STAGES: HeroStage[] = [
  { id: "empty-1", peak: 0, image: "hand-empty" },
  {
    id: "coin",
    peak: 0.2,
    image: "hand-coin",
    caption: { title: "함께 모으기", description: "여행 전, 다 같이 자금을 모아요" },
  },
  { id: "empty-2", peak: 0.4, image: "hand-empty" },
  {
    id: "receipt",
    peak: 0.6,
    image: "hand-receipt",
    caption: { title: "가볍게 기록", description: "여행 중 쓴 돈, 그때그때 남겨요" },
  },
  { id: "empty-3", peak: 0.8, image: "hand-empty" },
  {
    id: "check",
    peak: 1,
    image: "hand-check",
    caption: { title: "깔끔한 정산", description: "여행 후, 복잡한 계산은 끝" },
  },
];

// 텍스트가 이미지보다 살짝 늦게 뜨기 시작하는 지연폭 (스크롤 진행률 기준, 상승 구간에만 적용)
const CAPTION_LAG = 0.04;

// prefers-reduced-motion일 때 각 스테이지 전환을 넓은 크로스페이드 대신
// peak 주변의 좁은 구간에서만 훅 바뀌게 해서 "단순 순차 페이드"에 가깝게 만듦
const REDUCED_MOTION_SNAP_WIDTH = 0.03;

type Envelope = { input: number[]; output: number[] };

function clampToNeighbors(value: number, lower: number, upper: number): number {
  return Math.min(Math.max(value, lower), upper);
}

export function getImageEnvelope(index: number, reducedMotion = false): Envelope {
  const stage = STAGES[index];
  const isFirst = index === 0;
  const isLast = index === STAGES.length - 1;

  const prevPeak = STAGES[index - 1]?.peak ?? stage.peak;
  const nextPeak = STAGES[index + 1]?.peak ?? stage.peak;

  const inPoint = reducedMotion
    ? clampToNeighbors(stage.peak - REDUCED_MOTION_SNAP_WIDTH, prevPeak, stage.peak)
    : prevPeak;
  const outPoint = reducedMotion
    ? clampToNeighbors(stage.peak + REDUCED_MOTION_SNAP_WIDTH, stage.peak, nextPeak)
    : nextPeak;

  if (isFirst) return { input: [stage.peak, outPoint], output: [1, 0] };
  if (isLast) return { input: [inPoint, stage.peak], output: [0, 1] };
  return { input: [inPoint, stage.peak, outPoint], output: [0, 1, 0] };
}

// 캡션은 이미지와 같은 envelope을 쓰되, 상승 구간(peak 이전)에만 CAPTION_LAG만큼
// 늦게 뜨도록 지연점을 하나 끼워 넣음. 하강 구간(peak 이후)은 이미지와 완전히 동일 —
// hand-empty로 넘어갈 때 이미지·텍스트가 같이 페이드아웃되도록
export function getCaptionEnvelope(index: number, reducedMotion = false): Envelope {
  const { input, output } = getImageEnvelope(index, reducedMotion);
  const lag = reducedMotion ? 0 : CAPTION_LAG;

  if (output[0] === 1) {
    // 첫 스테이지(hand-empty)는 캡션이 없어서 호출되지 않지만, 방어적으로 그대로 반환
    return { input, output };
  }

  if (input.length === 2) {
    // 마지막 스테이지: [prev, peak] → [0, 1]
    const [prev, peak] = input;
    const laggedStart = Math.min(prev + lag, peak);
    return { input: [prev, laggedStart, peak], output: [0, 0, 1] };
  }

  const [prev, peak, next] = input;
  const laggedStart = Math.min(prev + lag, peak);
  return { input: [prev, laggedStart, peak, next], output: [0, 0, 1, 0] };
}

// 종이비행기 궤적 — draft. 4개 hand 단계(empty/coin/receipt/check) 근처를 지나가도록
// 대략 배치한 완만한 S자 곡선. 실제 hand-stack 레이아웃 좌표가 정해지면 좌표만 갱신하면 됨.
export const AIRPLANE_VIEWBOX = "0 0 1000 600";
export const AIRPLANE_PATH_D =
  "M 40 520 C 160 520 200 200 340 200 C 460 200 500 460 620 460 C 740 460 780 160 960 120";
