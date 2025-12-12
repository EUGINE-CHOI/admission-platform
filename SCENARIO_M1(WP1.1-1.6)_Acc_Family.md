🔐 WP1.1 — 학생/학부모/컨설턴트 회원가입 & 로그인
Scenario WP1.1-1: 올바른 정보로 회원가입 성공

Given: 아직 회원가입되지 않은 이메일이 있다.

When: 학생이 유효한 이메일/비밀번호/역할(Student)로 회원가입 요청을 보낸다.

Then: 201 Created, 사용자 계정이 DB에 생성되고 “회원가입 완료” 응답이 반환된다.

선행 Scenario: 없음

Scenario WP1.1-2: 이미 존재하는 이메일로 회원가입 실패

Given: 동일 이메일로 이미 가입된 사용자가 있다.

When: 같은 이메일로 다시 회원가입 요청을 보낸다.

Then: 409 Conflict와 “이미 가입된 이메일” 에러 메시지가 반환된다.

선행 Scenario: WP1.1-1

Scenario WP1.1-3: 올바른 자격증명으로 로그인 성공

Given: 이메일/비밀번호가 등록된 학생 계정이 있다.

When: 해당 이메일/비밀번호로 로그인 요청을 보낸다.

Then: 200 OK와 함께 유효한 JWT 토큰 및 사용자 Role(Student)이 반환된다.

선행 Scenario: WP1.1-1

Scenario WP1.1-4: 잘못된 비밀번호로 로그인 실패

Given: 특정 이메일로 가입된 사용자가 있고, 비밀번호는 “P@ssw0rd”이다.

When: 이메일은 같고 비밀번호를 “WrongPass”로 로그인 요청한다.

Then: 401 Unauthorized와 “이메일 또는 비밀번호가 올바르지 않습니다” 메시지가 반환된다.

선행 Scenario: WP1.1-1

👨‍👩‍👧 WP1.3 — 가족 연결(Parent → Student 초대 코드)
Scenario WP1.3-1: 학부모가 자녀 초대 코드 생성

Given: 학부모 Role로 로그인한 사용자와 아직 연결되지 않은 자녀가 있다.

When: 학부모가 “자녀 초대 코드 생성” 버튼을 클릭한다.

Then: 고유한 초대 코드가 생성되어 화면에 표시되고, DB에 저장된다.

선행 Scenario: WP1.1-3

Scenario WP1.3-2: 학생이 유효한 초대 코드로 부모와 연결

Given: 학생 계정과 학부모 계정이 각각 존재하고, 학부모가 생성한 유효한 초대 코드가 있다.

When: 학생이 “초대 코드 입력” 화면에서 해당 코드를 입력한다.

Then: 가족 관계(family_id)가 생성/연결되고, 학부모 대시보드에서 자녀가 보인다.

선행 Scenario: WP1.3-1

Scenario WP1.3-3: 잘못된 초대 코드 입력 시 실패

Given: 어떤 학부모도 생성하지 않은 잘못된 코드 문자열이 있다.

When: 학생이 잘못된 초대 코드를 입력한다.

Then: 400 Bad Request와 “유효하지 않은 초대 코드” 메시지가 반환된다.

선행 Scenario: 없음

👀 WP1.4 — 학부모가 자녀 프로필 열람
Scenario WP1.4-1: 연결된 자녀 프로필 조회 성공

Given: 학부모와 자녀 간 family_id 연결 관계가 이미 설정되어 있다.

When: 학부모가 대시보드에서 자녀 프로필을 조회한다.

Then: 자녀의 이름, 학교, 학년 등의 기본 정보가 200 OK와 함께 반환된다.

선행 Scenario: WP1.3-2

Scenario WP1.4-2: 연결되지 않은 학생 프로필 접근 시 차단

Given: 학부모 A와 학생 B는 가족 관계가 없다.

When: 학부모 A가 API 요청으로 학생 B의 프로필 ID를 직접 호출한다.

Then: 403 Forbidden과 "접근 권한이 없습니다" 메시지가 반환된다.

선행 Scenario: 없음

🏫 WP1.5 — 재학 중학교 및 학년 정보 입력
Scenario WP1.5-1: 학생이 회원가입 시 중학교 정보 입력

Given: 회원가입 폼이 표시되어 있다.

When: 학생이 이메일, 비밀번호, 이름, 역할(Student)과 함께 중학교명("OO중학교")과 학년(2)을 입력하고 가입 버튼을 클릭한다.

