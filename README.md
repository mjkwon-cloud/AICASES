# 글로벌팀 업무 자동화 사례 — 발표 뷰어

## 실행

```bash
python build.py            # courses/*.json → index.html 생성
python -m http.server 8000 # http://localhost:8000
```

파일 열기/다운로드는 `file://`로 직접 열면 동작하지 않습니다. 반드시 위처럼
로컬 서버로 띄우거나 GitHub Pages에 올린 뒤 확인하세요.

## 구성

```
courses/_order.json         ["cases"] — 코스가 1개라 상단 탭은 자동 숨김
courses/cases/_meta.json    사이드바 배지·제목
courses/cases/step00.json   인트로  기대효과            (1장)
courses/cases/step01.json   사례 1  MSRP 검수    (2장)
courses/cases/step02.json   사례 2  상세페이지 제작   (3장)
courses/cases/step03.json   사례 3  랜딩페이지 제작   (1장)
assets/cases/stepNN/        슬라이드 이미지
assets/cases/stepNN/files/  각 사례 산출물 (우측 상단 박스에서 열림)
```

## 사례 추가하는 법

1. `courses/cases/step04.json` 생성 (`step`은 4로)
2. `assets/cases/step04/` 폴더에 이미지 넣기
3. 산출물은 `assets/cases/step04/files/` 에 넣기
4. `python build.py`

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
- 주소창 `#cases/2/3` = 사례 2의 3번째 장 (특정 장면 바로 공유 가능)

## 주의

`detail_page_final.pdf` 14.5MB, `nature_republic_landing.html` 23.8MB 입니다.
GitHub 단일 파일 제한(100MB)에는 걸리지 않지만 레포가 무거워지므로, 랜딩페이지는
이미지를 외부 링크로 빼거나 별도 Pages로 올려 `type:"link"` 로 연결하는 편이 가볍습니다.
