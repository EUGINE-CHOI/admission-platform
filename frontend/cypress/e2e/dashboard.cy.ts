// 대시보드 E2E 테스트
describe('대시보드', () => {
  describe('학생 대시보드', () => {
    beforeEach(() => {
      cy.login('student@test.com', 'test1234');
    });

    it('학생 대시보드 메인 페이지 로드', () => {
      cy.url().should('include', '/dashboard/student');
      cy.contains('홈').should('be.visible');
    });

    it('사이드바 메뉴 표시', () => {
      cy.contains('AI 멘토').should('be.visible');
      cy.contains('내 정보').should('be.visible');
      cy.contains('목표 학교').should('be.visible');
    });

    it('AI 멘토 페이지 이동', () => {
      cy.contains('AI 멘토').click();
      cy.url().should('include', '/ai');
    });

    it('내 정보 페이지 이동', () => {
      cy.contains('내 정보').click();
      cy.url().should('include', '/profile');
    });

    it('최신 뉴스 페이지 이동', () => {
      cy.contains('최신뉴스').click();
      cy.url().should('include', '/news');
    });
  });

  describe('보호자 대시보드', () => {
    beforeEach(() => {
      cy.login('parent@test.com', 'test1234');
    });

    it('보호자 대시보드 메인 페이지 로드', () => {
      cy.url().should('include', '/dashboard/parent');
    });

    it('학생 현황 메뉴 표시', () => {
      cy.contains('학생 현황').should('be.visible');
    });

    it('캘린더 페이지 이동', () => {
      cy.contains('캘린더').click();
      cy.url().should('include', '/calendar');
    });
  });

  describe('반응형 네비게이션', () => {
    // Bug 1 Fix: viewport를 로그인 전에 설정하여 인증 상태 유지
    it('모바일 뷰포트에서 하단 네비게이션 표시', () => {
      // viewport를 먼저 설정
      cy.viewport(375, 667); // iPhone SE
      
      // 그 다음 로그인 (login 커맨드가 visit과 인증을 처리)
      cy.login('student@test.com', 'test1234');
      
      // 모바일 하단 네비게이션 확인
      cy.get('nav').should('be.visible');
    });

    it('데스크톱 뷰포트에서 사이드바 표시', () => {
      // viewport를 먼저 설정
      cy.viewport(1280, 720);
      
      // 그 다음 로그인
      cy.login('student@test.com', 'test1234');
      
      // 사이드바 확인
      cy.contains('홈').should('be.visible');
    });
  });
});
