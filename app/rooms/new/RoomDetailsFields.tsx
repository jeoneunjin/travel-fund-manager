import { CalendarDays, Plane, Users, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type RoomDetailsFieldsProps = {
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  useSaving: boolean;
  goalAmount: string;
  people: string;
  isSubmitting: boolean;
  onTitleChange: (value: string) => void;
  onDestinationChange: (value: string) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onUseSavingChange: (value: boolean) => void;
  onGoalAmountChange: (value: string) => void;
  onPeopleChange: (value: string) => void;
};

export function RoomDetailsFields({
  title,
  destination,
  startDate,
  endDate,
  useSaving,
  goalAmount,
  people,
  isSubmitting,
  onTitleChange,
  onDestinationChange,
  onStartDateChange,
  onEndDateChange,
  onUseSavingChange,
  onGoalAmountChange,
  onPeopleChange,
}: RoomDetailsFieldsProps) {
  return (
    <Card className="space-y-5 p-6">
      <div className="space-y-2">
        <Label htmlFor="title">여행 제목 <span className="text-destructive">*</span></Label>
        <div className="relative">
          <Plane className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input id="title" placeholder="예: 오키나와 4박 5일" className="pl-9" value={title} onChange={(event) => onTitleChange(event.target.value)} required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="destination">여행지 <span className="text-destructive">*</span></Label>
        <Input id="destination" placeholder="예: 오키나와" value={destination} onChange={(event) => onDestinationChange(event.target.value)} required />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <DateField id="start" label="시작일" value={startDate} onChange={onStartDateChange} />
        <DateField id="end" label="종료일" value={endDate} onChange={onEndDateChange} />
      </div>

      <div className="flex items-center justify-between rounded-lg border p-4">
        <div>
          <Label htmlFor="use-saving">여행 자금 적립</Label>
          <p className="mt-1 text-xs text-muted-foreground">여행 전에 목표 금액을 함께 모읍니다.</p>
        </div>
        <Switch id="use-saving" checked={useSaving} onCheckedChange={onUseSavingChange} disabled={isSubmitting} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {useSaving && <GoalAmountField value={goalAmount} onChange={onGoalAmountChange} />}
        <div className="space-y-2">
          <Label htmlFor="people">예상 인원 <span className="text-destructive">*</span></Label>
          <div className="relative">
            <Users className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="people" type="number" min={1} placeholder="4" className="pl-9 pr-12" value={people} onChange={(event) => onPeopleChange(event.target.value)} required />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">명</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

function DateField({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label} <span className="text-destructive">*</span></Label>
      <div className="relative">
        <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input id={id} type="date" className="pl-9" value={value} onChange={(event) => onChange(event.target.value)} required />
      </div>
    </div>
  );
}

function GoalAmountField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="space-y-2">
      <Label htmlFor="goal">목표 금액 <span className="text-destructive">*</span></Label>
      <div className="relative">
        <Wallet className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input id="goal" type="number" min={1} step={10000} placeholder="3000000" className="pl-9 pr-12" value={value} onChange={(event) => onChange(event.target.value)} required />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">원</span>
      </div>
    </div>
  );
}
