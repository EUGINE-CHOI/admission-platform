🧩 M0 — 프로젝트 인프라 & 기본 아키텍처 구축 (Foundation Layer)
🎯 목적

서비스 전체의 기반이 되는 구조를 빠르고 안정적으로 구축한다.

📦 산출물

Git 모노레포 구조 (frontend + backend + crawler + docs)

AWS 기본 인프라: EC2/RDS/S3 세팅

CI/CD: Github Actions + Vercel or EC2

인증/인가 기본 구조 (JWT + Role(Student/Parent/Consultant/Admin))

DB 초기 스키마(유저·가족·기본 학생 데이터)

🔗 의존성

모든 기능이 이 단계 위에서 실행됨 → 전 기능의 기초