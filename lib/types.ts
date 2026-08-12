export type RoomStatus = "saving" | "traveling" | "settling" | "completed";

export interface Member {
  id: string;
  userId?: string;
  name: string;
  avatarUrl: string;
  isOwner?: boolean;
  personalGoal: number;
  personalSaved: number;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  payerId: string;
  splitBetweenIds: string[];
  date: string; // ISO
  category: ExpenseCategory;
  place?: string;
}

export type ExpenseCategory =
  | "food"
  | "lodging"
  | "transport"
  | "activity"
  | "shopping"
  | "etc";

export interface Room {
  id: string;
  title: string;
  destination: string;
  startDate: string; // ISO
  endDate: string; // ISO
  useSaving: boolean;
  goalAmount: number;
  totalSaved: number;
  expectedPeople: number;
  status: RoomStatus;
  members: Member[];
  expenses: Expense[];
  inviteToken: string;
}

export interface SettlementRow {
  memberId: string;
  paid: number;
  burden: number;
  diff: number; // positive = receives, negative = owes
}

export interface Transfer {
  fromId: string;
  toId: string;
  amount: number;
}
