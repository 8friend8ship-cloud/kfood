# OpenAI Project Control

- Repository: `8friend8ship-cloud/kfood`
- Actual package: `k-kitchen`
- Project role: **K-food/K-Kitchen AI 서비스 앱**
- Management status: `FEATURE_AUDIT_REQUIRED`
- Last reviewed: `2026-07-30 KST`
- Architecture: React/Vite + Gemini + Firebase

## 1. 활용 방향

이 저장소는 K-food 관련 사용자 경험, 콘텐츠, 추천 또는 데이터 기능을 제공하는 앱으로 관리한다. 정확한 기능 범위는 컴포넌트·Firebase 스키마·Gemini 프롬프트를 검토해 확정한다.

## 2. 상호 연계

- 기준 콘텐츠: `DRYWRITE`
- 시장·검색·성과 분석: `Analyzer-12.09`
- 영상·쇼츠 제작: `-`, `animation`
- 사용자/콘텐츠 데이터: Firebase 및 중앙 Drive 별칭
- 플랫폼 발행: 콘텐츠·발행 에이전트

## 3. Drive 연계 정책

- `MASTER_REGISTRY`
- `KFOOD_CONTENT_DB`
- `KFOOD_ASSET_FOLDER`
- `KFOOD_PRODUCT_REGISTRY`
- `KFOOD_PUBLISH_QUEUE`
- `CONTENT_OS_YOUTUBE_DATA`

실제 Drive URL/ID와 Firebase Secret은 공개 저장소에 넣지 않는다.

## 4. 파일 꼬리표

- `[KFOOD_CORE]`: K-food 핵심 기능
- `[CONTENT]`: 레시피·문화·설명 콘텐츠
- `[PRODUCT]`: 상품·식재료·제휴
- `[FRONTEND]`: 사용자 화면
- `[AI]`: Gemini 생성·추천
- `[FIREBASE]`: 데이터·인증·저장
- `[DRIVE]`: 콘텐츠·이미지·발행 큐
- `[I18N]`: 다국어/글로벌
- `[SECRET]`: 키·Firebase 설정
- `[REVIEW]`: 실제 기능 범위 확인 필요

## 5. 초기 파일 대장

| 파일/영역 | 태그 | 활용 방향 | 상태 | 다음 점검 |
|---|---|---|---|---|
| `package.json` | `[AI] [FIREBASE] [DEPLOY]` | Gemini·Firebase 앱 환경 | 확인됨 | 무료 한도·버전·빌드 점검 |
| `App.tsx`/화면 | `[FRONTEND] [KFOOD_CORE]` | 사용자 경험과 기능 진입점 | 검토 예정 | 실제 핵심 기능 분류 |
| Gemini 서비스 | `[AI] [SECRET]` | 콘텐츠/추천 생성 | 우선 검토 | 프롬프트·근거·비용·키 노출 확인 |
| Firebase 영역 | `[FIREBASE] [SECRET]` | 데이터 저장/동기화 | 우선 검토 | 컬렉션·보안규칙·기준 원본 확인 |
| 콘텐츠/상품 데이터 | `[CONTENT] [PRODUCT]` | 서비스 핵심 데이터 | 검토 예정 | Drive·Firebase 역할 분리 |
| 다국어/발행 | `[I18N] [DRIVE]` | 글로벌 콘텐츠 송출 | 검토 예정 | 대상 국가·언어·플랫폼 확인 |

## 6. 수정 진행 규칙

1. 실제 기능과 데이터 스키마를 확인한 뒤 역할을 확정한다.
2. Firebase와 Drive 중 어떤 곳이 기준 원본인지 데이터별로 기록한다.
3. 음식·건강 정보는 근거 없는 효능을 단정하지 않는다.
4. 상품/제휴 연결은 광고·추천 표시와 중앙 등록을 거친다.
5. 키·Firebase Admin 정보는 커밋하지 않는다.
6. 코드 변경은 작업 브랜치와 Draft PR로 진행한다.

## 7. 결정 기록

- `2026-07-30`: K-Kitchen AI/Firebase 앱으로 분류하고 상세 기능·데이터 감사를 시작함.
