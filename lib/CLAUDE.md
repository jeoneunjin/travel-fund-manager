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
- `app/rooms/[roomId]/**/page.tsx`는 `withRoom`(서버 전용, `auth()`+DB 조회)을
  호출하는 서버 컴포넌트로만 두고 `"use client"`를 붙이지 않는다. 상태(`useState` 등)나
  `useRouter`가 필요하면 `xxx-view.tsx`에 `"use client"` 컴포넌트로 분리해 `room`을
  prop으로 넘긴다 — `withRoom` 콜백 안에서 훅을 직접 호출하면 lint 에러가 남
- 컴포넌트 200줄 이하 유지, 함수는 작게 분리
- Prisma 응답 타입은 손으로 인터페이스 작성하지 말고 `Prisma.XxxGetPayload` 유틸리티 타입 사용
- 정산/계산 관련 순수 함수는 `lib/settlement.ts`에 두고 UI 로직과 분리 유지 —
  prisma를 불러오는 `lib/db/*.ts`에서 client component가 직접 import하면 안 됨
- 인증 관련 기능 추가 시 로그인뿐 아니라 로그아웃/세션 반영까지 세트로 체크

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

## Schema Change Protocol
schema.prisma를 수정했다면, 작업 요약 맨 앞(또는 완전히 별도 섹션)에
반드시 이렇게 표시할 것:

⚠️ 마이그레이션 필요: npx prisma migrate dev --name <name>

## Current Status

- 완료: 인증(로그인/로그아웃/세션 UI), 방 생성 API, 초대 참여 백엔드,
  mock-data.ts 의존 제거, 정산 순수 함수 lib/settlement.ts 분리,
  Next 13.5.1 → 16 업그레이드 (next-auth peer 요구사항 불일치로 Server
  Component에서 세션이 안 읽히던 버그의 근본 원인이었음). eslint 설정도
  eslint.config.mjs 플랫 컨피그로 전환, lint 스크립트는 `eslint .`
- 완료: 이메일 지정 초대(RoomInvite 모델) — 방장이 이메일로 초대한 사람만
  초대 링크로 참여 가능하도록 게이트. 발송은 자동화 안 하고 방장이 수동
  공유(카톡 등). 이메일은 항상 소문자로 정규화해서 저장/비교
  (`lib/db/room.ts`의 `normalizeEmail`) — `User.email`엔 정규화가 없으니
  대소문자 다르게 가입해도 매칭되는지 항상 확인할 것
- 다음 작업: 미정