# 제공 모델 사진 검수

가로 1200 고정, 정사각(1200×1200) / 와이드(1200×675) 2종으로 파생했습니다.

| 소스 | 내용 | 파생 | AI 글자 왜곡 (상용 사용 전 수정 필요) |
|---|---|---|---|
| Gemini_Generated_Image_2a8gjw2a8gjw2a8g.png | 시트마스크 착용 + 알로에/아보카도 트레이, 창가 | model-1-sq / model-1-wide | 우하단 마스크 패키지의 영문/한글 일부 왜곡 |
| Gemini_Generated_Image_2a8gjw2a8gjw2a8g (1).png | 시트마스크 클로즈업 + 알로에 토너 2병 | model-2-sq / model-2-wide | 좌측 패키지 "ALOE SHEET MASK" 하단 문구 왜곡 |
| Gemini_Generated_Image_2a8gjw2a8gjw2a8g (2).png | 시트마스크 착용, 눈 감음, 열대 식물 배경 | model-3-sq / model-3-wide | 볼 위 워터마크가 "MLERL REPUBLIC" 으로 왜곡 |
| Gemini_Generated_Image_2a8gjw2a8gjw2a8g (3).png | 시트마스크 착용 + 마스크 시트 5종 팬 배치 | model-4-sq / model-4-wide | 패키지 문구 "COLD NUTTIONS FRESH EEL MASK" 및 한글 다수 왜곡 |

## 판단
- 정사각 크롭은 얼굴 중심이라 대부분의 왜곡 문구가 프레임 밖으로 빠집니다.
- `model-3` 은 볼 위 워터마크가 얼굴에 붙어 있어 크롭으로 제거되지 않습니다 — 리터칭 또는 재생성 필요.
- `model-4` 는 패키지 문구가 피사체의 절반을 차지하므로 상용 페이지에는 권장하지 않습니다.