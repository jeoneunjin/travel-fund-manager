// 정산/멤버 조회 순수 함수 — Room 데이터만으로 계산하고 DB 접근이 없음.
// lib/db/room.ts와 분리한 이유: client component(settlement-view.tsx, expenses-view.tsx)가
// 이 함수들을 직접 import하는데, lib/db/room.ts는 prisma를 불러오는 서버 전용 모듈이라
// 그대로 두면 client 번들에 prisma/pg가 딸려 들어가 빌드가 깨짐.
import type { Room, SettlementRow, Transfer } from "./types";

export function totalExpenses(room: Room): number {
  return room.expenses.reduce((sum, e) => sum + e.amount, 0);
}

export function computeSettlement(room: Room): {
  rows: SettlementRow[];
  transfers: Transfer[];
} {
  const paidByMember = new Map<string, number>();
  const burdenByMember = new Map<string, number>();
  room.members.forEach((m) => {
    paidByMember.set(m.id, 0);
    burdenByMember.set(m.id, 0);
  });
  room.expenses.forEach((e) => {
    paidByMember.set(e.payerId, (paidByMember.get(e.payerId) ?? 0) + e.amount);
    const share = e.amount / e.splitBetweenIds.length;
    e.splitBetweenIds.forEach((id) => {
      burdenByMember.set(id, (burdenByMember.get(id) ?? 0) + share);
    });
  });

  const rows: SettlementRow[] = room.members.map((m) => {
    const paid = paidByMember.get(m.id) ?? 0;
    const burden = Math.round(burdenByMember.get(m.id) ?? 0);
    return { memberId: m.id, paid, burden, diff: Math.round(paid - burden) };
  });

  const debtors = rows.filter((r) => r.diff < 0).sort((a, b) => a.diff - b.diff);
  const creditors = rows.filter((r) => r.diff > 0).sort((a, b) => b.diff - a.diff);

  const transfers: Transfer[] = [];
  let i = 0;
  let j = 0;
  const remaining = rows.map((r) => ({ ...r }));
  while (i < debtors.length && j < creditors.length) {
    const d = remaining.find((r) => r.memberId === debtors[i].memberId)!;
    const c = remaining.find((r) => r.memberId === creditors[j].memberId)!;
    const amount = Math.min(-d.diff, c.diff);
    if (amount > 0) {
      transfers.push({ fromId: d.memberId, toId: c.memberId, amount });
      d.diff += amount;
      c.diff -= amount;
    }
    if (Math.abs(d.diff) < 1) i++;
    if (Math.abs(c.diff) < 1) j++;
  }

  return { rows, transfers };
}

export function getMember(room: Room, memberId: string) {
  return room.members.find((m) => m.id === memberId);
}
