🧩 M3 — 학교/전형/일정 데이터 자동 수집 (Admissions Layer)
WP3.1 — 크롤러 기본 스크립트 (학교 리스트 1개 성공)

Python + Playwright로 “한 학교” 크롤링 성공

→ 자동 수집 기술 검증

WP3.2 — 전형/일정 구조 설계 + DB 반영

schools/admissions/schedules V1 DB

→ BE에서 전형 데이터 조회 가능

WP3.3 — 관리자 승인 화면(Admin)

수집한 데이터 표시 + Publish 버튼

→ 승인된 데이터만 학생/부모에게 노출

WP3.4 — 학교 상세 페이지 FE

전형요소/일정 표시

→ 사용자가 "학교 정보 페이지"를 볼 수 있음

WP3.5 — 학교 홈페이지 바로가기 링크

학교 데이터에 website URL 필드 저장

목표 학교 목록에서 홈페이지 링크 아이콘 표시

클릭 시 새 탭에서 학교 공식 홈페이지 열림

→ 학생이 직접 학교 홈페이지를 방문하여 상세 정보 확인 가능

WP3.6 — 전국 학교 데이터 확장

**중학교 데이터베이스 확장**
- 서울/인천 기본 데이터 → 전국 9개 지역 341개 중학교로 확장
- 경기(76개), 부산(31개), 대구(24개), 광주(20개), 대전(18개), 울산(13개), 세종(9개) 추가
- 각 학교별 홈페이지 URL 포함

**고등학교 데이터 확장**
- 기존 수도권 특목고 → 전국 92개 특목고/자사고로 확장
- SchoolType enum 세분화: SCIENCE(과학고), FOREIGN_LANGUAGE(외국어고), INTERNATIONAL(국제고), ARTS(예술고), SPORTS(체육고), AUTONOMOUS_PRIVATE(자사고)

**2025학년도 입시 일정 추가**
- 주요 특목고/자사고 109개 입시 일정 데이터
- ScheduleType enum 확장: INFO_SESSION, APPLICATION, DOCUMENT_SCREENING, EXAM, INTERVIEW, RESULT_ANNOUNCEMENT, REGISTRATION

→ 전국 단위 서비스 제공 기반 마련

WP3.7 — 실제 크롤링 시스템 구현

**Puppeteer 기반 학교 홈페이지 크롤링**
- 학교별 입시 페이지 자동 탐색 (URL 패턴 분석)
- 입시 관련 키워드 기반 콘텐츠 추출
- 날짜 패턴 인식을 통한 일정 정보 추출
- 전형 요소 및 제출 서류 정보 파싱
- 서버 부하 방지를 위한 요청 간격 제어 (2초)

**크롤링 관리 API**
- POST /real/school/:schoolId — 단일 학교 크롤링
- POST /real/schools — 다중 학교 일괄 크롤링
- POST /real/type/:type — 학교 유형별 크롤링
- GET /real/available-schools — 크롤링 가능 학교 조회
- GET /real/crawl-history — 크롤링 히스토리 조회

**관리자 크롤링 UI (프론트엔드)**
- 실제 크롤링 탭 추가
- 학교 유형별 일괄 크롤링 버튼
- 개별 학교 체크박스 선택 및 크롤링
- 크롤링 결과 요약 (성공/실패/수집 일정 수)
- 최근 수집 일정 히스토리 테이블

→ 실제 학교 홈페이지에서 입시 정보 자동 수집 가능