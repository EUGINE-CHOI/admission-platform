// 인증 관련 E2E 테스트
describe('인증 시스템', () => {
  beforeEach(() => {
    // Bug Fix: cy.visit() 먼저 호출하여 window 컨텍스트 확보 후 localStorage 클리어
    cy.visit('/login');
    cy.window().then((win) => {
      win.localStorage.clear();
    });
  });

  describe('로그인 페이지', () => {
    it('로그인 페이지 접근 가능', () => {
      cy.contains('로그인').should('be.visible');
      cy.get('input[type="email"]').should('be.visible');
      cy.get('input[type="password"]').should('be.visible');
    });

    it('빈 폼 제출 시 에러 표시', () => {
      cy.get('button[type="submit"]').click();
      cy.get('input[type="email"]:invalid').should('exist');
    });

    it('잘못된 자격증명으로 로그인 시 에러 메시지', () => {
      cy.get('input[type="email"]').type('wrong@email.com');
      cy.get('input[type="password"]').type('wrongpassword');
      cy.get('button[type="submit"]').click();
      cy.contains(/실패|오류|확인/).should('be.visible');
    });

    it('학생 계정으로 로그인 성공', () => {
      cy.get('input[type="email"]').type('student@test.com');
      cy.get('input[type="password"]').type('test1234');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
    });

    it('보호자 계정으로 로그인 성공', () => {
      cy.get('input[type="email"]').type('parent@test.com');
      cy.get('input[type="password"]').type('test1234');
      cy.get('button[type="submit"]').click();
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
      cy.contains('학생').should('be.visible');
      cy.contains('보호자').should('be.visible');
    });
  });

  describe('로그아웃', () => {
    it('로그인 후 로그아웃 가능', () => {
      cy.get('input[type="email"]').type('student@test.com');
      cy.get('input[type="password"]').type('test1234');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
      cy.contains('로그아웃').click();
      cy.url().should('include', '/login');
    });
  });

  describe('데모 체험 모드', () => {
    it('랜딩 페이지에서 데모 체험 가능', () => {
      cy.visit('/');
      cy.contains(/체험|데모/).should('be.visible');
    });
  });
});
