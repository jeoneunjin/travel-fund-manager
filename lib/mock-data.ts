import type {
  Expense,
  ExpenseCategory,
  Room,
  SettlementRow,
  Transfer,
} from "./types";

const avatar = (seed: string) =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;

export const categoryLabel: Record<ExpenseCategory, string> = {
  food: "식비",
  lodging: "숙박",
  transport: "교통",
  activity: "액티비티",
  shopping: "쇼핑",
  etc: "기타",
};

export const categoryColor: Record<ExpenseCategory, string> = {
  food: "bg-orange-100 text-orange-700",
  lodging: "bg-indigo-100 text-indigo-700",
  transport: "bg-sky-100 text-sky-700",
  activity: "bg-emerald-100 text-emerald-700",
  shopping: "bg-pink-100 text-pink-700",
  etc: "bg-slate-100 text-slate-700",
};

export const statusMeta: Record<
  Room["status"],
  { label: string; className: string }
> = {
  saving: { label: "적립 중", className: "bg-blue-100 text-blue-700" },
  traveling: { label: "여행 중", className: "bg-emerald-100 text-emerald-700" },
  settling: { label: "정산 중", className: "bg-amber-100 text-amber-700" },
  completed: { label: "완료", className: "bg-slate-100 text-slate-600" },
};

