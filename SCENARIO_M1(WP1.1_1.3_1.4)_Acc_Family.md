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
