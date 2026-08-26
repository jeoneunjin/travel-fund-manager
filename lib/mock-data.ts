import type { Expense, ExpenseCategory, Room } from "./types";

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

export const expenseCategories: ExpenseCategory[] = [
  "food",
  "lodging",
  "transport",
  "activity",
  "shopping",
  "etc",
];

export const sampleExpenses: Expense[] = [];
