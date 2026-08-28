// prisma/seed.ts
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const avatar = (seed: string) =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;

async function main() {
  // 시드 유저 전원 공용 테스트 비밀번호. 로그인 테스트용으로만 사용.
  const testPasswordHash = await bcrypt.hash("password123", 10);

  // 재실행 가능하도록 기존 데이터 정리 (관계 있는 순서 역순으로 삭제)
  await prisma.expenseShare.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.roomMember.deleteMany();
  await prisma.roomInvite.deleteMany();
  await prisma.room.deleteMany();
  await prisma.user.deleteMany();

  // ---------- 오키나와 ----------
  const okinawaUsers = await Promise.all(
    [
      { name: "김여행", seed: "kim" },
      { name: "박바다", seed: "park" },
      { name: "이산", seed: "lee" },
      { name: "정하늘", seed: "jung" },
    ].map((u) =>
      prisma.user.create({
        data: { email: `${u.seed}@example.com`, name: u.name, avatarUrl: avatar(u.seed), passwordHash: testPasswordHash },
      })
    )
  );

  const okinawa = await prisma.room.create({
    data: {
      title: "오키나와 4박 5일",
      destination: "오키나와",
      startDate: new Date("2026-05-01"),
      endDate: new Date("2026-05-05"),
      goalAmount: 3000000,
      expectedPeople: 4,
      status: "SAVING",
      inviteToken: "okinawa-x7f2",
      members: {
        create: [
          { userId: okinawaUsers[0].id, isOwner: true, personalGoal: 800000, personalSaved: 640000 },
          { userId: okinawaUsers[1].id, personalGoal: 750000, personalSaved: 520000 },
          { userId: okinawaUsers[2].id, personalGoal: 750000, personalSaved: 360000 },
          { userId: okinawaUsers[3].id, personalGoal: 700000, personalSaved: 280000 },
        ],
      },
    },
    include: { members: true },
  });
  const [ok1, ok2, ok3, ok4] = okinawa.members;

  const okinawaExpenses: Array<{
    title: string; amount: number; payerId: string; splitIds: string[];
    date: string; category: string; place: string;
  }> = [
    { title: "나하 공항 택시", amount: 8200, payerId: ok1.id, splitIds: [ok1.id, ok2.id, ok3.id, ok4.id], date: "2026-05-01", category: "TRANSPORT", place: "나하 공항" },
    { title: "이호 비치 호텔 1박", amount: 120000, payerId: ok2.id, splitIds: [ok1.id, ok2.id, ok3.id, ok4.id], date: "2026-05-01", category: "LODGING", place: "이호 비치" },
    { title: "아침 식사", amount: 15600, payerId: ok3.id, splitIds: [ok1.id, ok2.id, ok3.id], date: "2026-05-02", category: "FOOD", place: "국제거리 카페" },
    { title: "푸른 동굴 스노클링", amount: 44000, payerId: ok4.id, splitIds: [ok1.id, ok2.id, ok3.id, ok4.id], date: "2026-05-02", category: "ACTIVITY", place: "자키비치" },
    { title: "마키 공수애 쇼핑", amount: 32000, payerId: ok1.id, splitIds: [ok1.id, ok2.id], date: "2026-05-03", category: "SHOPPING", place: "마키 공수애" },
    { title: "저녁 이자카야", amount: 58000, payerId: ok2.id, splitIds: [ok1.id, ok2.id, ok3.id, ok4.id], date: "2026-05-03", category: "FOOD", place: "국제거리 이자카야" },
    { title: "렌터카 2일치", amount: 9600, payerId: ok3.id, splitIds: [ok1.id, ok2.id, ok3.id, ok4.id], date: "2026-05-03", category: "TRANSPORT", place: "오키나와 렌터카" },
    { title: "호텔 2박", amount: 120000, payerId: ok2.id, splitIds: [ok1.id, ok2.id, ok3.id, ok4.id], date: "2026-05-03", category: "LODGING", place: "이호 비치" },
  ];

  for (const e of okinawaExpenses) {
    await prisma.expense.create({
      data: {
        roomId: okinawa.id,
        title: e.title,
        amount: e.amount,
        place: e.place,
        category: e.category as never,
        date: new Date(e.date),
        payerId: e.payerId,
        shares: { create: e.splitIds.map((memberId) => ({ memberId })) },
      },
    });
  }

  // ---------- 삿포로 ----------
  const sapporoUsers = await Promise.all(
    [
      { name: "한겨울", seed: "han" },
      { name: "윤눈", seed: "yun" },
      { name: "최슬로프", seed: "choi" },
    ].map((u) =>
      prisma.user.create({
        data: { email: `${u.seed}@example.com`, name: u.name, avatarUrl: avatar(u.seed), passwordHash: testPasswordHash },
      })
    )
  );

  const sapporo = await prisma.room.create({
    data: {
      title: "삿포로 겨울 여행",
      destination: "삿포로",
      startDate: new Date("2026-12-20"),
      endDate: new Date("2026-12-25"),
      goalAmount: 2500000,
      expectedPeople: 3,
      status: "TRAVELING",
      inviteToken: "sapporo-k3p9",
      members: {
        create: [
          { userId: sapporoUsers[0].id, isOwner: true, personalGoal: 900000, personalSaved: 900000 },
          { userId: sapporoUsers[1].id, personalGoal: 800000, personalSaved: 800000 },
          { userId: sapporoUsers[2].id, personalGoal: 800000, personalSaved: 800000 },
        ],
      },
    },
    include: { members: true },
  });
  const [sp1, sp2, sp3] = sapporo.members;

  const sapporoExpenses = [
    { title: "신치토세 공항 버스", amount: 12000, payerId: sp1.id, splitIds: [sp1.id, sp2.id, sp3.id], date: "2026-12-20", category: "TRANSPORT", place: "신치토세 공항" },
    { title: "스키 리프트 1일권", amount: 33000, payerId: sp2.id, splitIds: [sp1.id, sp2.id, sp3.id], date: "2026-12-21", category: "ACTIVITY", place: "니세코" },
    { title: "라멘 저녁", amount: 9800, payerId: sp3.id, splitIds: [sp1.id, sp2.id, sp3.id], date: "2026-12-21", category: "FOOD", place: "스스키노 라멘" },
  ];

  for (const e of sapporoExpenses) {
    await prisma.expense.create({
      data: {
        roomId: sapporo.id,
        title: e.title,
        amount: e.amount,
        place: e.place,
        category: e.category as never,
        date: new Date(e.date),
        payerId: e.payerId,
        shares: { create: e.splitIds.map((memberId) => ({ memberId })) },
      },
    });
  }

  // ---------- 제주 ----------
  const jejuUsers = await Promise.all(
    [
      { name: "강바람", seed: "kang" },
      { name: "임돌하", seed: "lim" },
    ].map((u) =>
      prisma.user.create({
        data: { email: `${u.seed}@example.com`, name: u.name, avatarUrl: avatar(u.seed), passwordHash: testPasswordHash },
      })
    )
  );

  const jeju = await prisma.room.create({
    data: {
      title: "제주 여름 힐링",
      destination: "제주도",
      startDate: new Date("2026-07-10"),
      endDate: new Date("2026-07-13"),
      goalAmount: 1500000,
      expectedPeople: 2,
      status: "SETTLING",
      inviteToken: "jeju-m8q1",
      members: {
        create: [
          { userId: jejuUsers[0].id, isOwner: true, personalGoal: 800000, personalSaved: 800000 },
          { userId: jejuUsers[1].id, personalGoal: 700000, personalSaved: 700000 },
        ],
      },
    },
    include: { members: true },
  });
  const [jj1, jj2] = jeju.members;

  const jejuExpenses = [
    { title: "제주공항 렌터카", amount: 58000, payerId: jj1.id, splitIds: [jj1.id, jj2.id], date: "2026-07-10", category: "TRANSPORT", place: "제주공항" },
    { title: "해변 게스트하우스", amount: 120000, payerId: jj2.id, splitIds: [jj1.id, jj2.id], date: "2026-07-10", category: "LODGING", place: "함덕해변" },
    { title: "흑돼지 바비큐", amount: 42000, payerId: jj1.id, splitIds: [jj1.id, jj2.id], date: "2026-07-11", category: "FOOD", place: "성읍민속마을" },
    { title: "우도 자전거 대여", amount: 9000, payerId: jj2.id, splitIds: [jj1.id, jj2.id], date: "2026-07-12", category: "ACTIVITY", place: "우도" },
  ];

  for (const e of jejuExpenses) {
    await prisma.expense.create({
      data: {
        roomId: jeju.id,
        title: e.title,
        amount: e.amount,
        place: e.place,
        category: e.category as never,
        date: new Date(e.date),
        payerId: e.payerId,
        shares: { create: e.splitIds.map((memberId) => ({ memberId })) },
      },
    });
  }

  console.log("Seed 완료!");
  console.log("- 오키나와:", okinawa.id);
  console.log("- 삿포로:", sapporo.id);
  console.log("- 제주:", jeju.id);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });