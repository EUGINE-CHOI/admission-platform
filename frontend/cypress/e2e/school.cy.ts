// 학교 정보 E2E 테스트
describe('학교 정보', () => {
  beforeEach(() => {
    cy.login('student@test.com', 'test1234');
  });

  describe('학교 목록', () => {
    it('학교 탐색 페이지 접근', () => {
      cy.visit('/dashboard/student/schools');
      cy.url().should('include', '/schools');
    });

    it('학교 유형 필터 표시', () => {
      cy.visit('/dashboard/student/schools');
      cy.contains(/외고|자사고|과학고|일반고/).should('be.visible');
    });

    it('지역 필터 표시', () => {
      cy.visit('/dashboard/student/schools');
      cy.contains(/서울|경기|지역/).should('be.visible');
    });

    it('학교 카드 클릭 시 상세 정보', () => {
      cy.visit('/dashboard/student/schools');
      cy.get('[class*="card"]').first().click();
      cy.contains(/상세|정보|모집/).should('be.visible');
    });
  });

  describe('목표 학교 설정', () => {
    it('목표 학교 페이지 접근', () => {
      cy.visit('/dashboard/student/target');
      cy.contains('목표 학교').should('be.visible');
    });

    it('학교 검색', () => {
      cy.visit('/dashboard/student/target');
      cy.get('input[type="text"]').first().type('고등학교');
      cy.wait(500); // 검색 debounce 대기
    });

    it('목표 학교 목록 표시', () => {
      cy.visit('/dashboard/student/target');
      cy.get('[class*="card"], [class*="list"]').should('exist');
    });
  });

  describe('학교 비교', () => {
    it('학교 비교 페이지 접근', () => {
      cy.visit('/dashboard/student/comparison');
      cy.contains(/비교|학교/).should('be.visible');
    });
  });
});



