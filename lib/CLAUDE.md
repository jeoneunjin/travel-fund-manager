# Travel Fund Manager

여행 자금 관리 협업 서비스 — 방(Room) 생성 → 초대 → 여행 전 모으기 →
여행 중 지출 기록 → 여행 후 n분의 1 정산까지 처리하는 Next.js 풀스택 프로젝트.

## Tech Stack

- Next.js 16 (App Router)
- TypeScript (strict mode)
- Tailwind CSS + shadcn/ui
- Prisma 7 (driver adapter 방식 — 아래 "Prisma 7 주의사항" 필독)
- Neon (PostgreSQL, ap-southeast-1 리전)
- TanStack Query (서버 상태), Zustand (클라이언트 상태)
- Zod (+ react-hook-form) — 폼 검증
- Auth.js (NextAuth) — 인증 (예정)

## Domain Model

- Room — 여행 방 (제목, 일정, 목표금액, 초대코드, status: SAVING/TRAVELING/SETTLING/COMPLETED)
- RoomMember — User ↔ Room 다대다, personalGoal/personalSaved 보유
- Expense / ExpenseShare — 지출과 정산 대상 멤버(다대다)
- 정산 로직: `lib/db/room.ts`의 `computeSettlement` — net balance 계산 후
  그리디 매칭으로 최소 송금 내역 산출. 이 함수는 순수 함수라 데이터 출처(mock/DB)와 무관하게 재사용됨

## Prisma 7 주의사항 (반드시 확인)

- `schema.prisma`의 `datasource` 블록에는 `provider`만 쓰고, `url`/`directUrl`은
  절대 넣지 않는다 — Prisma 7부터 제거됨. 연결 정보는 `prisma.config.ts`에서 관리
- `PrismaClient`는 `new PrismaClient()` 단독으로 생성 불가.
  반드시 driver adapter(`@prisma/adapter-pg`)를 만들어 주입해야 함 (`lib/prisma.ts` 참고)
- `generator client`의 output이 `../lib/generated/prisma`로 커스텀 지정되어 있음
  → import는 `@prisma/client`가 아니라 `@/lib/generated/prisma/client`에서
- `.env`와 `.env.local`은 다른 파일. `prisma.config.ts`의 `dotenv/config`는
  `.env`만 읽으므로 두 파일에 DB 연결값을 동일하게 유지할 것

## Rules

- `any` 사용 금지, TypeScript strict mode 유지
- Tailwind 클래스만 사용, inline style 금지
- Server Component 우선, Client Component는 상태/이벤트 핸들링이 꼭 필요할 때만
- 컴포넌트 200줄 이하 유지, 함수는 작게 분리
- Prisma 응답 타입은 손으로 인터페이스 작성하지 말고 `Prisma.XxxGetPayload` 유틸리티 타입 사용
- 정산/계산 관련 순수 함수(`lib/db/*.ts`)는 UI 로직과 분리 유지

## Naming

- Component: PascalCase
- Hook: useXXX
- Constant: UPPER_SNAKE_CASE
- API route: `app/api/{resource}/route.ts`

## Commands

- `npm run dev`
- `npm run lint`
- `npx tsc --noEmit`
- `npx prisma migrate dev --name <name>`
- `npx prisma db seed`
- `npx prisma studio`