---
name: commit
description: "Git 변경사항을 논리적 단위로 나눠 Conventional Commit 형식으로 커밋한다. lint/typecheck 통과를 먼저 확인하고, 실패하면 커밋하지 않는다. push는 하지 않음. 사이드이펙트가 있는 워크플로우라 사용자가 /commit으로 직접 호출할 때만 실행한다."
argument-hint: "[--dry-run] [작업 맥락, 예: 인증 API 구현]"
disable-model-invocation: true
allowed-tools: Bash, Read, Grep, Glob
---

# /commit

git 변경사항을 확인하고, lint/typecheck를 통과한 경우에만 논리적 단위로 나눠 Conventional Commit 형식으로 커밋한다. push는 하지 않는다.

인자: $ARGUMENTS

### 인자 파싱

- `$ARGUMENTS`에 `--dry-run` 토큰이 있으면 dry-run 모드다. 이 토큰을 제외한 나머지를 아래 "작업 맥락"으로 쓴다.
- `--dry-run`이 없으면 `$ARGUMENTS` 전체가 작업 맥락이다.
- 작업 맥락에서 스코프로 쓸만한 짧은 영문 키워드가 뽑히면(예: "인증 API 구현" → `auth`, "정산 화면 수정" → `settlement`) 커밋 메시지 스코프 후보로 기억해둔다. 뽑기 애매하면 스코프 없이 진행한다.

## 절차

### 1. 변경사항 요약 파악

```
git status --short
git diff --stat
```

이 두 명령의 결과만으로 어떤 파일이 얼마나 바뀌었는지 먼저 파악한다. 전체 `git diff`를 처음부터 읽지 않는다.

변경 목적이 하나인지 여러 개인지(예: 스키마 변경 / API 구현 / 화면 수정이 섞여 있는지) `git status --short`의 파일 경로와 `git diff --stat`의 변경 규모만으로 판단이 애매한 파일이 있을 때만, 그 파일에 한해 `git diff <path>`로 좁혀서 확인한다.

### 2. lint / typecheck 확인

```
npm run lint
npx tsc --noEmit
```

- 둘 다 통과하면: 통과했다는 사실만 남기고 stdout 전체 내용은 컨텍스트에 남기지 않는다.
- 하나라도 실패하면: **커밋하지 않는다.** 전체 출력을 그대로 붙여넣지 말고, 에러 라인과 그 주변 맥락만 좁혀서 추출해 보여준 뒤 중단한다:

  ```
  npm run lint 2>&1 | grep -i -B 2 -A 2 "error"
  npx tsc --noEmit 2>&1 | grep -i -A 2 "error"
  ```

  grep 결과가 비어 있으면(에러 메시지 형식이 달라 못 걸렀을 때) 원본 출력의 마지막 30줄 정도만 보여준다.

### 3. 커밋 단위 나누기

`git status --short`의 파일 목록을 스키마/API/화면 등 목적별로 분류한다.

- 서로 다른 목적이 섞여 있으면 → 목적별로 여러 개의 논리적 커밋으로 나눠 순서대로 커밋한다.
  - 스테이징은 반드시 `git add <path1> <path2> ...` 처럼 파일을 직접 지정한다. `git add -p`, `git add -i` 같은 대화형 방식은 사용하지 않는다.
- 하나의 목적이면 → 커밋 하나로 전체를 스테이징하고 커밋한다.

### 4. 커밋 메시지 작성

- 기본적으로 `git diff --stat`과 파일 경로만으로 변경 목적을 추론해서 작성한다.
- 파일 경로/변경 규모만으로 목적이 불분명할 때만 해당 파일을 최소로 `Read`해서 확인한다. 이미 컨텍스트에 있지 않은 한 전체 파일을 다시 읽지 않는다.
- Conventional Commit 형식을 사용한다: 스코프 후보가 있으면 `<type>(<scope>): <설명>`, 없으면 `<type>: <설명>`.
  - `<type>`은 `feat:`, `fix:`, `refactor:`, `chore:`, `docs:` 등 변경 내용에 맞게 고른다.
  - `<scope>`는 "인자 파싱" 단계에서 뽑은 키워드를 쓴다. 여러 커밋으로 나뉘어도 같은 작업 맥락에서 나온 커밋이면 동일한 스코프를 재사용한다. 커밋마다 실제로 건드린 영역과 스코프가 어긋나면(예: 맥락은 "인증"인데 이 커밋은 gitignore만 건드림) 억지로 붙이지 말고 생략한다.
  - `<설명>`은 diff/파일 경로 기반 추론 내용이다. 작업 맥락 문자열을 그대로 설명으로 복사하지 않는다.

### 5. 커밋 실행 (dry-run이 아닐 때)

각 논리적 단위마다:

```
git add <해당 파일들>
git commit -m "<type>(<scope>): <메시지>"
```

커밋 후 `git status --short`로 남은 변경사항이 없는지 확인한다.

**push는 하지 않는다. 커밋까지만 수행한다.**

### 5-dry. dry-run일 때

`git add`/`git commit`을 실행하지 않는다. 대신 3~4단계에서 정리한 커밋 계획을 아래 형식으로 사용자에게 보여주고 종료한다:

```
[1/N] <type>(<scope>): <메시지>
  파일: <path1>, <path2>, ...

[2/N] ...
```