Then: 201 Created, 사용자 계정이 schoolName="OO중학교", grade=2 정보와 함께 DB에 저장된다.

선행 Scenario: 없음

Scenario WP1.5-2: 학부모가 회원가입 시 자녀 중학교 정보 입력

Given: 회원가입 폼이 표시되어 있다.

When: 학부모가 이메일, 비밀번호, 이름, 역할(Parent)과 함께 자녀의 중학교명과 학년을 입력하고 가입 버튼을 클릭한다.

Then: 201 Created, 학부모 계정에 자녀 학교 정보가 함께 저장된다.

선행 Scenario: 없음

Scenario WP1.5-3: 학생 대시보드에서 중학교 정보 표시

Given: 학생이 schoolName="서울중학교", grade=3으로 가입되어 있고 로그인한 상태이다.

When: 학생 대시보드 페이지에 접속한다.

Then: 대시보드 상단에 "🏫 서울중학교 3학년" 형태로 재학 정보가 표시된다.

선행 Scenario: WP1.5-1

Scenario WP1.5-4: 중학교 정보 없이 회원가입 (선택 입력)

Given: 회원가입 폼이 표시되어 있다.

When: 학생이 중학교명과 학년을 입력하지 않고 필수 정보(이메일, 비밀번호, 이름)만 입력하고 가입한다.

Then: 201 Created, schoolName과 grade가 null인 상태로 계정이 생성된다.

선행 Scenario: 없음

🔍 WP1.6 — 중학교 데이터베이스 및 검색 기능
Scenario WP1.6-1: 학교명 한 글자 검색으로 중학교 목록 표시

Given: 회원가입 폼의 학교 검색 필드가 표시되어 있고, 중학교 DB에 150개 학교가 등록되어 있다.

When: 사용자가 학교명 필드에 "강"을 입력한다.

Then: "강"으로 시작하거나 포함하는 중학교 목록(강남중, 강동중, 강북중 등)이 드롭다운으로 표시된다.

선행 Scenario: 없음

Scenario WP1.6-2: 지역 필터를 적용한 학교 검색

Given: 회원가입 폼에서 지역 선택이 "서울"로 설정되어 있다.

When: 사용자가 학교명 필드에 "중앙"을 입력한다.

Then: 서울 지역의 "중앙"이 포함된 중학교만 검색 결과에 표시된다.

선행 Scenario: 없음

Scenario WP1.6-3: 검색 결과에서 학교 선택

Given: "강남"을 검색하여 검색 결과 드롭다운이 표시되어 있다.

When: 사용자가 검색 결과 중 "압구정중학교 (서울 강남구)"를 클릭한다.

Then: 학교 검색 필드에 선택된 학교 정보(이름, 지역, 구)가 표시되고, middleSchoolId가 설정된다.

선행 Scenario: WP1.6-1

Scenario WP1.6-4: 선택된 학교에서 홈페이지 링크 확인

Given: 사용자가 "압구정중학교"를 선택한 상태이다.

When: 선택된 학교 정보 옆의 외부 링크 아이콘을 클릭한다.

