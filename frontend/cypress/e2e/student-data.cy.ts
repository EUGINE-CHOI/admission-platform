// 학생 데이터 입력 E2E 테스트
describe('학생 데이터 입력', () => {
  beforeEach(() => {
    cy.login('student@test.com', 'test1234');
  });

  describe('성적 입력', () => {
    it('성적 입력 페이지 접근', () => {
      cy.contains('내 정보').click();
      cy.url().should('include', '/profile');
      
      // 성적 탭 또는 섹션 확인
      cy.contains(/성적|점수/).should('be.visible');
    });

    it('성적 입력 폼 표시', () => {
      cy.visit('/dashboard/student/profile');
      
      // 성적 입력 관련 UI 확인
      cy.contains(/성적|점수|입력/).should('be.visible');
    });
  });

  describe('활동 입력', () => {
    it('활동 입력 페이지 접근', () => {
      cy.visit('/dashboard/student/profile');
      
      // 활동 탭 또는 섹션 확인
      cy.contains(/활동|동아리/).should('be.visible');
    });
  });

  describe('독서 기록', () => {
    it('독서 기록 페이지 접근', () => {
      cy.visit('/dashboard/student/profile');
      
      // 독서 탭 또는 섹션 확인
      cy.contains(/독서|책/).should('be.visible');
    });
  });

  describe('목표 학교', () => {
    it('목표 학교 페이지 접근', () => {
      cy.contains('목표 학교').click();
      cy.url().should('include', '/target');
    });

    it('학교 검색 기능', () => {
      cy.visit('/dashboard/student/target');
      
      // 학교 검색 입력창 확인
      cy.get('input[placeholder*="검색"]').should('be.visible');
    });
  });
});

describe('AI 멘토', () => {
  beforeEach(() => {
    cy.login('student@test.com', 'test1234');
    cy.visit('/dashboard/student/ai');
  });

  it('AI 멘토 페이지 로드', () => {
    cy.url().should('include', '/ai');
    cy.contains('AI').should('be.visible');
  });

  it('AI 기능 메뉴 표시', () => {
    // AI 기능들 확인
    cy.contains(/조언|분석|추천/).should('be.visible');
  });
});

describe('뉴스 페이지', () => {
  beforeEach(() => {
    cy.login('student@test.com', 'test1234');
    cy.visit('/dashboard/student/news');
  });

  it('뉴스 페이지 로드', () => {
    cy.url().should('include', '/news');
  });

  it('뉴스 키워드 필터 표시', () => {
    // 키워드 필터 버튼들 확인
    cy.contains(/외고|과학고|자사고/).should('be.visible');
  });

  it('뉴스 목록 표시', () => {
    // 뉴스 카드 또는 목록 확인
    cy.get('article, [class*="card"], [class*="news"]').should('have.length.greaterThan', 0);
  });

  it('뉴스 클릭 시 상세 모달 표시', () => {
    // 첫 번째 뉴스 클릭
    cy.get('article, [class*="card"], [class*="news"]').first().click();
    
    // 모달 또는 상세 페이지 확인
    cy.get('[role="dialog"], [class*="modal"]').should('be.visible');
  });
});


