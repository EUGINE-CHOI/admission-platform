// 인증 관련 E2E 테스트
describe('인증 시스템', () => {
  beforeEach(() => {
    // 테스트 전 로그아웃 상태 유지
    cy.window().then((win) => {
      win.localStorage.clear();
    });
  });

  describe('로그인 페이지', () => {
    it('로그인 페이지 접근 가능', () => {
      cy.visit('/login');
      cy.contains('로그인').should('be.visible');
      cy.get('input[type="email"]').should('be.visible');
      cy.get('input[type="password"]').should('be.visible');
    });

    it('빈 폼 제출 시 에러 표시', () => {
      cy.visit('/login');
      cy.get('button[type="submit"]').click();
      // 필수 입력 검증
      cy.get('input[type="email"]:invalid').should('exist');
    });

    it('잘못된 자격증명으로 로그인 시 에러 메시지', () => {
      cy.visit('/login');
      cy.get('input[type="email"]').type('wrong@email.com');
      cy.get('input[type="password"]').type('wrongpassword');
      cy.get('button[type="submit"]').click();
      
      // 에러 메시지 확인 (서버 응답에 따라)
      cy.contains(/실패|오류|확인/).should('be.visible');
    });

    it('학생 계정으로 로그인 성공', () => {
      cy.visit('/login');
      cy.get('input[type="email"]').type('student@test.com');
      cy.get('input[type="password"]').type('test1234');
      cy.get('button[type="submit"]').click();

      // 학생 대시보드로 이동
      cy.url().should('include', '/dashboard');
      cy.contains('홈').should('be.visible');
    });

    it('보호자 계정으로 로그인 성공', () => {
      cy.visit('/login');
      cy.get('input[type="email"]').type('parent@test.com');
      cy.get('input[type="password"]').type('test1234');
      cy.get('button[type="submit"]').click();

      // 보호자 대시보드로 이동
      cy.url().should('include', '/dashboard');
    });
  });

  describe('회원가입 페이지', () => {
    it('회원가입 페이지 접근 가능', () => {
      cy.visit('/signup');
      cy.contains('회원가입').should('be.visible');
    });

    it('로그인 페이지로 이동 링크', () => {
      cy.visit('/signup');
      cy.contains('로그인').click();
      cy.url().should('include', '/login');
    });

    it('역할 선택 가능', () => {
      cy.visit('/signup');
      // 역할 선택 버튼들 확인
      cy.contains('학생').should('be.visible');
      cy.contains('보호자').should('be.visible');
    });
  });

  describe('로그아웃', () => {
    it('로그인 후 로그아웃 가능', () => {
      // 로그인
      cy.visit('/login');
      cy.get('input[type="email"]').type('student@test.com');
      cy.get('input[type="password"]').type('test1234');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');

      // 로그아웃 버튼 클릭 (사이드바 또는 메뉴에서)
      cy.contains('로그아웃').click();
      
      // 로그인 페이지로 이동
      cy.url().should('include', '/login');
    });
  });

  describe('데모 체험 모드', () => {
    it('랜딩 페이지에서 데모 체험 가능', () => {
      cy.visit('/');
      
      // 데모 체험 버튼 확인
      cy.contains(/체험|데모/).should('be.visible');
    });
  });
});

