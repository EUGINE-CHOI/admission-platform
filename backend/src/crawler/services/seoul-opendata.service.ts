import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * 서울 열린데이터광장 동아리 데이터 구조
 * 데이터셋: 서울시 학교별 동아리 활동 현황 (OA-22340)
 * URL: https://data.seoul.go.kr/dataList/OA-22340/S/1/datasetView.do
 */
export interface SeoulClubData {
  ATPT_OFCDC_SC_NM: string;    // 시도교육청명
  SD_SCHUL_NM: string;         // 학교명
  AY: string;                  // 학년도
  DGHT_CRSE_SC_NM: string;     // 주야과정명
  ORD_SC_NM: string;           // 계열명
  DDDEP_NM: string;            // 학과명
  GRADE: string;               // 학년
  CLSRM_NM: string;            // 반명
  CLUB_NM: string;             // 동아리명
  CLUB_PSN_CNT: string;        // 동아리인원수
  LOAD_DTM: string;            // 적재일시
}

export interface ClubInfo {
  schoolName: string;
  clubName: string;
  memberCount: number;
  year: string;
  grade?: string;
  className?: string;
}

export interface SeoulOpenDataResult {
  success: boolean;
  totalCount: number;
  clubs: ClubInfo[];
  error?: string;
}

@Injectable()
export class SeoulOpenDataService {
  private readonly logger = new Logger(SeoulOpenDataService.name);
  
  // 서울 열린데이터광장 API 설정
  // 실제 사용시 인증키 필요 (https://data.seoul.go.kr에서 발급)
  private readonly API_BASE_URL = 'http://openapi.seoul.go.kr:8088';
  private readonly API_KEY = process.env.SEOUL_OPENDATA_API_KEY || 'sample';
  private readonly SERVICE_NAME = 'ClubInfo'; // 실제 서비스명 확인 필요

  constructor(private prisma: PrismaService) {}

  /**
   * 서울시 학교 동아리 데이터 조회
   * @param schoolName 학교명 (선택)
   * @param startIndex 시작 인덱스
   * @param endIndex 종료 인덱스
   */
  async fetchClubData(
    schoolName?: string,
    startIndex: number = 1,
    endIndex: number = 100
  ): Promise<SeoulOpenDataResult> {
    try {
      // API URL 구성
      // 형식: http://openapi.seoul.go.kr:8088/{인증키}/json/{서비스명}/{시작}/{끝}
      const url = `${this.API_BASE_URL}/${this.API_KEY}/json/${this.SERVICE_NAME}/${startIndex}/${endIndex}`;
      
      this.logger.log(`서울 열린데이터 API 호출: ${url}`);

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API 응답 오류: ${response.status}`);
      }

      const data = await response.json();
      
      // API 응답 구조에 따라 파싱
      if (data.RESULT && data.RESULT.CODE !== 'INFO-000') {
        throw new Error(`API 오류: ${data.RESULT.MESSAGE}`);
      }

      const rows: SeoulClubData[] = data[this.SERVICE_NAME]?.row || [];
      
      // 학교명 필터링 (선택적)
      let filteredRows = rows;
      if (schoolName) {
        filteredRows = rows.filter(row => 
          row.SD_SCHUL_NM.includes(schoolName)
        );
      }

      // 데이터 변환
      const clubs: ClubInfo[] = filteredRows.map(row => ({
        schoolName: row.SD_SCHUL_NM,
        clubName: row.CLUB_NM,
        memberCount: parseInt(row.CLUB_PSN_CNT) || 0,
        year: row.AY,
        grade: row.GRADE,
        className: row.CLSRM_NM,
      }));

      return {
        success: true,
        totalCount: clubs.length,
        clubs,
      };
    } catch (error: any) {
      this.logger.error(`서울 열린데이터 API 호출 실패: ${error.message}`);
      return {
        success: false,
        totalCount: 0,
        clubs: [],
        error: error.message,
      };
    }
  }

  /**
   * 특정 중학교의 동아리 목록 조회
   */
  async getMiddleSchoolClubs(schoolName: string): Promise<ClubInfo[]> {
    const result = await this.fetchClubData(schoolName);
    
    if (!result.success) {
      this.logger.warn(`${schoolName} 동아리 조회 실패: ${result.error}`);
      return [];
    }

    // 중복 동아리명 제거
    const uniqueClubs = result.clubs.reduce((acc, club) => {
      const existing = acc.find(c => c.clubName === club.clubName);
      if (!existing) {
        acc.push(club);
      } else if (club.memberCount > existing.memberCount) {
        // 더 큰 인원수로 업데이트
        const index = acc.indexOf(existing);
        acc[index] = club;
      }
      return acc;
    }, [] as ClubInfo[]);

    return uniqueClubs;
  }

  /**
   * 동아리 데이터를 DB에 저장 (향후 구현)
   */
  async saveClubsToDatabase(clubs: ClubInfo[]): Promise<number> {
    // TODO: Club 모델 생성 후 구현
    this.logger.log(`${clubs.length}개 동아리 저장 예정`);
    return clubs.length;
  }

  /**
   * API 연결 테스트
   */
  async testConnection(): Promise<{
    connected: boolean;
    message: string;
    sampleData?: ClubInfo[];
  }> {
    this.logger.log('서울 열린데이터 API 연결 테스트...');

    // 실제 API 키가 없으면 샘플 데이터 반환
    if (this.API_KEY === 'sample') {
      return {
        connected: false,
        message: 'API 키가 설정되지 않았습니다. SEOUL_OPENDATA_API_KEY 환경변수를 설정해주세요.',
        sampleData: this.getSampleClubData(),
      };
    }

    const result = await this.fetchClubData(undefined, 1, 5);
    
    return {
      connected: result.success,
      message: result.success 
        ? `연결 성공! ${result.totalCount}개 데이터 조회됨`
        : `연결 실패: ${result.error}`,
      sampleData: result.clubs.slice(0, 5),
    };
  }

  /**
   * 샘플 동아리 데이터 (API 키 없을 때 사용)
   */
  private getSampleClubData(): ClubInfo[] {
    return [
      { schoolName: '서초중학교', clubName: '과학탐구반', memberCount: 15, year: '2024' },
      { schoolName: '서초중학교', clubName: '영어토론반', memberCount: 12, year: '2024' },
      { schoolName: '서초중학교', clubName: '축구부', memberCount: 22, year: '2024' },
      { schoolName: '역삼중학교', clubName: '코딩동아리', memberCount: 18, year: '2024' },
      { schoolName: '역삼중학교', clubName: '밴드부', memberCount: 8, year: '2024' },
      { schoolName: '압구정중학교', clubName: '독서토론반', memberCount: 14, year: '2024' },
      { schoolName: '압구정중학교', clubName: '미술반', memberCount: 16, year: '2024' },
      { schoolName: '대치중학교', clubName: '수학경시반', memberCount: 20, year: '2024' },
      { schoolName: '대치중학교', clubName: '오케스트라', memberCount: 30, year: '2024' },
      { schoolName: '잠실중학교', clubName: '농구부', memberCount: 15, year: '2024' },
    ];
  }
}




