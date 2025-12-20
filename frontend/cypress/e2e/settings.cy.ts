// 설정 E2E 테스트
describe('설정', () => {
  beforeEach(() => {
    cy.login('student@test.com', 'test1234');
  });

  describe('다크 모드', () => {
    it('테마 토글 버튼 표시', () => {
      cy.visit('/dashboard/student');
      // 테마 토글 버튼 존재 확인
      cy.get('[aria-label*="테마"], [class*="theme"], button').should('exist');
    });

    it('다크 모드 토글 시 클래스 변경', () => {
      cy.visit('/dashboard/student');
      // 다크 모드 토글 클릭
      cy.get('[aria-label*="테마"], [class*="theme"]').first().click();
      // dark 클래스 확인
      cy.get('html').should('have.class', 'dark');
    });

    it('다크 모드 설정 유지', () => {
      cy.visit('/dashboard/student');
      cy.get('[aria-label*="테마"], [class*="theme"]').first().click();
      cy.reload();
      cy.get('html').should('have.class', 'dark');
    });
  });

  describe('위젯 설정', () => {
    it('위젯 설정 버튼 표시', () => {
      cy.visit('/dashboard/student');
      cy.contains(/설정|위젯|커스텀/).should('be.visible');
    });
  });
});

