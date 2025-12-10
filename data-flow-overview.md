#1. 서비스 전체 데이터 구조 개요

이 서비스에서 다루는 모든 데이터는 다음 6개 도메인으로 구성된다:

User & Family Data

Student Academic & Activity Data

School / Admissions / Schedule Data

Diagnosis & Recommendation Data

AI Analysis Data

Subscription / Payment / Consultation Data

각 도메인은 서로 연결되어
“입력 → 구조화 → 분석 → 설명 → 의사결정 → 액션 플랜”
이라는 파이프라인을 구성한다.

#2. 도메인별 데이터 상세
## 2.1 User & Family Data
데이터 종류

학생 프로필

학부모 정보

컨설턴트 정보

가족 구성 관계 (부모 1 → 자녀 N)

생성

학생/학부모 회원가입

초대 코드로 가족 연결

컨설턴트 승인

저장

users

families

consultants

활용

권한(Role) 결정

학생–부모 데이터 공유

가족 할인 계산

상담 연결 기준

노출 대상

학생: 자기 정보

학부모: 자녀 정보

컨설턴트: 상담 수락된 학생 정보

관리자: 최소한의 계정 정보(운영 목적)

## 2.2 Student Academic & Activity Data
데이터 종류

성적(지필·수행·중간기말/년도/과목 단위)

학생부 활동 기록

동아리/창체/진로활동

독서 기록

생성

학생 직접 입력

학부모 검토 & 승인

저장

grades

activities

reading_logs

활용

진단 엔진

AI 에이전트(생기부, 동아리, 교과, 독서)

학생·학부모 대시보드

상담 준비용 요약

노출 대상

학생

학부모

컨설턴트(상담 허용 시)

## 2.3 School / Admissions / Schedule Data
데이터 종류

고등학교 기본 정보 (외고/국제고/과고/자사고/일반고)

전형 요소(내신/면접/자기주도학습 등)

연간 입시 일정(원서 · 면접 · 발표 · 설명회)

생성

Python 크롤러 자동 수집

관리자 검토 후 공개

저장

schools

admissions

admission_schedules

활용

진단 엔진

목표 학교 가이드

일정 캘린더

검색/비교 기능

노출 대상

학생/학부모/컨설턴트

관리자(검토/승인)

## 2.4 Diagnosis & Recommendation Data
데이터 종류

FIT / CHALLENGE / UNLIKELY 판단

학교 추천 목록

강점/약점 분석

대비 전략

3개월/주간 액션 플랜

생성

진단 엔진 (룰 기반 + 데이터 기반)

AI 액션 플랜 에이전트

저장

diagnosis_results

action_plans

plan_tasks

활용

학생 홈(이번 주 할 일)

학부모 대시보드

목표 학교 준비 가이드

상담 리포트

노출 대상

학생

학부모

컨설턴트(승인 시)

## 2.5 AI Analysis Data
데이터 종류

생기부 문장 생성

동아리 조언

교과 조언

독서 추천/독후 가이드

액션 플랜 자동 생성

AI 입력/출력 로그

생성

백엔드(NestJS AI Module → OpenAI API 호출)

AI 필터링 레이어에서 품질 체크

저장

ai_analysis_results

ai_prompt_versions

ai_logs

활용

학생부 자동화

동아리 활동 계획

교과/독서 전략

전문가 상담 보조

PDF 보고서 자동 채우기

노출 대상

학생

학부모

컨설턴트(해당 학생만)

## 2.6 Subscription / Payment / Consultation Data
데이터 종류

결제 이력

구독 상태

할인(가족 계정)

상담 예약/상담 내용

상담 리포트

생성

부모의 결제 신청

PG Webhook 통지

상담 예약 시 생성

저장

subscriptions

payments

consultations

consultation_reports

활용

기능 접근 제어

프리미엄 전용 기능

상담 관리

수익 분석

노출 대상

학부모

학생(상담 결과만)

컨설턴트

관리자(운영)

#3. 전체 데이터 파이프라인 (핵심 흐름)
[학생 입력]
    → 성적/활동/독서 데이터
        → 구조화 저장(PostgreSQL)
            → 진단 엔진
                → AI 에이전트 분석
                    → 추천/액션 플랜 생성
                        → 학생/학부모/컨설턴트로 전달
                            → 부모 승인·피드백
                                → 리포트/PDF/상담으로 연결


핵심 요약:

입력은 학생

검토는 학부모

분석은 진단 엔진 + AI

전략은 AI(자세 설명)

의사결정은 학부모

고도화는 컨설턴트

모든 흐름이 단방향이며,
데이터는 “한 번 입력하면 계속 활용하는 구조”로 사용된다.

#4. 권한 & 가시성 요약
데이터	학생	학부모	컨설턴트	관리자
자신의 성적/활동	O	O(자녀)	O	X
AI 분석 결과	O	O	O	제한적
진단/추천	O	O	O	통계만
학교/전형/일정	O	O	O	O
결제/구독	X	O	X	O
상담 리포트	O	O	O	X
#5. 이 데이터 구조가 만들어내는 핵심 가치

학생: “정확한 전략 + 실천 과제”

학부모: “한눈에 보는 입시·일정·진단 보고서”

컨설턴트: “이미 정리된 학생 데이터를 기반으로 고품질 상담”

서비스 자체: 입력 데이터 → 분석 → AI → 전략 → 행동 → 리포트의
완성형 파이프라인 구축

#6. 파일 목적

이 문서는 Cursor / VSCode 개발 환경에서 팀이 다음을 위해 활용한다:

데이터베이스 설계

API 스펙 설계

모듈 구조화(NestJS)

기능 개발 우선순위 결정

데이터 보안/접근 권한 설계

PRD → 실제 개발 간 일관성 유지