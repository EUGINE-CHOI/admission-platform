// 보호자 기능 E2E 테스트
describe('보호자 기능', () => {
  beforeEach(() => {
    cy.login('parent@test.com', 'test1234');
  });

  describe('자녀 현황', () => {
    it('자녀 현황 페이지 접근', () => {
      cy.visit('/dashboard/parent');
      cy.contains(/자녀|학생|현황/).should('be.visible');
    });

    it('자녀 목록 표시', () => {
      cy.visit('/dashboard/parent/children');
      cy.get('[class*="card"], [class*="list"]').should('exist');
    });
  });

  describe('캘린더', () => {
    it('캘린더 페이지 접근', () => {
      cy.visit('/dashboard/parent/calendar');
      cy.url().should('include', '/calendar');
    });

    it('일정 표시', () => {
      cy.visit('/dashboard/parent/calendar');
      cy.contains(/일정|캘린더|월/).should('be.visible');
    });
  });

  describe('학교 비교', () => {
    it('학교 비교 페이지 접근', () => {
      cy.visit('/dashboard/parent/comparison');
      cy.contains(/비교|학교/).should('be.visible');
    });
  });

  describe('상담', () => {
    it('상담 페이지 접근', () => {
      cy.visit('/dashboard/parent/consultations');
      cy.contains(/상담|예약/).should('be.visible');
    });
  });

  describe('뉴스', () => {
    it('뉴스 페이지 접근', () => {
      cy.visit('/dashboard/parent/news');
      cy.url().should('include', '/news');
    });
  });
});



