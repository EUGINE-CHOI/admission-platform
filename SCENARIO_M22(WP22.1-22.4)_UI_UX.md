# 🎨 M22 — UI/UX 고도화 (UI/UX Polish Layer) 시나리오

> **버전**: 1.0
> **의존성**: M7 (대시보드), M17 (모바일)
> **대상 사용자**: 모든 역할
> **상태**: ✅ 완료

---

## ✨ WP22.1 — 애니메이션 시스템

### Scenario WP22.1-1: 페이드 인 애니메이션

**Given:**
- 컴포넌트 마운트

**When:**
- animate-fade-in 클래스 적용

**Then:**
- 0.3s 페이드 인 효과

**선행 Scenario:** 없음

---

### Scenario WP22.1-2: 슬라이드 업 애니메이션

**Given:**
- 컴포넌트 마운트

**When:**
- animate-slide-up 클래스 적용

**Then:**
- 아래에서 위로 슬라이드 효과

**선행 Scenario:** 없음

---

### Scenario WP22.1-3: 바운스 인 애니메이션

**Given:**
- 모달 또는 알림 표시

**When:**
- animate-bounce-in 클래스 적용

**Then:**
- 바운스 효과로 등장

**선행 Scenario:** 없음

---

## 🌙 WP22.2 — 다크 모드

### Scenario WP22.2-1: 다크 모드 토글

**Given:**
- 앱 사용 중

**When:**
- 테마 토글 버튼 클릭

**Then:**
- 다크/라이트 모드 전환
- localStorage에 저장

**선행 Scenario:** 없음

---

### Scenario WP22.2-2: 다크 모드 스타일

**Given:**
- 다크 모드 활성화

**When:**
- 페이지 렌더링

**Then:**
- 배경: #0f172a
- 텍스트: #f8fafc
- 카드: #1e293b

**선행 Scenario:** WP22.2-1

---

## 🔮 WP22.3 — Glass Morphism

### Scenario WP22.3-1: Glass 카드

**Given:**
- 카드 컴포넌트

**When:**
- glass={true} 속성 적용

**Then:**
- 반투명 블러 배경 효과
- backdrop-filter: blur(10px)

**선행 Scenario:** 없음

---

### Scenario WP22.3-2: Glass 다크 모드

**Given:**
- 다크 모드 + Glass 카드

**When:**
- 렌더링

**Then:**
- 다크 테마 Glass 스타일 적용
- 반투명 어두운 배경

**선행 Scenario:** WP22.3-1

---

## 💀 WP22.4 — 스켈레톤 로더

### Scenario WP22.4-1: Shimmer 효과

**Given:**
- 데이터 로딩 중

**When:**
- 스켈레톤 컴포넌트 표시

**Then:**
- Shimmer 애니메이션 적용
- 좌→우 빛 반사 효과

**선행 Scenario:** 없음

---

### Scenario WP22.4-2: 스켈레톤 카드

**Given:**
- 카드 목록 로딩 중

**When:**
- SkeletonCard 렌더링

**Then:**
- 실제 카드 레이아웃과 유사
- Shimmer 애니메이션

**선행 Scenario:** WP22.4-1

---

### Scenario WP22.4-3: 스켈레톤 테이블

**Given:**
- 테이블 데이터 로딩 중

**When:**
- SkeletonTable 렌더링

**Then:**
- 헤더 + 행 스켈레톤
- 지연된 Shimmer 효과

**선행 Scenario:** WP22.4-1

---

## ✅ 완료 체크리스트

- [x] WP22.1-1: 페이드 인
- [x] WP22.1-2: 슬라이드 업
- [x] WP22.1-3: 바운스 인
- [x] WP22.2-1: 다크 모드 토글
- [x] WP22.2-2: 다크 모드 스타일
- [x] WP22.3-1: Glass 카드
- [x] WP22.3-2: Glass 다크 모드
- [x] WP22.4-1: Shimmer 효과
- [x] WP22.4-2: 스켈레톤 카드
- [x] WP22.4-3: 스켈레톤 테이블




