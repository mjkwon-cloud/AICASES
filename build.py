#!/usr/bin/env python3
"""
build.py — 강의 뷰어 빌더

viewer.template.html 의 //__COURSES__ 마커를 courses/**/*.json 에서 만든
`const COURSES = {...}` 로 치환해 index.html 을 생성한다.

index.html 은 순수 산출물이므로 git 에서 추적하지 않는다(.gitignore).
GitHub Actions 가 push 시 재생성해서 Pages 로 배포한다.

부가 작업:
  - action.type == "download-folder" 로 참조된 폴더를 자동으로 .zip 압축

사용법:
  python build.py            # index.html 생성
  python build.py --dry-run  # 생성 없이 데이터만 검증/출력
"""

import json
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).parent
COURSES_DIR = ROOT / "courses"
TEMPLATE = ROOT / "viewer.template.html"
OUTPUT = ROOT / "index.html"
MARKER = "        //__COURSES__"   # 정확히 8칸 들여쓰기

REQUIRED_META = ("tabLabel", "badgeClass", "badgeText", "title")


def load_order():
    order_file = COURSES_DIR / "_order.json"
    if order_file.exists():
        return json.loads(order_file.read_text(encoding="utf-8"))
    # _order.json 이 없으면 폴더명 알파벳순
    return sorted(p.name for p in COURSES_DIR.iterdir() if p.is_dir())


def load_course(key):
    course_dir = COURSES_DIR / key
    meta_file = course_dir / "_meta.json"
    if not meta_file.exists():
        raise SystemExit(f"[error] {meta_file} 없음")

    meta = json.loads(meta_file.read_text(encoding="utf-8"))
    missing = [k for k in REQUIRED_META if k not in meta]
    if missing:
        raise SystemExit(f"[error] {meta_file}: 필수 키 누락 {missing}")

    sessions = []
    for step_file in sorted(course_dir.glob("step*.json")):
        data = json.loads(step_file.read_text(encoding="utf-8"))
        for k in ("step", "title"):
            if k not in data:
                raise SystemExit(f"[error] {step_file}: '{k}' 키 필요")
        data.setdefault("hours", "")
        data.setdefault("slides", [])
        sessions.append(data)

    if not sessions:
        raise SystemExit(f"[error] {course_dir}: step*.json 파일이 없음")

    meta["sessions"] = sorted(sessions, key=lambda s: s["step"])
    return meta


def zip_download_folders(courses):
    """action.type == 'download-folder' 로 참조된 폴더를 .zip 으로 압축한다."""
    made = 0
    for course in courses.values():
        for session in course["sessions"]:
            for slide in session["slides"]:
                act = slide.get("action") or {}
                if act.get("type") != "download-folder" or not act.get("path"):
                    continue
                src = ROOT / act["path"]
                if not src.is_dir():
                    print(f"  ! 폴더 없음, zip 건너뜀: {act['path']}")
                    continue
                shutil.make_archive(str(src), "zip", root_dir=src)
                print(f"  + {act['path']}.zip")
                made += 1
    return made


def main():
    dry_run = "--dry-run" in sys.argv

    print("courses/ 읽는 중...")
    courses = {key: load_course(key) for key in load_order()}
    for key, c in courses.items():
        n_slides = sum(len(s["slides"]) for s in c["sessions"])
        print(f"  {key}: {len(c['sessions'])}회차 / 슬라이드 {n_slides}장")

    payload = "        const COURSES = " + json.dumps(
        courses, ensure_ascii=False, indent=2
    ).replace("\n", "\n        ") + ";"

    if dry_run:
        print("\n--- dry-run: 검증 통과 ---")
        print(payload[:800] + ("\n..." if len(payload) > 800 else ""))
        return

    print("download-folder zip 처리...")
    zip_download_folders(courses)

    if not TEMPLATE.exists():
        raise SystemExit(f"[error] 템플릿 없음: {TEMPLATE}")
    lines = TEMPLATE.read_text(encoding="utf-8").split("\n")
    hits = [i for i, l in enumerate(lines) if l == MARKER]
    if len(hits) != 1:
        raise SystemExit(
            f"[error] 마커 {MARKER!r} 가 정확히 1개여야 하는데 {len(hits)}개 발견"
        )

    i = hits[0]
    out = "\n".join(lines[:i] + payload.split("\n") + lines[i + 1:])
    OUTPUT.write_text(out, encoding="utf-8")
    print(f"완료 → {OUTPUT} ({len(out):,} bytes)")


if __name__ == "__main__":
    main()
