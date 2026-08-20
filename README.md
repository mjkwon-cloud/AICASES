# 글로벌팀 업무 자동화 사례 — 발표 뷰어

## 실행

```bash
python build.py            # courses/*.json → index.html 생성
node build.js               # python 없는 환경용 동일 빌더
python -m http.server 8000 # http://localhost:8000
```

파일 열기/다운로드는 `file://`로 직접 열면 동작하지 않습니다. 반드시 위처럼
로컬 서버로 띄우거나 GitHub Pages에 올린 뒤 확인하세요.

## 구성

상단에 개요/비용절감/매출확대 3개 탭(코스)이 있다.

```
courses/_order.json          ["overview","cost","revenue"] — 탭 순서
courses/overview/_meta.json  탭: 개요
courses/overview/step01~02   목차, 배경
courses/cost/_meta.json      탭: 비용절감
courses/cost/step01~04       타임라인 관리 · 슬랙 히스토리 파악 · MSRP 검수 · 성분 검수
courses/revenue/_meta.json   탭: 매출확대
courses/revenue/step01~07    거래처DB 관리 · 신규오더 관리 · 시장 조사 · 매출/채널 대시보드 ·
                             매출 집중 자료 · 맞춤형 영업자료 · 영업이익 확대 제안
assets/cases/stepNN/         슬라이드 이미지 (각 step.json 의 assetDir 로 연결)
assets/cases/stepNN/files/   각 사례 산출물 (우측 상단 박스에서 열림)
```

회차 번호(`step`)와 이미지 폴더는 분리돼 있다. `assetDir` 로 회차 번호와 무관하게
이미지 폴더를 지정한다 (회차 전체 또는 슬라이드 개별로 지정 가능, 개별이 우선).

각 슬라이드 상단 요약(`summary`)은 `label` 값으로 스타일이 자동 결정된다:
`역할`(기본), `AS-IS`(기본), `TO-BE`(파란색 강조), `결과`(빨간색, 가장 강한 강조).

## 사례 추가하는 법

1. 해당 코스 폴더(`courses/cost/` 또는 `courses/revenue/` 등)에 `stepNN.json` 생성
2. `assets/cases/stepNN/` 폴더에 이미지 넣기 (다른 폴더를 쓰려면 `assetDir` 지정)
3. 산출물은 같은 폴더의 `files/` 에 넣기
4. `python build.py` 또는 `node build.js`

## 우측 상단 박스 (산출물 열기)

| 용도 | JSON |
|---|---|
| 파일 다운로드 (xlsx·pptx 등) | `{"label":"산출물","type":"download","path":"assets/…","text":"표시명"}` |
| 브라우저에서 열기 (pdf·html·md) | `{"label":"산출물","items":[{"desc":"완성본","link":{"href":"assets/…","text":"표시명"}}]}` |
| 프롬프트 클릭 복사 | `{"label":"실행 프롬프트","copy":"…"}` |
| 위 조합 | `label` + `items` + `copy` 를 한 action 안에 함께 넣으면 세로로 쌓임 |

## 발표 조작

- `←` `→` 슬라이드 이동 (사례 경계에서 다음 사례로 자동 이동)
- 좌측 사례 클릭 시 해당 사례 첫 장으로
- 이미지 우측 하단 확대 버튼 → 전체화면, `Esc` 로 닫기
- 주소창 `#cost/3/1` = 비용절감 탭 3번째 사례의 1번째 장 (특정 장면 바로 공유 가능)

## 주의

일부 산출물 파일(`nature_republic_landing.html` 23.8MB, `globalteam_tracking_2026.xlsx` 47MB 등)이
큽니다. GitHub 단일 파일 제한(100MB)에는 걸리지 않지만 레포가 무거워지므로, 필요하면
이미지를 외부 링크로 빼거나 별도 Pages로 올려 `type:"link"` 로 연결하는 편이 가볍습니다.
