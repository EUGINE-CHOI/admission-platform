// 신규 기능 E2E 테스트
describe('신규 기능', () => {
  beforeEach(() => {
    cy.login('student@test.com', 'test1234');
  });

  describe('학습 캘린더', () => {
    it('캘린더 페이지 접근', () => {
      cy.visit('/dashboard/student/calendar');
      cy.url().should('include', '/calendar');
    });

    it('캘린더 뷰 표시', () => {
      cy.visit('/dashboard/student/calendar');
      cy.contains(/월|주|일|캘린더/).should('be.visible');
    });

    it('오늘 날짜 표시', () => {
      cy.visit('/dashboard/student/calendar');
      const today = new Date().getDate();
      cy.contains(today.toString()).should('be.visible');
    });
  });

  describe('학습 시간 트래커', () => {
    it('학습 시간 페이지 접근', () => {
      cy.visit('/dashboard/student/study-time');
      cy.url().should('include', '/study-time');
    });

    it('학습 시간 기록 UI', () => {
      cy.visit('/dashboard/student/study-time');
      cy.contains(/시간|기록|학습/).should('be.visible');
    });
  });

  describe('AI 튜터', () => {
    it('AI 튜터 페이지 접근', () => {
      cy.visit('/dashboard/student/tutor');
      cy.url().should('include', '/tutor');
    });

    it('채팅 입력창 표시', () => {
      cy.visit('/dashboard/student/tutor');
      cy.get('input[type="text"], textarea').should('be.visible');
    });
  });

  describe('채팅', () => {
    it('채팅 페이지 접근', () => {
      cy.visit('/dashboard/student/chat');
      cy.url().should('include', '/chat');
    });

    it('메시지 입력창 표시', () => {
      cy.visit('/dashboard/student/chat');
      cy.get('input[type="text"], textarea').should('be.visible');
    });
  });

  describe('목표 관리', () => {
    it('목표 페이지 접근', () => {
      cy.visit('/dashboard/student/goals');
      cy.url().should('include', '/goals');
    });

    it('목표 목록 표시', () => {
      cy.visit('/dashboard/student/goals');
      cy.contains(/목표|성적|달성/).should('be.visible');
    });
  });

  describe('D-Day 관리', () => {
    it('D-Day 페이지 접근', () => {
      cy.visit('/dashboard/student/dday');
      cy.url().should('include', '/dday');
    });

    it('D-Day 이벤트 표시', () => {
      cy.visit('/dashboard/student/dday');
      cy.contains(/D-|Day|이벤트/).should('be.visible');
    });
  });

  describe('뱃지', () => {
    it('뱃지 페이지 접근', () => {
      cy.visit('/dashboard/student/badges');
      cy.url().should('include', '/badges');
    });

    it('뱃지 목록 표시', () => {
      cy.visit('/dashboard/student/badges');
      cy.contains(/뱃지|획득|보유/).should('be.visible');
    });
  });

  describe('Q&A 커뮤니티', () => {
    it('Q&A 페이지 접근', () => {
      cy.visit('/dashboard/student/qna');
      cy.url().should('include', '/qna');
    });

    it('질문 목록 표시', () => {
      cy.visit('/dashboard/student/qna');
      cy.contains(/질문|답변|Q&A/).should('be.visible');
    });
  });

  describe('합격 스토리', () => {
    it('합격 스토리 페이지 접근', () => {
      cy.visit('/dashboard/student/stories');
      cy.url().should('include', '/stories');
    });

    it('스토리 목록 표시', () => {
      cy.visit('/dashboard/student/stories');
      cy.contains(/합격|스토리|후기/).should('be.visible');
    });
  });
});

describe('Coming Soon 페이지', () => {
  beforeEach(() => {
    cy.login('student@test.com', 'test1234');
  });

  it('대학 확장 페이지', () => {
    cy.visit('/dashboard/student/college');
    cy.contains(/준비|Coming|Soon/).should('be.visible');
  });

  it('학원/과외 매칭 페이지', () => {
    cy.visit('/dashboard/student/academy');
    cy.contains(/준비|Coming|Soon/).should('be.visible');
  });

  it('멘토링 페이지', () => {
    cy.visit('/dashboard/student/mentoring');
    cy.contains(/준비|Coming|Soon/).should('be.visible');
  });
});

