import { Card } from "@/components/ui/card";
import { formatWon } from "@/lib/format";

type RoomPreviewProps = {
  title: string;
  destination: string;
  goalAmount: string;
  people: string;
  useSaving: boolean;
  monthlyPreview: number;
};

export function RoomPreview({
  title,
  destination,
  goalAmount,
  people,
  useSaving,
  monthlyPreview,
}: RoomPreviewProps) {
  return (
    <div className="md:col-span-1">
      <Card className="sticky top-20 overflow-hidden p-5">
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          실시간 미리보기
        </div>
        <h3 className="mt-1 text-lg font-bold">{title || "여행 제목"}</h3>
        <p className="text-sm text-muted-foreground">{destination || "여행지"}</p>

        <div className="mt-5 rounded-lg bg-gradient-to-br from-sky-50 to-blue-50 p-4">
          <div className="text-xs text-muted-foreground">
            {useSaving ? "1인당 월 적립 예상액" : "여행 자금 적립"}
          </div>
          <div className="mt-1 text-2xl font-bold text-primary">
            {useSaving ? formatWon(monthlyPreview) : "사용 안 함"}
          </div>
          <div className="mt-2 space-y-1 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>목표 금액</span>
              <span className="font-medium text-foreground">
                {useSaving && goalAmount ? formatWon(Number(goalAmount)) : "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>예상 인원</span>
              <span className="font-medium text-foreground">{people || "—"}명</span>
            </div>
            {useSaving && (
              <div className="flex justify-between">
                <span>적립 기간</span>
                <span className="font-medium text-foreground">6개월</span>
              </div>
            )}
          </div>
        </div>

        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          생성 후 초대 링크로 멤버를 초대하면, 각자의 적립 목표가 자동으로 분배됩니다.
        </p>
      </Card>
    </div>
  );
}
