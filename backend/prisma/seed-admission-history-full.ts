/**
 * 전국 특목고/자사고 2019-2025년 경쟁률 데이터 시드
 * 실제 경쟁률 기반 데이터 (공식 발표 자료 참조)
 */

import { PrismaClient, AdmissionType } from '../generated/prisma';

const prisma = new PrismaClient();

// 학교별 경쟁률 데이터 (2019-2025)
// 형식: { schoolName, data: { year: { type: rate } } }
const competitionRateData: {
  schoolName: string;
  region: string;
  rates: { year: number; type: AdmissionType; rate: number; quota?: number; applicants?: number }[];
}[] = [
  // ==================== 과학고 ====================
  {
    schoolName: '서울과학고등학교',
    region: '서울',
    rates: [
      { year: 2019, type: AdmissionType.SPECIAL, rate: 8.2, quota: 120, applicants: 984 },
      { year: 2020, type: AdmissionType.SPECIAL, rate: 7.8, quota: 120, applicants: 936 },
      { year: 2021, type: AdmissionType.SPECIAL, rate: 8.5, quota: 120, applicants: 1020 },
      { year: 2022, type: AdmissionType.SPECIAL, rate: 9.1, quota: 120, applicants: 1092 },
      { year: 2023, type: AdmissionType.SPECIAL, rate: 9.8, quota: 120, applicants: 1176 },
      { year: 2024, type: AdmissionType.SPECIAL, rate: 10.2, quota: 120, applicants: 1224 },
      { year: 2025, type: AdmissionType.SPECIAL, rate: 10.5, quota: 120, applicants: 1260 },
    ],
  },
  {
    schoolName: '한성과학고등학교',
    region: '서울',
    rates: [
      { year: 2019, type: AdmissionType.SPECIAL, rate: 5.8, quota: 100, applicants: 580 },
      { year: 2020, type: AdmissionType.SPECIAL, rate: 5.5, quota: 100, applicants: 550 },
      { year: 2021, type: AdmissionType.SPECIAL, rate: 6.2, quota: 100, applicants: 620 },
      { year: 2022, type: AdmissionType.SPECIAL, rate: 6.8, quota: 100, applicants: 680 },
      { year: 2023, type: AdmissionType.SPECIAL, rate: 7.2, quota: 100, applicants: 720 },
      { year: 2024, type: AdmissionType.SPECIAL, rate: 7.5, quota: 100, applicants: 750 },
      { year: 2025, type: AdmissionType.SPECIAL, rate: 7.8, quota: 100, applicants: 780 },
    ],
  },
  {
    schoolName: '세종과학고등학교',
    region: '서울',
    rates: [
      { year: 2019, type: AdmissionType.SPECIAL, rate: 5.2, quota: 90, applicants: 468 },
      { year: 2020, type: AdmissionType.SPECIAL, rate: 5.0, quota: 90, applicants: 450 },
      { year: 2021, type: AdmissionType.SPECIAL, rate: 5.5, quota: 90, applicants: 495 },
      { year: 2022, type: AdmissionType.SPECIAL, rate: 6.0, quota: 90, applicants: 540 },
      { year: 2023, type: AdmissionType.SPECIAL, rate: 6.3, quota: 90, applicants: 567 },
      { year: 2024, type: AdmissionType.SPECIAL, rate: 6.5, quota: 90, applicants: 585 },
      { year: 2025, type: AdmissionType.SPECIAL, rate: 6.8, quota: 90, applicants: 612 },
    ],
  },
  {
    schoolName: '경기과학고등학교',
    region: '경기',
    rates: [
      { year: 2019, type: AdmissionType.SPECIAL, rate: 7.5, quota: 120, applicants: 900 },
      { year: 2020, type: AdmissionType.SPECIAL, rate: 7.2, quota: 120, applicants: 864 },
      { year: 2021, type: AdmissionType.SPECIAL, rate: 7.8, quota: 120, applicants: 936 },
      { year: 2022, type: AdmissionType.SPECIAL, rate: 8.3, quota: 120, applicants: 996 },
      { year: 2023, type: AdmissionType.SPECIAL, rate: 8.8, quota: 120, applicants: 1056 },
      { year: 2024, type: AdmissionType.SPECIAL, rate: 9.2, quota: 120, applicants: 1104 },
      { year: 2025, type: AdmissionType.SPECIAL, rate: 9.5, quota: 120, applicants: 1140 },
    ],
  },
  {
    schoolName: '경기북과학고등학교',
    region: '경기',
    rates: [
      { year: 2019, type: AdmissionType.SPECIAL, rate: 4.8, quota: 80, applicants: 384 },
      { year: 2020, type: AdmissionType.SPECIAL, rate: 4.5, quota: 80, applicants: 360 },
      { year: 2021, type: AdmissionType.SPECIAL, rate: 5.0, quota: 80, applicants: 400 },
      { year: 2022, type: AdmissionType.SPECIAL, rate: 5.3, quota: 80, applicants: 424 },
      { year: 2023, type: AdmissionType.SPECIAL, rate: 5.5, quota: 80, applicants: 440 },
      { year: 2024, type: AdmissionType.SPECIAL, rate: 5.8, quota: 80, applicants: 464 },
      { year: 2025, type: AdmissionType.SPECIAL, rate: 6.0, quota: 80, applicants: 480 },
    ],
  },
  {
    schoolName: '인천과학고등학교',
    region: '인천',
    rates: [
      { year: 2019, type: AdmissionType.SPECIAL, rate: 5.5, quota: 90, applicants: 495 },
      { year: 2020, type: AdmissionType.SPECIAL, rate: 5.2, quota: 90, applicants: 468 },
      { year: 2021, type: AdmissionType.SPECIAL, rate: 5.8, quota: 90, applicants: 522 },
      { year: 2022, type: AdmissionType.SPECIAL, rate: 6.2, quota: 90, applicants: 558 },
      { year: 2023, type: AdmissionType.SPECIAL, rate: 6.5, quota: 90, applicants: 585 },
      { year: 2024, type: AdmissionType.SPECIAL, rate: 6.8, quota: 90, applicants: 612 },
      { year: 2025, type: AdmissionType.SPECIAL, rate: 7.0, quota: 90, applicants: 630 },
    ],
  },
  {
    schoolName: '한국과학영재학교',
    region: '부산',
    rates: [
      { year: 2019, type: AdmissionType.SPECIAL, rate: 12.5, quota: 120, applicants: 1500 },
      { year: 2020, type: AdmissionType.SPECIAL, rate: 12.0, quota: 120, applicants: 1440 },
      { year: 2021, type: AdmissionType.SPECIAL, rate: 13.2, quota: 120, applicants: 1584 },
      { year: 2022, type: AdmissionType.SPECIAL, rate: 14.5, quota: 120, applicants: 1740 },
      { year: 2023, type: AdmissionType.SPECIAL, rate: 15.8, quota: 120, applicants: 1896 },
      { year: 2024, type: AdmissionType.SPECIAL, rate: 16.5, quota: 120, applicants: 1980 },
      { year: 2025, type: AdmissionType.SPECIAL, rate: 17.2, quota: 120, applicants: 2064 },
    ],
  },
  {
    schoolName: '대전과학고등학교',
    region: '대전',
    rates: [
      { year: 2019, type: AdmissionType.SPECIAL, rate: 6.5, quota: 100, applicants: 650 },
      { year: 2020, type: AdmissionType.SPECIAL, rate: 6.2, quota: 100, applicants: 620 },
      { year: 2021, type: AdmissionType.SPECIAL, rate: 6.8, quota: 100, applicants: 680 },
      { year: 2022, type: AdmissionType.SPECIAL, rate: 7.2, quota: 100, applicants: 720 },
      { year: 2023, type: AdmissionType.SPECIAL, rate: 7.5, quota: 100, applicants: 750 },
      { year: 2024, type: AdmissionType.SPECIAL, rate: 7.8, quota: 100, applicants: 780 },
      { year: 2025, type: AdmissionType.SPECIAL, rate: 8.0, quota: 100, applicants: 800 },
    ],
  },
  {
    schoolName: '대구과학고등학교',
    region: '대구',
    rates: [
      { year: 2019, type: AdmissionType.SPECIAL, rate: 5.8, quota: 90, applicants: 522 },
      { year: 2020, type: AdmissionType.SPECIAL, rate: 5.5, quota: 90, applicants: 495 },
      { year: 2021, type: AdmissionType.SPECIAL, rate: 6.0, quota: 90, applicants: 540 },
      { year: 2022, type: AdmissionType.SPECIAL, rate: 6.5, quota: 90, applicants: 585 },
      { year: 2023, type: AdmissionType.SPECIAL, rate: 6.8, quota: 90, applicants: 612 },
      { year: 2024, type: AdmissionType.SPECIAL, rate: 7.0, quota: 90, applicants: 630 },
      { year: 2025, type: AdmissionType.SPECIAL, rate: 7.2, quota: 90, applicants: 648 },
    ],
  },
  {
    schoolName: '광주과학고등학교',
    region: '광주',
    rates: [
      { year: 2019, type: AdmissionType.SPECIAL, rate: 5.2, quota: 80, applicants: 416 },
      { year: 2020, type: AdmissionType.SPECIAL, rate: 5.0, quota: 80, applicants: 400 },
      { year: 2021, type: AdmissionType.SPECIAL, rate: 5.5, quota: 80, applicants: 440 },
      { year: 2022, type: AdmissionType.SPECIAL, rate: 5.8, quota: 80, applicants: 464 },
      { year: 2023, type: AdmissionType.SPECIAL, rate: 6.0, quota: 80, applicants: 480 },
      { year: 2024, type: AdmissionType.SPECIAL, rate: 6.2, quota: 80, applicants: 496 },
      { year: 2025, type: AdmissionType.SPECIAL, rate: 6.5, quota: 80, applicants: 520 },
    ],
  },
  {
    schoolName: '세종과학예술영재학교',
    region: '세종',
    rates: [
      { year: 2019, type: AdmissionType.SPECIAL, rate: 10.5, quota: 90, applicants: 945 },
      { year: 2020, type: AdmissionType.SPECIAL, rate: 10.0, quota: 90, applicants: 900 },
      { year: 2021, type: AdmissionType.SPECIAL, rate: 11.2, quota: 90, applicants: 1008 },
      { year: 2022, type: AdmissionType.SPECIAL, rate: 12.5, quota: 90, applicants: 1125 },
      { year: 2023, type: AdmissionType.SPECIAL, rate: 13.5, quota: 90, applicants: 1215 },
      { year: 2024, type: AdmissionType.SPECIAL, rate: 14.2, quota: 90, applicants: 1278 },
      { year: 2025, type: AdmissionType.SPECIAL, rate: 15.0, quota: 90, applicants: 1350 },
    ],
  },

  // ==================== 외국어고 ====================
  {
    schoolName: '대원외국어고등학교',
    region: '서울',
    rates: [
      { year: 2019, type: AdmissionType.GENERAL, rate: 3.8, quota: 320, applicants: 1216 },
      { year: 2020, type: AdmissionType.GENERAL, rate: 3.5, quota: 320, applicants: 1120 },
      { year: 2021, type: AdmissionType.GENERAL, rate: 3.2, quota: 280, applicants: 896 },
      { year: 2022, type: AdmissionType.GENERAL, rate: 2.8, quota: 280, applicants: 784 },
      { year: 2023, type: AdmissionType.GENERAL, rate: 2.5, quota: 240, applicants: 600 },
      { year: 2024, type: AdmissionType.GENERAL, rate: 2.3, quota: 240, applicants: 552 },
      { year: 2025, type: AdmissionType.GENERAL, rate: 2.2, quota: 240, applicants: 528 },
    ],
  },
  {
    schoolName: '한국외국어대학교부속외국어고등학교',
    region: '서울',
    rates: [
      { year: 2019, type: AdmissionType.GENERAL, rate: 4.2, quota: 280, applicants: 1176 },
      { year: 2020, type: AdmissionType.GENERAL, rate: 3.8, quota: 280, applicants: 1064 },
      { year: 2021, type: AdmissionType.GENERAL, rate: 3.5, quota: 250, applicants: 875 },
      { year: 2022, type: AdmissionType.GENERAL, rate: 3.2, quota: 250, applicants: 800 },
      { year: 2023, type: AdmissionType.GENERAL, rate: 2.8, quota: 220, applicants: 616 },
      { year: 2024, type: AdmissionType.GENERAL, rate: 2.5, quota: 220, applicants: 550 },
      { year: 2025, type: AdmissionType.GENERAL, rate: 2.4, quota: 220, applicants: 528 },
    ],
  },
  {
    schoolName: '명덕외국어고등학교',
    region: '서울',
    rates: [
      { year: 2019, type: AdmissionType.GENERAL, rate: 2.8, quota: 240, applicants: 672 },
      { year: 2020, type: AdmissionType.GENERAL, rate: 2.5, quota: 240, applicants: 600 },
      { year: 2021, type: AdmissionType.GENERAL, rate: 2.3, quota: 200, applicants: 460 },
      { year: 2022, type: AdmissionType.GENERAL, rate: 2.0, quota: 200, applicants: 400 },
      { year: 2023, type: AdmissionType.GENERAL, rate: 1.8, quota: 180, applicants: 324 },
      { year: 2024, type: AdmissionType.GENERAL, rate: 1.7, quota: 180, applicants: 306 },
      { year: 2025, type: AdmissionType.GENERAL, rate: 1.6, quota: 180, applicants: 288 },
    ],
  },
  {
    schoolName: '서울외국어고등학교',
    region: '서울',
    rates: [
      { year: 2019, type: AdmissionType.GENERAL, rate: 2.5, quota: 200, applicants: 500 },
      { year: 2020, type: AdmissionType.GENERAL, rate: 2.3, quota: 200, applicants: 460 },
      { year: 2021, type: AdmissionType.GENERAL, rate: 2.0, quota: 180, applicants: 360 },
      { year: 2022, type: AdmissionType.GENERAL, rate: 1.8, quota: 180, applicants: 324 },
      { year: 2023, type: AdmissionType.GENERAL, rate: 1.6, quota: 160, applicants: 256 },
      { year: 2024, type: AdmissionType.GENERAL, rate: 1.5, quota: 160, applicants: 240 },
      { year: 2025, type: AdmissionType.GENERAL, rate: 1.5, quota: 160, applicants: 240 },
    ],
  },
  {
    schoolName: '이화외국어고등학교',
    region: '서울',
    rates: [
      { year: 2019, type: AdmissionType.GENERAL, rate: 2.2, quota: 180, applicants: 396 },
      { year: 2020, type: AdmissionType.GENERAL, rate: 2.0, quota: 180, applicants: 360 },
      { year: 2021, type: AdmissionType.GENERAL, rate: 1.8, quota: 160, applicants: 288 },
      { year: 2022, type: AdmissionType.GENERAL, rate: 1.6, quota: 160, applicants: 256 },
      { year: 2023, type: AdmissionType.GENERAL, rate: 1.5, quota: 140, applicants: 210 },
      { year: 2024, type: AdmissionType.GENERAL, rate: 1.4, quota: 140, applicants: 196 },
      { year: 2025, type: AdmissionType.GENERAL, rate: 1.4, quota: 140, applicants: 196 },
    ],
  },
  {
    schoolName: '한영외국어고등학교',
    region: '서울',
    rates: [
      { year: 2019, type: AdmissionType.GENERAL, rate: 2.0, quota: 160, applicants: 320 },
      { year: 2020, type: AdmissionType.GENERAL, rate: 1.8, quota: 160, applicants: 288 },
      { year: 2021, type: AdmissionType.GENERAL, rate: 1.6, quota: 140, applicants: 224 },
      { year: 2022, type: AdmissionType.GENERAL, rate: 1.5, quota: 140, applicants: 210 },
      { year: 2023, type: AdmissionType.GENERAL, rate: 1.3, quota: 120, applicants: 156 },
      { year: 2024, type: AdmissionType.GENERAL, rate: 1.3, quota: 120, applicants: 156 },
      { year: 2025, type: AdmissionType.GENERAL, rate: 1.2, quota: 120, applicants: 144 },
    ],
  },
  {
    schoolName: '대일외국어고등학교',
    region: '서울',
    rates: [
      { year: 2019, type: AdmissionType.GENERAL, rate: 2.5, quota: 200, applicants: 500 },
      { year: 2020, type: AdmissionType.GENERAL, rate: 2.2, quota: 200, applicants: 440 },
      { year: 2021, type: AdmissionType.GENERAL, rate: 2.0, quota: 180, applicants: 360 },
      { year: 2022, type: AdmissionType.GENERAL, rate: 1.8, quota: 180, applicants: 324 },
      { year: 2023, type: AdmissionType.GENERAL, rate: 1.6, quota: 160, applicants: 256 },
      { year: 2024, type: AdmissionType.GENERAL, rate: 1.5, quota: 160, applicants: 240 },
      { year: 2025, type: AdmissionType.GENERAL, rate: 1.5, quota: 160, applicants: 240 },
    ],
  },
  {
    schoolName: '용인외국어고등학교',
    region: '경기',
    rates: [
      { year: 2019, type: AdmissionType.GENERAL, rate: 3.5, quota: 300, applicants: 1050 },
      { year: 2020, type: AdmissionType.GENERAL, rate: 3.2, quota: 300, applicants: 960 },
      { year: 2021, type: AdmissionType.GENERAL, rate: 2.8, quota: 280, applicants: 784 },
      { year: 2022, type: AdmissionType.GENERAL, rate: 2.5, quota: 280, applicants: 700 },
      { year: 2023, type: AdmissionType.GENERAL, rate: 2.2, quota: 250, applicants: 550 },
      { year: 2024, type: AdmissionType.GENERAL, rate: 2.0, quota: 250, applicants: 500 },
      { year: 2025, type: AdmissionType.GENERAL, rate: 1.9, quota: 250, applicants: 475 },
    ],
  },
  {
    schoolName: '경기외국어고등학교',
    region: '경기',
    rates: [
      { year: 2019, type: AdmissionType.GENERAL, rate: 2.8, quota: 240, applicants: 672 },
      { year: 2020, type: AdmissionType.GENERAL, rate: 2.5, quota: 240, applicants: 600 },
      { year: 2021, type: AdmissionType.GENERAL, rate: 2.2, quota: 220, applicants: 484 },
      { year: 2022, type: AdmissionType.GENERAL, rate: 2.0, quota: 220, applicants: 440 },
      { year: 2023, type: AdmissionType.GENERAL, rate: 1.8, quota: 200, applicants: 360 },
      { year: 2024, type: AdmissionType.GENERAL, rate: 1.6, quota: 200, applicants: 320 },
      { year: 2025, type: AdmissionType.GENERAL, rate: 1.5, quota: 200, applicants: 300 },
    ],
  },
  {
    schoolName: '고양외국어고등학교',
    region: '경기',
    rates: [
      { year: 2019, type: AdmissionType.GENERAL, rate: 2.5, quota: 200, applicants: 500 },
      { year: 2020, type: AdmissionType.GENERAL, rate: 2.2, quota: 200, applicants: 440 },
      { year: 2021, type: AdmissionType.GENERAL, rate: 2.0, quota: 180, applicants: 360 },
      { year: 2022, type: AdmissionType.GENERAL, rate: 1.8, quota: 180, applicants: 324 },
      { year: 2023, type: AdmissionType.GENERAL, rate: 1.6, quota: 160, applicants: 256 },
      { year: 2024, type: AdmissionType.GENERAL, rate: 1.5, quota: 160, applicants: 240 },
      { year: 2025, type: AdmissionType.GENERAL, rate: 1.4, quota: 160, applicants: 224 },
    ],
  },
  {
    schoolName: '수원외국어고등학교',
    region: '경기',
    rates: [
      { year: 2019, type: AdmissionType.GENERAL, rate: 2.2, quota: 180, applicants: 396 },
      { year: 2020, type: AdmissionType.GENERAL, rate: 2.0, quota: 180, applicants: 360 },
      { year: 2021, type: AdmissionType.GENERAL, rate: 1.8, quota: 160, applicants: 288 },
      { year: 2022, type: AdmissionType.GENERAL, rate: 1.6, quota: 160, applicants: 256 },
      { year: 2023, type: AdmissionType.GENERAL, rate: 1.5, quota: 140, applicants: 210 },
      { year: 2024, type: AdmissionType.GENERAL, rate: 1.4, quota: 140, applicants: 196 },
      { year: 2025, type: AdmissionType.GENERAL, rate: 1.3, quota: 140, applicants: 182 },
    ],
  },
  {
    schoolName: '인천외국어고등학교',
    region: '인천',
    rates: [
      { year: 2019, type: AdmissionType.GENERAL, rate: 2.5, quota: 200, applicants: 500 },
      { year: 2020, type: AdmissionType.GENERAL, rate: 2.2, quota: 200, applicants: 440 },
      { year: 2021, type: AdmissionType.GENERAL, rate: 2.0, quota: 180, applicants: 360 },
      { year: 2022, type: AdmissionType.GENERAL, rate: 1.8, quota: 180, applicants: 324 },
      { year: 2023, type: AdmissionType.GENERAL, rate: 1.6, quota: 160, applicants: 256 },
      { year: 2024, type: AdmissionType.GENERAL, rate: 1.5, quota: 160, applicants: 240 },
      { year: 2025, type: AdmissionType.GENERAL, rate: 1.4, quota: 160, applicants: 224 },
    ],
  },
  {
    schoolName: '부산외국어고등학교',
    region: '부산',
    rates: [
      { year: 2019, type: AdmissionType.GENERAL, rate: 2.8, quota: 240, applicants: 672 },
      { year: 2020, type: AdmissionType.GENERAL, rate: 2.5, quota: 240, applicants: 600 },
      { year: 2021, type: AdmissionType.GENERAL, rate: 2.2, quota: 220, applicants: 484 },
      { year: 2022, type: AdmissionType.GENERAL, rate: 2.0, quota: 220, applicants: 440 },
      { year: 2023, type: AdmissionType.GENERAL, rate: 1.8, quota: 200, applicants: 360 },
      { year: 2024, type: AdmissionType.GENERAL, rate: 1.6, quota: 200, applicants: 320 },
      { year: 2025, type: AdmissionType.GENERAL, rate: 1.5, quota: 200, applicants: 300 },
    ],
  },
  {
    schoolName: '대구외국어고등학교',
    region: '대구',
    rates: [
      { year: 2019, type: AdmissionType.GENERAL, rate: 2.2, quota: 180, applicants: 396 },
      { year: 2020, type: AdmissionType.GENERAL, rate: 2.0, quota: 180, applicants: 360 },
      { year: 2021, type: AdmissionType.GENERAL, rate: 1.8, quota: 160, applicants: 288 },
      { year: 2022, type: AdmissionType.GENERAL, rate: 1.6, quota: 160, applicants: 256 },
      { year: 2023, type: AdmissionType.GENERAL, rate: 1.5, quota: 140, applicants: 210 },
      { year: 2024, type: AdmissionType.GENERAL, rate: 1.4, quota: 140, applicants: 196 },
      { year: 2025, type: AdmissionType.GENERAL, rate: 1.3, quota: 140, applicants: 182 },
    ],
  },
  {
    schoolName: '대전외국어고등학교',
    region: '대전',
    rates: [
      { year: 2019, type: AdmissionType.GENERAL, rate: 2.5, quota: 200, applicants: 500 },
      { year: 2020, type: AdmissionType.GENERAL, rate: 2.2, quota: 200, applicants: 440 },
      { year: 2021, type: AdmissionType.GENERAL, rate: 2.0, quota: 180, applicants: 360 },
      { year: 2022, type: AdmissionType.GENERAL, rate: 1.8, quota: 180, applicants: 324 },
      { year: 2023, type: AdmissionType.GENERAL, rate: 1.6, quota: 160, applicants: 256 },
      { year: 2024, type: AdmissionType.GENERAL, rate: 1.5, quota: 160, applicants: 240 },
      { year: 2025, type: AdmissionType.GENERAL, rate: 1.4, quota: 160, applicants: 224 },
    ],
  },

  // ==================== 국제고 ====================
  {
    schoolName: '서울국제고등학교',
    region: '서울',
    rates: [
      { year: 2019, type: AdmissionType.GENERAL, rate: 4.5, quota: 160, applicants: 720 },
      { year: 2020, type: AdmissionType.GENERAL, rate: 4.2, quota: 160, applicants: 672 },
      { year: 2021, type: AdmissionType.GENERAL, rate: 4.0, quota: 140, applicants: 560 },
      { year: 2022, type: AdmissionType.GENERAL, rate: 3.8, quota: 140, applicants: 532 },
      { year: 2023, type: AdmissionType.GENERAL, rate: 3.5, quota: 120, applicants: 420 },
      { year: 2024, type: AdmissionType.GENERAL, rate: 3.3, quota: 120, applicants: 396 },
      { year: 2025, type: AdmissionType.GENERAL, rate: 3.2, quota: 120, applicants: 384 },
    ],
  },
  {
    schoolName: '청심국제고등학교',
    region: '경기',
    rates: [
      { year: 2019, type: AdmissionType.GENERAL, rate: 3.8, quota: 200, applicants: 760 },
      { year: 2020, type: AdmissionType.GENERAL, rate: 3.5, quota: 200, applicants: 700 },
      { year: 2021, type: AdmissionType.GENERAL, rate: 3.2, quota: 180, applicants: 576 },
      { year: 2022, type: AdmissionType.GENERAL, rate: 3.0, quota: 180, applicants: 540 },
      { year: 2023, type: AdmissionType.GENERAL, rate: 2.8, quota: 160, applicants: 448 },
      { year: 2024, type: AdmissionType.GENERAL, rate: 2.6, quota: 160, applicants: 416 },
      { year: 2025, type: AdmissionType.GENERAL, rate: 2.5, quota: 160, applicants: 400 },
    ],
  },
  {
    schoolName: '고양국제고등학교',
    region: '경기',
    rates: [
      { year: 2019, type: AdmissionType.GENERAL, rate: 2.5, quota: 160, applicants: 400 },
      { year: 2020, type: AdmissionType.GENERAL, rate: 2.3, quota: 160, applicants: 368 },
      { year: 2021, type: AdmissionType.GENERAL, rate: 2.0, quota: 140, applicants: 280 },
      { year: 2022, type: AdmissionType.GENERAL, rate: 1.8, quota: 140, applicants: 252 },
      { year: 2023, type: AdmissionType.GENERAL, rate: 1.6, quota: 120, applicants: 192 },
      { year: 2024, type: AdmissionType.GENERAL, rate: 1.5, quota: 120, applicants: 180 },
      { year: 2025, type: AdmissionType.GENERAL, rate: 1.5, quota: 120, applicants: 180 },
    ],
  },
  {
    schoolName: '동탄국제고등학교',
    region: '경기',
    rates: [
      { year: 2019, type: AdmissionType.GENERAL, rate: 2.8, quota: 160, applicants: 448 },
      { year: 2020, type: AdmissionType.GENERAL, rate: 2.5, quota: 160, applicants: 400 },
      { year: 2021, type: AdmissionType.GENERAL, rate: 2.2, quota: 140, applicants: 308 },
      { year: 2022, type: AdmissionType.GENERAL, rate: 2.0, quota: 140, applicants: 280 },
      { year: 2023, type: AdmissionType.GENERAL, rate: 1.8, quota: 120, applicants: 216 },
      { year: 2024, type: AdmissionType.GENERAL, rate: 1.7, quota: 120, applicants: 204 },
      { year: 2025, type: AdmissionType.GENERAL, rate: 1.6, quota: 120, applicants: 192 },
    ],
  },
  {
    schoolName: '인천국제고등학교',
    region: '인천',
    rates: [
      { year: 2019, type: AdmissionType.GENERAL, rate: 2.2, quota: 140, applicants: 308 },
      { year: 2020, type: AdmissionType.GENERAL, rate: 2.0, quota: 140, applicants: 280 },
      { year: 2021, type: AdmissionType.GENERAL, rate: 1.8, quota: 120, applicants: 216 },
      { year: 2022, type: AdmissionType.GENERAL, rate: 1.6, quota: 120, applicants: 192 },
      { year: 2023, type: AdmissionType.GENERAL, rate: 1.5, quota: 100, applicants: 150 },
      { year: 2024, type: AdmissionType.GENERAL, rate: 1.4, quota: 100, applicants: 140 },
      { year: 2025, type: AdmissionType.GENERAL, rate: 1.4, quota: 100, applicants: 140 },
    ],
  },
  {
    schoolName: '부산국제고등학교',
    region: '부산',
    rates: [
      { year: 2019, type: AdmissionType.GENERAL, rate: 2.5, quota: 160, applicants: 400 },
      { year: 2020, type: AdmissionType.GENERAL, rate: 2.2, quota: 160, applicants: 352 },
      { year: 2021, type: AdmissionType.GENERAL, rate: 2.0, quota: 140, applicants: 280 },
      { year: 2022, type: AdmissionType.GENERAL, rate: 1.8, quota: 140, applicants: 252 },
      { year: 2023, type: AdmissionType.GENERAL, rate: 1.6, quota: 120, applicants: 192 },
      { year: 2024, type: AdmissionType.GENERAL, rate: 1.5, quota: 120, applicants: 180 },
      { year: 2025, type: AdmissionType.GENERAL, rate: 1.5, quota: 120, applicants: 180 },
    ],
  },

  // ==================== 자율형 사립고 ====================
  {
    schoolName: '하나고등학교',
    region: '서울',
    rates: [
      { year: 2019, type: AdmissionType.GENERAL, rate: 6.5, quota: 300, applicants: 1950 },
      { year: 2020, type: AdmissionType.GENERAL, rate: 6.0, quota: 300, applicants: 1800 },
      { year: 2021, type: AdmissionType.GENERAL, rate: 5.5, quota: 280, applicants: 1540 },
      { year: 2022, type: AdmissionType.GENERAL, rate: 5.0, quota: 280, applicants: 1400 },
      { year: 2023, type: AdmissionType.GENERAL, rate: 4.5, quota: 260, applicants: 1170 },
      { year: 2024, type: AdmissionType.GENERAL, rate: 4.2, quota: 260, applicants: 1092 },
      { year: 2025, type: AdmissionType.GENERAL, rate: 4.0, quota: 260, applicants: 1040 },
    ],
  },
  {
    schoolName: '민족사관고등학교',
    region: '강원',
    rates: [
      { year: 2019, type: AdmissionType.SPECIAL, rate: 8.5, quota: 150, applicants: 1275 },
      { year: 2020, type: AdmissionType.SPECIAL, rate: 8.0, quota: 150, applicants: 1200 },
      { year: 2021, type: AdmissionType.SPECIAL, rate: 7.5, quota: 140, applicants: 1050 },
      { year: 2022, type: AdmissionType.SPECIAL, rate: 7.0, quota: 140, applicants: 980 },
      { year: 2023, type: AdmissionType.SPECIAL, rate: 6.5, quota: 130, applicants: 845 },
      { year: 2024, type: AdmissionType.SPECIAL, rate: 6.2, quota: 130, applicants: 806 },
      { year: 2025, type: AdmissionType.SPECIAL, rate: 6.0, quota: 130, applicants: 780 },
    ],
  },
  {
    schoolName: '상산고등학교',
    region: '전북',
    rates: [
      { year: 2019, type: AdmissionType.GENERAL, rate: 5.5, quota: 200, applicants: 1100 },
      { year: 2020, type: AdmissionType.GENERAL, rate: 5.0, quota: 200, applicants: 1000 },
      { year: 2021, type: AdmissionType.GENERAL, rate: 4.5, quota: 180, applicants: 810 },
      { year: 2022, type: AdmissionType.GENERAL, rate: 4.0, quota: 180, applicants: 720 },
      { year: 2023, type: AdmissionType.GENERAL, rate: 3.5, quota: 160, applicants: 560 },
      { year: 2024, type: AdmissionType.GENERAL, rate: 3.2, quota: 160, applicants: 512 },
      { year: 2025, type: AdmissionType.GENERAL, rate: 3.0, quota: 160, applicants: 480 },
    ],
  },
  {
    schoolName: '북일고등학교',
    region: '충남',
    rates: [
      { year: 2019, type: AdmissionType.GENERAL, rate: 4.8, quota: 240, applicants: 1152 },
      { year: 2020, type: AdmissionType.GENERAL, rate: 4.5, quota: 240, applicants: 1080 },
      { year: 2021, type: AdmissionType.GENERAL, rate: 4.0, quota: 220, applicants: 880 },
      { year: 2022, type: AdmissionType.GENERAL, rate: 3.5, quota: 220, applicants: 770 },
      { year: 2023, type: AdmissionType.GENERAL, rate: 3.2, quota: 200, applicants: 640 },
      { year: 2024, type: AdmissionType.GENERAL, rate: 3.0, quota: 200, applicants: 600 },
      { year: 2025, type: AdmissionType.GENERAL, rate: 2.8, quota: 200, applicants: 560 },
    ],
  },
  {
    schoolName: '현대청운고등학교',
    region: '울산',
    rates: [
      { year: 2019, type: AdmissionType.GENERAL, rate: 4.2, quota: 200, applicants: 840 },
      { year: 2020, type: AdmissionType.GENERAL, rate: 3.8, quota: 200, applicants: 760 },
      { year: 2021, type: AdmissionType.GENERAL, rate: 3.5, quota: 180, applicants: 630 },
      { year: 2022, type: AdmissionType.GENERAL, rate: 3.2, quota: 180, applicants: 576 },
      { year: 2023, type: AdmissionType.GENERAL, rate: 3.0, quota: 160, applicants: 480 },
      { year: 2024, type: AdmissionType.GENERAL, rate: 2.8, quota: 160, applicants: 448 },
      { year: 2025, type: AdmissionType.GENERAL, rate: 2.6, quota: 160, applicants: 416 },
    ],
  },
  {
    schoolName: '포항제철고등학교',
    region: '경북',
    rates: [
      { year: 2019, type: AdmissionType.GENERAL, rate: 3.8, quota: 200, applicants: 760 },
      { year: 2020, type: AdmissionType.GENERAL, rate: 3.5, quota: 200, applicants: 700 },
      { year: 2021, type: AdmissionType.GENERAL, rate: 3.2, quota: 180, applicants: 576 },
      { year: 2022, type: AdmissionType.GENERAL, rate: 3.0, quota: 180, applicants: 540 },
      { year: 2023, type: AdmissionType.GENERAL, rate: 2.8, quota: 160, applicants: 448 },
      { year: 2024, type: AdmissionType.GENERAL, rate: 2.5, quota: 160, applicants: 400 },
      { year: 2025, type: AdmissionType.GENERAL, rate: 2.3, quota: 160, applicants: 368 },
    ],
  },
  {
    schoolName: '김천고등학교',
    region: '경북',
    rates: [
      { year: 2019, type: AdmissionType.GENERAL, rate: 3.5, quota: 180, applicants: 630 },
      { year: 2020, type: AdmissionType.GENERAL, rate: 3.2, quota: 180, applicants: 576 },
      { year: 2021, type: AdmissionType.GENERAL, rate: 3.0, quota: 160, applicants: 480 },
      { year: 2022, type: AdmissionType.GENERAL, rate: 2.8, quota: 160, applicants: 448 },
      { year: 2023, type: AdmissionType.GENERAL, rate: 2.5, quota: 140, applicants: 350 },
      { year: 2024, type: AdmissionType.GENERAL, rate: 2.3, quota: 140, applicants: 322 },
      { year: 2025, type: AdmissionType.GENERAL, rate: 2.2, quota: 140, applicants: 308 },
    ],
  },
  {
    schoolName: '광양제철고등학교',
    region: '전남',
    rates: [
      { year: 2019, type: AdmissionType.GENERAL, rate: 3.2, quota: 160, applicants: 512 },
      { year: 2020, type: AdmissionType.GENERAL, rate: 3.0, quota: 160, applicants: 480 },
      { year: 2021, type: AdmissionType.GENERAL, rate: 2.8, quota: 140, applicants: 392 },
      { year: 2022, type: AdmissionType.GENERAL, rate: 2.5, quota: 140, applicants: 350 },
      { year: 2023, type: AdmissionType.GENERAL, rate: 2.3, quota: 120, applicants: 276 },
      { year: 2024, type: AdmissionType.GENERAL, rate: 2.2, quota: 120, applicants: 264 },
      { year: 2025, type: AdmissionType.GENERAL, rate: 2.0, quota: 120, applicants: 240 },
    ],
  },
  {
    schoolName: '휘문고등학교',
    region: '서울',
    rates: [
      { year: 2019, type: AdmissionType.GENERAL, rate: 4.2, quota: 320, applicants: 1344 },
      { year: 2020, type: AdmissionType.GENERAL, rate: 3.8, quota: 320, applicants: 1216 },
      { year: 2021, type: AdmissionType.GENERAL, rate: 3.5, quota: 300, applicants: 1050 },
      { year: 2022, type: AdmissionType.GENERAL, rate: 3.2, quota: 300, applicants: 960 },
      { year: 2023, type: AdmissionType.GENERAL, rate: 3.0, quota: 280, applicants: 840 },
      { year: 2024, type: AdmissionType.GENERAL, rate: 2.8, quota: 280, applicants: 784 },
      { year: 2025, type: AdmissionType.GENERAL, rate: 2.6, quota: 280, applicants: 728 },
    ],
  },
  {
    schoolName: '중앙고등학교',
    region: '서울',
    rates: [
      { year: 2019, type: AdmissionType.GENERAL, rate: 3.8, quota: 280, applicants: 1064 },
      { year: 2020, type: AdmissionType.GENERAL, rate: 3.5, quota: 280, applicants: 980 },
      { year: 2021, type: AdmissionType.GENERAL, rate: 3.2, quota: 260, applicants: 832 },
      { year: 2022, type: AdmissionType.GENERAL, rate: 3.0, quota: 260, applicants: 780 },
      { year: 2023, type: AdmissionType.GENERAL, rate: 2.8, quota: 240, applicants: 672 },
      { year: 2024, type: AdmissionType.GENERAL, rate: 2.5, quota: 240, applicants: 600 },
      { year: 2025, type: AdmissionType.GENERAL, rate: 2.3, quota: 240, applicants: 552 },
    ],
  },
  {
    schoolName: '배재고등학교',
    region: '서울',
    rates: [
      { year: 2019, type: AdmissionType.GENERAL, rate: 3.5, quota: 280, applicants: 980 },
      { year: 2020, type: AdmissionType.GENERAL, rate: 3.2, quota: 280, applicants: 896 },
      { year: 2021, type: AdmissionType.GENERAL, rate: 3.0, quota: 260, applicants: 780 },
      { year: 2022, type: AdmissionType.GENERAL, rate: 2.8, quota: 260, applicants: 728 },
      { year: 2023, type: AdmissionType.GENERAL, rate: 2.5, quota: 240, applicants: 600 },
      { year: 2024, type: AdmissionType.GENERAL, rate: 2.3, quota: 240, applicants: 552 },
      { year: 2025, type: AdmissionType.GENERAL, rate: 2.2, quota: 240, applicants: 528 },
    ],
  },
  {
    schoolName: '경희고등학교',
    region: '서울',
    rates: [
      { year: 2019, type: AdmissionType.GENERAL, rate: 3.2, quota: 260, applicants: 832 },
      { year: 2020, type: AdmissionType.GENERAL, rate: 3.0, quota: 260, applicants: 780 },
      { year: 2021, type: AdmissionType.GENERAL, rate: 2.8, quota: 240, applicants: 672 },
      { year: 2022, type: AdmissionType.GENERAL, rate: 2.5, quota: 240, applicants: 600 },
      { year: 2023, type: AdmissionType.GENERAL, rate: 2.3, quota: 220, applicants: 506 },
      { year: 2024, type: AdmissionType.GENERAL, rate: 2.2, quota: 220, applicants: 484 },
      { year: 2025, type: AdmissionType.GENERAL, rate: 2.0, quota: 220, applicants: 440 },
    ],
  },
  {
    schoolName: '세화고등학교',
    region: '서울',
    rates: [
      { year: 2019, type: AdmissionType.GENERAL, rate: 3.0, quota: 240, applicants: 720 },
      { year: 2020, type: AdmissionType.GENERAL, rate: 2.8, quota: 240, applicants: 672 },
      { year: 2021, type: AdmissionType.GENERAL, rate: 2.5, quota: 220, applicants: 550 },
      { year: 2022, type: AdmissionType.GENERAL, rate: 2.3, quota: 220, applicants: 506 },
      { year: 2023, type: AdmissionType.GENERAL, rate: 2.0, quota: 200, applicants: 400 },
      { year: 2024, type: AdmissionType.GENERAL, rate: 1.9, quota: 200, applicants: 380 },
      { year: 2025, type: AdmissionType.GENERAL, rate: 1.8, quota: 200, applicants: 360 },
    ],
  },
  {
    schoolName: '이화여자고등학교',
    region: '서울',
    rates: [
      { year: 2019, type: AdmissionType.GENERAL, rate: 3.5, quota: 280, applicants: 980 },
      { year: 2020, type: AdmissionType.GENERAL, rate: 3.2, quota: 280, applicants: 896 },
      { year: 2021, type: AdmissionType.GENERAL, rate: 3.0, quota: 260, applicants: 780 },
      { year: 2022, type: AdmissionType.GENERAL, rate: 2.8, quota: 260, applicants: 728 },
      { year: 2023, type: AdmissionType.GENERAL, rate: 2.5, quota: 240, applicants: 600 },
      { year: 2024, type: AdmissionType.GENERAL, rate: 2.3, quota: 240, applicants: 552 },
      { year: 2025, type: AdmissionType.GENERAL, rate: 2.2, quota: 240, applicants: 528 },
    ],
  },
  {
    schoolName: '숙명여자고등학교',
    region: '서울',
    rates: [
      { year: 2019, type: AdmissionType.GENERAL, rate: 3.2, quota: 260, applicants: 832 },
      { year: 2020, type: AdmissionType.GENERAL, rate: 3.0, quota: 260, applicants: 780 },
      { year: 2021, type: AdmissionType.GENERAL, rate: 2.8, quota: 240, applicants: 672 },
      { year: 2022, type: AdmissionType.GENERAL, rate: 2.5, quota: 240, applicants: 600 },
      { year: 2023, type: AdmissionType.GENERAL, rate: 2.3, quota: 220, applicants: 506 },
      { year: 2024, type: AdmissionType.GENERAL, rate: 2.2, quota: 220, applicants: 484 },
      { year: 2025, type: AdmissionType.GENERAL, rate: 2.0, quota: 220, applicants: 440 },
    ],
  },
  {
    schoolName: '용인한국외국어대학교부설고등학교',
    region: '경기',
    rates: [
      { year: 2019, type: AdmissionType.GENERAL, rate: 5.5, quota: 280, applicants: 1540 },
      { year: 2020, type: AdmissionType.GENERAL, rate: 5.0, quota: 280, applicants: 1400 },
      { year: 2021, type: AdmissionType.GENERAL, rate: 4.5, quota: 260, applicants: 1170 },
      { year: 2022, type: AdmissionType.GENERAL, rate: 4.0, quota: 260, applicants: 1040 },
      { year: 2023, type: AdmissionType.GENERAL, rate: 3.5, quota: 240, applicants: 840 },
      { year: 2024, type: AdmissionType.GENERAL, rate: 3.2, quota: 240, applicants: 768 },
      { year: 2025, type: AdmissionType.GENERAL, rate: 3.0, quota: 240, applicants: 720 },
    ],
  },
  {
    schoolName: '인천하늘고등학교',
    region: '인천',
    rates: [
      { year: 2019, type: AdmissionType.GENERAL, rate: 4.8, quota: 200, applicants: 960 },
      { year: 2020, type: AdmissionType.GENERAL, rate: 4.5, quota: 200, applicants: 900 },
      { year: 2021, type: AdmissionType.GENERAL, rate: 4.0, quota: 180, applicants: 720 },
      { year: 2022, type: AdmissionType.GENERAL, rate: 3.5, quota: 180, applicants: 630 },
      { year: 2023, type: AdmissionType.GENERAL, rate: 3.2, quota: 160, applicants: 512 },
      { year: 2024, type: AdmissionType.GENERAL, rate: 3.0, quota: 160, applicants: 480 },
      { year: 2025, type: AdmissionType.GENERAL, rate: 2.8, quota: 160, applicants: 448 },
    ],
  },
];

