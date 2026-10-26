# 전역 스킬 점검 및 pstack 인수인계

점검일: 2026-10-23 (한국 시간)

## 설치

- 사용자 지정 원본: https://github.com/cursor/plugins/tree/main/pstack
- 설치 위치: 이 프로젝트의 `.agents/skills/`. 기존 전역 스킬은 수정·삭제하지 않음.
- 공식 skill-installer로 설치. 초기 비교용 backnotprop 미러 설치본은 `.logs/pstack-mirror-backup/`으로 이동했으며 활성 설치는 공식판임.
- 다음 턴에서 새 스킬을 사용할 수 있음. 메뉴에 보이지 않으면 채팅을 다시 열어 확인.
- 설치와 모델 설정은 별개임. 공식 setup-pstack의 Cursor 모델·도구 기본값을 Codex에서 사용 가능하다고 가정하면 안 됨. 역할별 모델 설정은 아직 하지 않음.

## 전역 스킬 선별

2026-10-23 사용자 결정: 이 프로젝트는 pstack만 사용한다. 아래 유지·선택 사용 권고는 전역 환경에 대한 평가이며, 이 프로젝트에서는 루트 `AGENTS.md`의 pstack 전용 정책이 우선한다. 전역 스킬은 삭제하지 않았으며 이 프로젝트의 작업 흐름에서 제외한다.

파일 날짜만으로 오래되었다고 단정하지 않았으며, 아래는 실제 지침과 기능을 비교한 정리 후보임.

| 대상 | 판단 및 권장 처리 |
|---|---|
| `tdd`, `teach` | pstack과 동일 이름 충돌. pstack을 쓰는 이 프로젝트에서는 프로젝트 설치본을 명시해 사용. 전역판 삭제는 다른 프로젝트 영향이 있어 보류. |
| `implement`, `code-review`, `diagnosing-bugs`, `prototype` | poteto-mode의 구현·검토·버그·시제품 흐름과 겹침. 같은 작업에 두 흐름을 동시에 적용하지 않음. 각 스킬의 독립 사용 가치는 남음. |
| `grilling`, `grill-me`, `grill-with-docs` | 인터뷰 흐름 중복. 특히 grill-me는 grilling을 호출하는 호환 래퍼이므로 정리 우선 후보. grill-with-docs는 domain-modeling 결합 기능이 있음. |
| `handoff` | OS 임시 디렉터리 저장 지침이 현재 사용자의 프로젝트 내부 저장 원칙과 충돌. 이 프로젝트에서는 루트 HANDOFF.md를 유지. |
| `kanban`, `kanban-init`, 관련 흐름 | 사용자 홈의 SQLite 저장 및 Bash 명령을 전제로 함. 프로젝트 내부 저장 원칙 및 Windows 실행 방식 조정 없이는 이 프로젝트에 적용하지 않음. |
| `frontend-design`, `design-taste-frontend`, `impeccable`, `design-lab` | UI 설계 영역이 겹치지만 폐기된 것은 아님. 실제 UI 작업 목적에 맞춰 하나의 주 흐름 선택. |
| `ask-matt`, `setup-matt-pocock-skills`, `to-spec`, `to-tickets`, `triage`, `wayfinder` | 기존 Matt 워크플로 묶음. pstack 전환 시 주 흐름 중복 후보지만 다른 스킬의 의존성이 있으므로 개별 삭제보다 묶음 보존·선택 사용 권장. |
| `domain-modeling`, `codebase-design`, `research`, `resolving-merge-conflicts`, `writing-for-agents`, `inbm-control`, 기본/플러그인 스킬 | 보완 역할 또는 전용 기능. 유지 권장. |

## 현재 프로젝트 기준값

- 루트: `D:\codex\extension4youtube`, 브랜치 main, 받은 커밋 d595bf8.
- 독립 HTML 시안이며 package.json, lockfile, frontend/, backend/, harness/, .env.example, 루트 AGENTS.md는 없음.
- Node/pnpm/Python은 Codex 번들 런타임 사용 가능. 현재 앱에는 패키지 매니저가 필요 없으며 새 구성 시 pnpm을 기본으로 함.
- README 지정 프리뷰 포트 8765. 조회 시 해당 포트 리스너 없음. 이 작업에서 서버를 시작하지 않았으므로 PID·서버 로그 없음.
- PATH 변수는 한 개 확인. 전역 PATH 및 Git safe.directory 설정은 변경하지 않음.
- pnpm test / pnpm harness:check는 스크립트가 없어 실행 대상이 아님. 제품 코드 변경 없음.

## HANDOFF.md를 읽고 확인한 상태

- 실제 북마크 중복 제거 결과 1,387개 중 표본 10개로 만든 화면 검토 단계. 확장 manifest·동기화·영속 저장은 아직 없음.
- 시청중/시청완료/두고볼 것, 태그·별칭 검색이 시안에 작성됨. 상태는 예시이고 새로고침 시 초기화됨.
- 실제 브라우저 검수와 클릭 검증은 미완료이며 디자인 승인도 아직 없음.
- 다음 작업은 시안의 화면·검색 별칭·상태 변경 검증. 제품 사용 위치와 시청 상태 판정은 이후 결정.
- 전체 태깅과 Jev AI 및 유료 API 연동은 아직 시작하지 않음.