export const mockRooms: Room[] = [
  {
    id: "okinawa-2026",
    title: "오키나와 4박 5일",
    destination: "오키나와",
    startDate: "2026-05-01",
    endDate: "2026-05-05",
    goalAmount: 3000000,
    totalSaved: 1800000,
    expectedPeople: 4,
    status: "saving",
    inviteToken: "okinawa-x7f2",
    members: [
      { id: "u1", name: "김여행", avatarUrl: avatar("kim"), isOwner: true, personalGoal: 800000, personalSaved: 640000 },
      { id: "u2", name: "박바다", avatarUrl: avatar("park"), personalGoal: 750000, personalSaved: 520000 },
      { id: "u3", name: "이산", avatarUrl: avatar("lee"), personalGoal: 750000, personalSaved: 360000 },
      { id: "u4", name: "정하늘", avatarUrl: avatar("jung"), personalGoal: 700000, personalSaved: 280000 },
    ],
    expenses: [
      { id: "e1", title: "나하 공항 택시", amount: 8200, payerId: "u1", splitBetweenIds: ["u1","u2","u3","u4"], date: "2026-05-01", category: "transport", place: "나하 공항" },
      { id: "e2", title: "이호 비치 호텔 1박", amount: 120000, payerId: "u2", splitBetweenIds: ["u1","u2","u3","u4"], date: "2026-05-01", category: "lodging", place: "이호 비치" },
      { id: "e3", title: "아침 식사", amount: 15600, payerId: "u3", splitBetweenIds: ["u1","u2","u3"], date: "2026-05-02", category: "food", place: "국제거리 카페" },
      { id: "e4", title: "푸른 동굴 스노클링", amount: 44000, payerId: "u4", splitBetweenIds: ["u1","u2","u3","u4"], date: "2026-05-02", category: "activity", place: "자키비치" },
      { id: "e5", title: "마키 공수애 쇼핑", amount: 32000, payerId: "u1", splitBetweenIds: ["u1","u2"], date: "2026-05-03", category: "shopping", place: "마키 공수애" },
      { id: "e6", title: "저녁 이자카야", amount: 58000, payerId: "u2", splitBetweenIds: ["u1","u2","u3","u4"], date: "2026-05-03", category: "food", place: "국제거리 이자카야" },
      { id: "e7", title: "렌터카 2일치", amount: 9600, payerId: "u3", splitBetweenIds: ["u1","u2","u3","u4"], date: "2026-05-03", category: "transport", place: "오키나와 렌터카" },
      { id: "e8", title: "호텔 2박", amount: 120000, payerId: "u2", splitBetweenIds: ["u1","u2","u3","u4"], date: "2026-05-03", category: "lodging", place: "이호 비치" },
    ],
  },
  {
    id: "sapporo-winter",
    title: "삿포로 겨울 여행",
    destination: "삿포로",
    startDate: "2026-12-20",
    endDate: "2026-12-25",
    goalAmount: 2500000,
    totalSaved: 2500000,
    expectedPeople: 3,
    status: "traveling",
    inviteToken: "sapporo-k3p9",
    members: [
      { id: "u1", name: "한겨울", avatarUrl: avatar("han"), isOwner: true, personalGoal: 900000, personalSaved: 900000 },
      { id: "u2", name: "윤눈", avatarUrl: avatar("yun"), personalGoal: 800000, personalSaved: 800000 },
      { id: "u3", name: "최슬로프", avatarUrl: avatar("choi"), personalGoal: 800000, personalSaved: 800000 },
    ],
    expenses: [
      { id: "e1", title: "신치토세 공항 버스", amount: 12000, payerId: "u1", splitBetweenIds: ["u1","u2","u3"], date: "2026-12-20", category: "transport", place: "신치토세 공항" },
      { id: "e2", title: "스키 리프트 1일권", amount: 33000, payerId: "u2", splitBetweenIds: ["u1","u2","u3"], date: "2026-12-21", category: "activity", place: "니세코" },
      { id: "e3", title: "라멘 저녁", amount: 9800, payerId: "u3", splitBetweenIds: ["u1","u2","u3"], date: "2026-12-21", category: "food", place: "스스키노 라멘" },
    ],
  },
  {
    id: "jeju-summer",
    title: "제주 여름 힐링",
    destination: "제주도",
    startDate: "2026-07-10",
    endDate: "2026-07-13",
    goalAmount: 1500000,
    totalSaved: 1500000,
    expectedPeople: 2,
    status: "settling",
    inviteToken: "jeju-m8q1",
    members: [
      { id: "u1", name: "강바람", avatarUrl: avatar("kang"), isOwner: true, personalGoal: 800000, personalSaved: 800000 },
      { id: "u2", name: "임돌하", avatarUrl: avatar("lim"), personalGoal: 700000, personalSaved: 700000 },
    ],
    expenses: [
      { id: "e1", title: "제주공항 렌터카", amount: 58000, payerId: "u1", splitBetweenIds: ["u1","u2"], date: "2026-07-10", category: "transport", place: "제주공항" },
      { id: "e2", title: "해변 게스트하우스", amount: 120000, payerId: "u2", splitBetweenIds: ["u1","u2"], date: "2026-07-10", category: "lodging", place: "함덕해변" },
      { id: "e3", title: "흑돼우 바비큐", amount: 42000, payerId: "u1", splitBetweenIds: ["u1","u2"], date: "2026-07-11", category: "food", place: "성읍민속마을" },
      { id: "e4", title: "우도 자전거 대여", amount: 9000, payerId: "u2", splitBetweenIds: ["u1","u2"], date: "2026-07-12", category: "activity", place: "우도" },
    ],
  },
];

export function getRoom(roomId: string): Room | undefined {
  return mockRooms.find((r) => r.id === roomId);
}

export function getRoomByToken(token: string): Room | undefined {
  return mockRooms.find((r) => r.inviteToken === token);
}

export function getMember(room: Room, memberId: string) {
  return room.members.find((m) => m.id === memberId);
}

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

  const debtors = rows
    .filter((r) => r.diff < 0)
    .sort((a, b) => a.diff - b.diff);
  const creditors = rows
    .filter((r) => r.diff > 0)
    .sort((a, b) => b.diff - a.diff);

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

export const expenseCategories: ExpenseCategory[] = [
  "food",
  "lodging",
  "transport",
  "activity",
  "shopping",
  "etc",
];

export const sampleExpenses: Expense[] = [];
