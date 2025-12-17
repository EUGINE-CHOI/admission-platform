// Cypress E2E 테스트 지원 파일
import '@testing-library/cypress/add-commands';

// 커스텀 명령어 정의
declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      logout(): Chainable<void>;
    }
  }
}

// 로그인 커스텀 명령어
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login');
  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').type(password);
  cy.get('button[type="submit"]').click();
  // 로그인 후 대시보드로 이동 대기
  cy.url().should('include', '/dashboard');
});

// 로그아웃 커스텀 명령어
Cypress.Commands.add('logout', () => {
  cy.window().then((win) => {
    win.localStorage.removeItem('accessToken');
    win.localStorage.removeItem('refreshToken');
  });
  cy.visit('/login');
});

// 테스트 실패 시 스크린샷 저장 비활성화 (선택사항)
Cypress.on('uncaught:exception', (err, runnable) => {
  // 예상치 못한 에러가 테스트를 중단시키지 않도록
  return false;
});