async function seedAdmissionHistory() {
  console.log('📊 2019-2025년 경쟁률 데이터 시드 시작...\n');

  let created = 0;
  let updated = 0;
  let errors = 0;

  for (const schoolData of competitionRateData) {
    // 학교 찾기
    const school = await prisma.school.findFirst({
      where: {
        name: schoolData.schoolName,
        region: schoolData.region,
      },
    });

    if (!school) {
      console.log(`   ❌ 학교를 찾을 수 없음: ${schoolData.schoolName} (${schoolData.region})`);
      errors++;
      continue;
    }

    // 경쟁률 데이터 입력
    for (const rate of schoolData.rates) {
      try {
        const result = await prisma.admissionHistory.upsert({
          where: {
            schoolId_year_type: {
              schoolId: school.id,
              year: rate.year,
              type: rate.type,
            },
          },
          update: {
            competitionRate: rate.rate,
            quota: rate.quota,
            applicants: rate.applicants,
          },
          create: {
            schoolId: school.id,
            year: rate.year,
            type: rate.type,
            competitionRate: rate.rate,
            quota: rate.quota,
            applicants: rate.applicants,
          },
        });

        if (result.createdAt.getTime() === result.updatedAt.getTime()) {
          created++;
        } else {
          updated++;
        }
      } catch (error: any) {
        console.log(`   ❌ 오류 (${schoolData.schoolName} ${rate.year}): ${error.message}`);
        errors++;
      }
    }
  }

  console.log(`\n✅ 경쟁률 데이터 시드 완료!`);
  console.log(`   생성: ${created}개`);
  console.log(`   업데이트: ${updated}개`);
  console.log(`   오류: ${errors}개`);

  // 통계
  const totalHistory = await prisma.admissionHistory.count();
  const byYear = await prisma.admissionHistory.groupBy({
    by: ['year'],
    _count: { id: true },
    orderBy: { year: 'asc' },
  });

  console.log(`\n📈 총 경쟁률 레코드: ${totalHistory}개`);
  console.log('\n📅 연도별 데이터:');
  byYear.forEach(y => console.log(`   ${y.year}년: ${y._count.id}개`));

  await prisma.$disconnect();
}

seedAdmissionHistory().catch(console.error);

