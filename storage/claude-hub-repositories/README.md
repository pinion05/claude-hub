# Claude Hub 레포지토리 데이터

Notion "📊 Claude Hub 전체 레포지토리 상세 조사 보고서 (2025.08.09)" 페이지에서 추출한 레포지토리 정보입니다.

## 📁 파일 구조

```
claude-hub-repositories/
├── README.md                     # 이 파일
├── all-repositories.json         # 전체 레포지토리 상세 정보
├── top-repositories.json         # Top 10 인기 레포지토리
├── categories.json               # 카테고리 정보
└── repositories-by-category.json # 카테고리별 레포지토리 분류
```

## 📊 데이터 스키마

### all-repositories.json
- **name**: 레포지토리 이름 (owner/repo)
- **github_url**: GitHub URL
- **stars**: GitHub 스타 수
- **description**: 프로젝트 설명
- **last_updated**: 마지막 업데이트 날짜
- **version**: 버전 정보 (있는 경우)
- **category**: 카테고리 ID
- **tags**: 태그 배열

### 카테고리
1. **ide-integration**: IDE 통합 도구
2. **agents-orchestration**: 에이전트 & 오케스트레이션
3. **monitoring-analytics**: 모니터링 & 분석
4. **proxy-routing**: 프록시 & 라우팅
5. **resources-guides**: 리소스 & 가이드
6. **gui-desktop**: GUI & 데스크톱
7. **integration-extension**: 통합 & 확장
8. **advanced-features**: 고급 기능
9. **utilities**: 유틸리티

## 📈 통계
- **총 레포지토리 수**: 43개
- **카테고리 수**: 9개
- **Top 10 총 스타 수**: 160,400개
- **데이터 수집일**: 2025년 8월 9일

## 🔄 업데이트
이 데이터는 2025년 8월 9일 Notion 페이지 기준으로 작성되었습니다.