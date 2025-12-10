flowchart LR
    %% ========= GLOBAL ENTRY =========
    A0[Landing / Login] --> S0[Student 선택]
    A0 --> P0[Parent 선택]
    A0 --> C0[Consultant 선택]

    %% ========= STUDENT FLOW =========
    subgraph STUDENT[Student Flow]
        direction TB
        S0 --> S1[Student Onboarding / 프로필 설정]
        S1 --> S2[Student Home Dashboard]

        S2 --> S3[데이터 입력\n- 성적(지필/수행)\n- 활동(세특/동아리/창체)\n- 독서 기록]
        S3 --> S4[고입 진단 실행\n(FIT / CHALLENGE / UNLIKELY)]
        S4 --> S5[AI 액션 플랜\n(3개월 / 주간 할 일)]
        S5 --> S6[목표 학교 준비 가이드\n- 전형 요소\n- 면접/자소서 방향]
    end

    %% ========= PARENT FLOW =========
    subgraph PARENT[Parent Flow]
        direction TB
        P0 --> P1[Parent Onboarding\n(고입 구조·서비스 설명)]
        P1 --> P2[학부모 대시보드\n3줄 스냅샷]

        P2 --> P3[자녀 활동 검토·승인]
        P3 --> P4[진단 결과 열람\n- 추천 학교\n- 이유/전략 이해]
        P4 --> P5[입시 일정 캘린더\n- 원서/면접/발표 일정 확인]
        P5 --> P6[PDF 리포트 다운로드]
    end

    %% ========= CONSULTANT FLOW =========
    subgraph CONSULTANT[Consultant Flow]
        direction TB
        C0 --> C1[컨설턴트 대시보드\n상담 요청 목록]
        C1 --> C2[학생 현황 요약 보기\n- 성적/활동/AI 분석/진단]
        C2 --> C3[상담 진행\n(채팅/영상/오프라인 여부 기록)]
        C3 --> C4[상담 리포트 작성\n+ AI 초안 보정]
    end

    %% ========= CROSS LINKS =========
    %% 학생이 부모를 초대하는 흐름
    S1 -. 자녀 초대 코드 .-> P1

    %% 학생 진단 ↔ 부모 진단 연결
    S4 -->|진단 결과 공유| P4

    %% 부모가 컨설턴트 상담으로 이동
    P4 -->|상담 필요 판단| C1

    %% 컨설턴트 리포트가 다시 부모/학생에게 공유
    C4 -->|리포트 공유| P6
    C4 -->|리포트 요약 표시| S2