Then: 해당 학교의 홈페이지(https://apgujeong.sen.ms.kr)가 새 탭에서 열린다.

선행 Scenario: WP1.6-3

Scenario WP1.6-5: 선택된 학교 해제

Given: 사용자가 "역삼중학교"를 선택한 상태이다.

When: 선택된 학교 옆의 X 버튼을 클릭한다.

Then: 선택이 해제되고, 학교 검색 입력 필드가 다시 표시된다.

선행 Scenario: WP1.6-3

Scenario WP1.6-6: 학교 선택 후 회원가입 완료

Given: 사용자가 "목동중학교"를 검색해서 선택하고, 학년을 2학년으로 설정했다.

When: 회원가입 버튼을 클릭한다.

Then: 201 Created, 사용자 계정이 middleSchoolId와 grade=2 정보와 함께 DB에 저장된다.

선행 Scenario: WP1.6-3

Scenario WP1.6-7: 학생 대시보드에서 중학교 홈페이지 링크 표시

Given: 학생이 middleSchoolId="목동중학교"(website 포함)로 가입되어 로그인한 상태이다.

When: 학생 대시보드에 접속한다.

Then: 상단 배너에 "목동중학교 (서울 양천구) 2학년"과 함께 외부 링크 아이콘이 표시된다.

선행 Scenario: WP1.6-6

Scenario WP1.6-8: 대시보드에서 학교 홈페이지 바로가기

Given: 학생 대시보드에 중학교 정보와 링크 아이콘이 표시되어 있다.

When: 외부 링크 아이콘을 클릭한다.

Then: 해당 중학교의 홈페이지가 새 탭에서 열린다.

선행 Scenario: WP1.6-7

Scenario WP1.6-9: 검색 결과가 없는 경우

Given: 회원가입 폼의 학교 검색 필드가 표시되어 있다.

When: 사용자가 "가나다라마바사"와 같이 존재하지 않는 학교명을 입력한다.

Then: "검색 결과가 없습니다" 메시지가 드롭다운에 표시된다.

선행 Scenario: 없음

Scenario WP1.6-10: API 엔드포인트 - 중학교 검색

Given: 백엔드 서버가 실행 중이다.

When: GET /api/middle-schools/search?query=강&region=서울 API를 호출한다.

Then: 200 OK와 함께 서울 지역의 "강"이 포함된 중학교 목록이 JSON으로 반환된다.

선행 Scenario: 없음

Scenario WP1.6-11: API 엔드포인트 - 지역 목록 조회

Given: 백엔드 서버가 실행 중이다.

When: GET /api/middle-schools/regions API를 호출한다.

Then: 200 OK와 함께 사용 가능한 지역 목록(서울, 인천)이 반환된다.

선행 Scenario: 없음

Scenario WP1.6-12: API 엔드포인트 - 통계 조회

Given: 백엔드 서버가 실행 중이고 150개 중학교가 등록되어 있다.

When: GET /api/middle-schools/stats API를 호출한다.

Then: 200 OK와 함께 총 학교 수(150)와 지역별 학교 수(서울: 110, 인천: 40)가 반환된다.

선행 Scenario: 없음

---

🏆 WP1.7 — 동아리 데이터베이스 및 검색/추천 기능

Scenario WP1.7-1: 동아리 목록 조회

Given: 로그인한 학생이 동아리 페이지에 접속한다.

When: 페이지가 로드된다.

Then: 전체 동아리 목록이 카드 형태로 표시되고, 카테고리 필터 버튼이 표시된다.

선행 Scenario: WP1.1-3

Scenario WP1.7-2: 카테고리별 동아리 필터링

Given: 동아리 목록 페이지가 표시되어 있다.

When: "학술" 카테고리 버튼을 클릭한다.

Then: 학술 카테고리에 해당하는 동아리만 목록에 표시된다.

선행 Scenario: WP1.7-1

Scenario WP1.7-3: 동아리 검색

Given: 동아리 목록 페이지가 표시되어 있다.

When: 검색창에 "과학"을 입력하고 검색 버튼을 클릭한다.

Then: "과학"이 포함된 동아리만 목록에 표시된다.

선행 Scenario: WP1.7-1

Scenario WP1.7-4: 내 동아리 등록

Given: 동아리 목록에서 "과학탐구반" 카드가 표시되어 있다.

When: 카드의 "+" 버튼을 클릭한다.

Then: 해당 동아리가 "내 동아리" 섹션에 추가되고, 버튼이 "✓"로 변경된다.

선행 Scenario: WP1.7-1

Scenario WP1.7-5: 내 동아리 해제

Given: "과학탐구반"이 내 동아리로 등록되어 있다.

When: 내 동아리 섹션에서 "✕" 버튼을 클릭한다.

Then: 해당 동아리가 내 동아리 목록에서 제거된다.

선행 Scenario: WP1.7-4

Scenario WP1.7-6: 일반 동아리 템플릿 조회 API

Given: 백엔드 서버가 실행 중이다.

When: GET /api/clubs/general API를 호출한다.

Then: 200 OK와 함께 45개 일반 동아리 템플릿 목록이 반환된다.

선행 Scenario: 없음

Scenario WP1.7-7: 카테고리 통계 조회 API

Given: 백엔드 서버가 실행 중이고 140개 동아리가 등록되어 있다.

When: GET /api/clubs/categories API를 호출한다.

Then: 200 OK와 함께 카테고리별 동아리 수가 반환된다 (학술: 30, 예술: 26, ...).

선행 Scenario: 없음

Scenario WP1.7-8: 관심사 기반 동아리 추천 API

Given: 로그인한 학생이 있다.

When: POST /api/clubs/recommend API에 interests: ["과학", "코딩"]를 전송한다.

Then: 200 OK와 함께 학술 카테고리의 추천 동아리 목록이 반환된다.

선행 Scenario: WP1.1-3
