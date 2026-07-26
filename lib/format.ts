export function formatWon(amount: number): string {
  return new Intl.NumberFormat("ko-KR").format(amount) + "원";
}

export function formatWonShort(amount: number): string {
  if (Math.abs(amount) >= 10000) {
    const man = (amount / 10000).toLocaleString("ko-KR", {
      maximumFractionDigits: 1,
    });
    return man + "만원";
  }
  return new Intl.NumberFormat("ko-KR").format(amount) + "원";
}

export function dDay(target: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const t = new Date(target);
  t.setHours(0, 0, 0, 0);
  const diff = Math.round(
    (t.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
  return diff;
}

export function dDayLabel(target: string): string {
  const d = dDay(target);
  if (d === 0) return "D-day";
  if (d > 0) return `D-${d}`;
  return `D+${Math.abs(d)}`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export function formatDateShort(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export function dateRangeLabel(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const sameYear = s.getFullYear() === e.getFullYear();
  const sameMonth = sameYear && s.getMonth() === e.getMonth();
  if (sameMonth) {
    return `${s.getFullYear()}.${s.getMonth() + 1}.${s.getDate()} - ${e.getDate()}`;
  }
  if (sameYear) {
    return `${s.getFullYear()}.${s.getMonth() + 1}.${s.getDate()} - ${e.getMonth() + 1}.${e.getDate()}`;
  }
  return `${s.getFullYear()}.${s.getMonth() + 1}.${s.getDate()} - ${e.getFullYear()}.${e.getMonth() + 1}.${e.getDate()}`;
}
