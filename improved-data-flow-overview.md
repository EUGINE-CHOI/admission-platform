#1. 개요 (Overview)

본 문서는 기존 데이터 흐름(data-flow-overview.md)을 검토하여
**서비스 목적(정보 격차 해소 + 실행 중심 입시 코칭)**에 최적화되도록
부족한 부분을 보완하고,
이를 기반으로 한 시스템 전체 데이터 구조 개선안을 제시한다.

#2. 현재 구조의 주요 개선 포인트
## 2.1 실행 데이터(Task Completion)가 부족함

현재는 계획(Action Plan)은 있음,
하지만 학생이 실제로 실행했는지(완료 여부) 에 대한 구조화된 데이터 없음

실행률 기반 AI·진단 개선이 불가능

활동 지속률 추적이 어려움

→ 실행 데이터(Tasks)를 1급 시민으로 승격해야 함

## 2.2 시간 축(Time-series) 부족

현재 구조는 “현 시점 스냅샷” 중심

성장 변화 분석, 학년/학기별 추이 분석이 어려움

→ Event Log + Timeline 구조 필요

## 2.3 AI 출력에 대한 품질 피드백 구조 미비

AI가 생성한 출력물이 얼마나 수정·거부되는지 데이터 없음

프롬프트 개선 근거 부족

→ AI Feedback/Revision 구조 필요

## 2.4 전형/일정 데이터에 연도·버전 명시 필요

매년 바뀌는 전형을 덮어쓰기 하면 과거 분석 불가

진단 엔진이 잘못된 전형을 기준으로 계산할 위험

→ 전형/일정 데이터에 versioning 필요

## 2.5 분석용 저장소(Warehouse) 부재

운영 DB만으로는 KPI/알고리즘 개선이 어려움

대규모 조인/집계 시 서비스 영향 가능

→ Operational DB + Analytics Layer 분리 권장

#3. 개선된 전체 데이터 구조 제안
## 3.1 Action Plan + Task 모델 신설
새 데이터 모델

action_plans

plan_tasks

status: todo / doing / done / skipped

completed_at

parent_feedback

student_comment

기대 효과

실행률 기반 진단/AI 개선 가능

학부모 대시보드에서 “지난달 실행률” 확인

행동 기반 성장 그래프 생성 가능

## 3.2 Event Log 기반 Student Timeline
새 데이터 모델

events

event_type: SCORE_UPDATED, ACTIVITY_ADDED, DIAGNOSIS_RUN, TASK_DONE 등

created_at

actor: student/parent/system

target_id (activity/grade/action_plan 등)

기대 효과

학생 성장 타임라인 UI 가능

상담/코칭에서 “왜 성적이 떨어졌는지” 과정을 데이터 기반으로 설명

AI가 행동 패턴 기반 추천 가능

## 3.3 AI 결과에 Feedback/Revision 구조 추가
새 데이터 모델

ai_analysis_results

draft_text

final_text

user_edited: boolean

feedback: like/dislike/needs_revision

prompt_version

기대 효과

AI 모델 개선

어떤 유형의 활동에서 수정 많이 발생하는지 분석 가능

컨설턴트 상담 품질 향상

## 3.4 전형/일정 데이터 Versioning
변경사항

admissions

year

version

status: draft / published / archived

admission_schedules

year

round

기대 효과

“2024 → 2025 전형 변화” 리포트 가능

진단 엔진 오류 방지

미래 대입 버전까지 확장성 확보

## 3.5 Analytics Layer(ETL + Warehouse)
구조 제안

운영 DB → ETL → 분석 DB(Warehouse)

예: PostgreSQL Replica → BigQuery / Redshift / Superset

분석 항목

학생 실행률 변화

활동 유형과 진단 점수 상관

전형 변화 추세

프리미엄 전환 경로 분석

기대 효과

KPI 계산 안정성 ↑

AI 알고리즘 개선 데이터 확보

관리자 대시보드 고도화 가능

#4. 개선된 전체 데이터 흐름 (Pipeline)
[학생 입력]
  → 성적/활동/독서 구조화 저장
    → Event Log 기록
      → 진단 엔진 (Ver.별 전형 사용)
        → Diagnosis 저장
          → AI 모듈 (초안 생성)
            → AI Filter → 초안 저장
              → 학생/부모 수정 → 최종본 저장
                → Action Plan 생성 (Plan + Tasks)
                  → Task 완료 체크
                    → Event Log 기록
                      → Dashboard / Report / Calendar 반영
                        → ETL → Analytics Warehouse
                          → 알고리즘 / AI 개선

#5. 개선된 시스템 구성도 (요약)
CLIENT
 - Student App
 - Parent App
 - Consultant App
 - Admin Dashboard

API Gateway
 - Auth
 - User/Family
 - Student Data (grades/activities/books)
 - Diagnosis Engine
 - AI Service Layer
 - School/Admissions
 - Action Plan / Tasks
 - Subscription
 - Consultation
 - Report/PDF

DATABASE (Operational)
 - users, families
 - grades, activities, reading_logs
 - admissions, schedules
 - diagnosis_results
 - ai_analysis_results
 - action_plans, plan_tasks
 - consultations, payments

EVENT LOG
 - events (global timeline)

ANALYTICS
 - Data Warehouse
 - ETL Scheduler

AI MODULE
 - Prompt Templates
 - Version Control
 - Filter Layer
 - Feedback Collector

CRAWLER
 - Schools/Admissions Scraper
 - Admin Approval Pipeline

#6. 이 개선안이 가져오는 핵심 시너지
✔ 행동 기반 코칭이 가능해짐

(실행률/패턴을 기반으로 진단·AI 추천 고도화)

✔ “성장”이 보이는 서비스가 됨

(타임라인 + 변화 데이터)

✔ AI 품질 개선 루프가 생김

(수정/피드백 데이터 축적)

✔ 전형 데이터의 안정성과 신뢰도가 높아짐

(버전/연도 단위 관리)

✔ 분석/통계/추천모델 강화에 최적화

(Operational + Analytics Layer 분리)

#7. 파일 목적

본 md 문서는 다음을 위한 기준 문서이다:

시스템 설계 검토

데이터베이스 설계

API 스펙 작성

진단/AI 알고리즘 개선

개발자 협업 및 코드 구조 일관성 유지