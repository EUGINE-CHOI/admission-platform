import { Injectable, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import { SchoolType } from '@prisma/client';

export interface CrawledSchool {
  name: string;
  type: SchoolType;
  region: string;
  address?: string;
  website?: string;
  features?: any;
}

@Injectable()
export class SchoolCrawlerService {
  private readonly logger = new Logger(SchoolCrawlerService.name);

  /**
   * 학교 정보 크롤링 메인 함수
   */
  async crawl(source: string): Promise<CrawledSchool[]> {
    switch (source) {
      case 'sample':
        return this.getSampleData();
      case 'schoolinfo':
        return this.crawlSchoolInfo();
      case 'hischool':
        return this.crawlHiSchool();
      default:
        this.logger.warn(`알 수 없는 소스: ${source}, 샘플 데이터 반환`);
        return this.getSampleData();
    }
  }

  /**
   * 샘플 데이터 - 수도권 특목고/자사고 전체
   */
  private getSampleData(): CrawledSchool[] {
    return [
      // ========== 서울 외국어고 ==========
      {
        name: '대원외국어고등학교',
        type: SchoolType.SPECIAL,
        region: '서울',
        address: '서울특별시 광진구 용마산로 157',
        website: 'http://daewon.hs.kr',
        features: { languages: ['영어', '일본어', '중국어', '독일어', '프랑스어', '스페인어'], type: '외국어고' },
      },
      {
        name: '대일외국어고등학교',
        type: SchoolType.SPECIAL,
        region: '서울',
        address: '서울특별시 중랑구 신내로 21길 30',
        website: 'http://daeil.hs.kr',
        features: { languages: ['영어', '일본어', '중국어'], type: '외국어고' },
      },
      {
        name: '명덕외국어고등학교',
        type: SchoolType.SPECIAL,
        region: '서울',
        address: '서울특별시 서초구 신반포로 177',
        website: 'http://myungduk.hs.kr',
        features: { languages: ['영어', '중국어', '일본어', '프랑스어'], type: '외국어고' },
      },
      {
        name: '서울외국어고등학교',
        type: SchoolType.SPECIAL,
        region: '서울',
        address: '서울특별시 송파구 위례성대로 8길 30',
        website: 'http://sfl.hs.kr',
        features: { languages: ['영어', '중국어', '일본어', '독일어', '프랑스어', '스페인어', '러시아어'], type: '외국어고' },
      },
      {
        name: '이화외국어고등학교',
        type: SchoolType.SPECIAL,
        region: '서울',
        address: '서울특별시 중구 난계로 171',
        website: 'http://ewha-f.hs.kr',
        features: { languages: ['영어', '중국어', '일본어', '프랑스어'], type: '외국어고', gender: '여학교' },
      },
      {
        name: '한영외국어고등학교',
        type: SchoolType.SPECIAL,
        region: '서울',
        address: '서울특별시 강서구 월정로 36길 9',
        website: 'http://hanyoung.hs.kr',
        features: { languages: ['영어', '중국어', '일본어'], type: '외국어고' },
      },
      // ========== 경기 외국어고 ==========
      {
        name: '용인외국어고등학교',
        type: SchoolType.SPECIAL,
        region: '경기',
        address: '경기도 용인시 처인구 모현읍 외대로 81',
        website: 'http://yfl.hs.kr',
        features: { languages: ['영어', '중국어', '일본어', '프랑스어', '스페인어'], type: '외국어고' },
      },
      {
        name: '고양외국어고등학교',
        type: SchoolType.SPECIAL,
        region: '경기',
        address: '경기도 고양시 일산서구 하이파크3로 48',
        website: 'http://goyang-fl.hs.kr',
        features: { languages: ['영어', '중국어', '일본어'], type: '외국어고' },
      },
      {
        name: '과천외국어고등학교',
        type: SchoolType.SPECIAL,
        region: '경기',
        address: '경기도 과천시 문원로 105',
        website: 'http://gcfl.hs.kr',
        features: { languages: ['영어', '중국어', '일본어', '프랑스어'], type: '외국어고' },
      },
      {
        name: '김포외국어고등학교',
        type: SchoolType.SPECIAL,
        region: '경기',
        address: '경기도 김포시 풍무로 69번길 50',
        website: 'http://gimpo-fl.hs.kr',
        features: { languages: ['영어', '중국어', '일본어'], type: '외국어고' },
      },
      {
        name: '동두천외국어고등학교',
        type: SchoolType.SPECIAL,
        region: '경기',
        address: '경기도 동두천시 평화로 2910번길 85',
        website: 'http://ddc-fl.hs.kr',
        features: { languages: ['영어', '중국어', '일본어'], type: '외국어고' },
      },
      {
        name: '수원외국어고등학교',
        type: SchoolType.SPECIAL,
        region: '경기',
        address: '경기도 수원시 장안구 서부로 2099',
        website: 'http://suwon-fl.hs.kr',
        features: { languages: ['영어', '중국어', '일본어'], type: '외국어고' },
      },
      {
        name: '안양외국어고등학교',
        type: SchoolType.SPECIAL,
        region: '경기',
        address: '경기도 안양시 동안구 벌말로 77',
        website: 'http://anyang-fl.hs.kr',
        features: { languages: ['영어', '중국어', '일본어', '프랑스어'], type: '외국어고' },
      },
      // ========== 인천 외국어고 ==========
      {
        name: '인천외국어고등학교',
        type: SchoolType.SPECIAL,
        region: '인천',
        address: '인천광역시 남동구 만수로 105',
        website: 'http://incheon-fl.hs.kr',
        features: { languages: ['영어', '중국어', '일본어'], type: '외국어고' },
      },
      // ========== 서울 과학고 ==========
      {
        name: '서울과학고등학교',
        type: SchoolType.SPECIAL,
        region: '서울',
        address: '서울특별시 종로구 혜화로 8길 30',
        website: 'http://sshs.hs.kr',
        features: { majors: ['수학', '물리', '화학', '생물', '정보과학'], type: '과학고', awards: ['국제올림피아드 다수 수상'] },
      },
      {
        name: '세종과학고등학교',
        type: SchoolType.SPECIAL,
        region: '서울',
        address: '서울특별시 종로구 북악산로 31',
        website: 'http://sejong.shs.kr',
        features: { majors: ['물리', '화학', '생물', '지구과학', '수학', '정보'], type: '과학고' },
      },
      {
        name: '한성과학고등학교',
        type: SchoolType.SPECIAL,
        region: '서울',
        address: '서울특별시 서대문구 통일로 279',
        website: 'http://hansung-sh.hs.kr',
        features: { majors: ['수학', '물리', '화학', '생물'], type: '과학고' },
      },
      // ========== 경기 과학고 ==========
      {
        name: '경기북과학고등학교',
        type: SchoolType.SPECIAL,
        region: '경기',
        address: '경기도 의정부시 용현로 214',
        website: 'http://gbs.hs.kr',
        features: { majors: ['수학', '물리', '화학', '생물', '정보'], type: '과학고' },
      },
      // ========== 인천 과학고 ==========
      {
        name: '인천과학고등학교',
        type: SchoolType.SPECIAL,
        region: '인천',
        address: '인천광역시 중구 참외전로 272번길 50',
        website: 'http://incheon-sh.hs.kr',
        features: { majors: ['수학', '물리', '화학', '생물', '정보'], type: '과학고' },
      },
      // ========== 국제고 ==========
      {
        name: '서울국제고등학교',
        type: SchoolType.SPECIAL,
        region: '서울',
        address: '서울특별시 종로구 성균관로 1길 26',
        website: 'http://sihs.hs.kr',
        features: { type: '국제고', programs: ['IB프로그램', '해외대학진학'] },
      },
      {
        name: '고양국제고등학교',
        type: SchoolType.SPECIAL,
        region: '경기',
        address: '경기도 고양시 일산동구 태극로 60',
        website: 'http://gihs.hs.kr',
        features: { type: '국제고', programs: ['국제교류', '영어몰입교육'] },
      },
      {
        name: '청심국제고등학교',
        type: SchoolType.SPECIAL,
        region: '경기',
        address: '경기도 가평군 설악면 미사리로 324-32',
        website: 'http://csia.hs.kr',
        features: { type: '국제고', dormitory: true, programs: ['IB프로그램'] },
      },
      {
        name: '동탄국제고등학교',
        type: SchoolType.SPECIAL,
        region: '경기',
        address: '경기도 화성시 동탄순환대로 28길 25',
        website: 'http://dongtan.hs.kr',
        features: { type: '국제고', programs: ['국제교류', '글로벌리더십'] },
      },
      // ========== 서울 자율형사립고 ==========
      {
        name: '하나고등학교',
        type: SchoolType.AUTONOMOUS,
        region: '서울',
        address: '서울특별시 은평구 연서로 535',
        website: 'http://hana.hs.kr',
        features: { type: '자율형사립고', dormitory: true, programs: ['국제반', '과학영재반'] },
      },
      {
        name: '현대고등학교',
        type: SchoolType.AUTONOMOUS,
        region: '서울',
        address: '서울특별시 강남구 압구정로 170',
        website: 'http://hyundai.hs.kr',
        features: { type: '자율형사립고' },
      },
      {
        name: '중동고등학교',
        type: SchoolType.AUTONOMOUS,
        region: '서울',
        address: '서울특별시 강남구 영동대로 317',
        website: 'http://jungdong.hs.kr',
        features: { type: '자율형사립고' },
      },
      {
        name: '휘문고등학교',
        type: SchoolType.AUTONOMOUS,
        region: '서울',
        address: '서울특별시 강남구 언주로 637',
        website: 'http://whimoon.hs.kr',
        features: { type: '자율형사립고' },
      },
      {
        name: '세화고등학교',
        type: SchoolType.AUTONOMOUS,
        region: '서울',
        address: '서울특별시 서초구 서운로 9길 27',
        website: 'http://seiwha.hs.kr',
        features: { type: '자율형사립고' },
      },
      {
        name: '이화여자외국어고등학교',
        type: SchoolType.AUTONOMOUS,
        region: '서울',
        address: '서울특별시 중구 을지로',
        website: 'http://ewhafl.hs.kr',
        features: { type: '자율형사립고', gender: '여학교' },
      },
      {
        name: '배재고등학교',
        type: SchoolType.AUTONOMOUS,
        region: '서울',
        address: '서울특별시 강동구 올림픽로 579',
        website: 'http://pai.hs.kr',
        features: { type: '자율형사립고' },
      },
      {
        name: '경문고등학교',
        type: SchoolType.AUTONOMOUS,
        region: '서울',
        address: '서울특별시 관악구 남부순환로 1413',
        website: 'http://kyungmoon.hs.kr',
        features: { type: '자율형사립고' },
      },
      {
        name: '양정고등학교',
        type: SchoolType.AUTONOMOUS,
        region: '서울',
        address: '서울특별시 양천구 목동동로 23길 30',
        website: 'http://yangjeong.hs.kr',
        features: { type: '자율형사립고' },
      },
      {
        name: '중앙고등학교',
        type: SchoolType.AUTONOMOUS,
        region: '서울',
        address: '서울특별시 종로구 북촌로',
        website: 'http://choongang.hs.kr',
        features: { type: '자율형사립고' },
      },
      {
        name: '한대부속고등학교',
        type: SchoolType.AUTONOMOUS,
        region: '서울',
        address: '서울특별시 성동구 왕십리로',
        website: 'http://hanyang.hs.kr',
        features: { type: '자율형사립고' },
      },
      // ========== 경기 자율형사립고 ==========
      {
        name: '용인한국외국어대학교부설고등학교',
        type: SchoolType.AUTONOMOUS,
        region: '경기',
        address: '경기도 용인시 처인구 모현읍',
        website: 'http://hufs.hs.kr',
        features: { type: '자율형사립고', dormitory: true },
      },
      {
        name: '안산동산고등학교',
        type: SchoolType.AUTONOMOUS,
        region: '경기',
        address: '경기도 안산시 상록구 이동',
        website: 'http://dongsan.hs.kr',
        features: { type: '자율형사립고', dormitory: true },
      },
      // ========== 영재학교 ==========
      {
        name: '서울과학영재학교',
        type: SchoolType.SPECIAL,
        region: '서울',
        address: '서울특별시 종로구 창경궁로 172',
        website: 'http://ssgs.hs.kr',
        features: { type: '영재학교', level: '영재학교', research: true },
      },
      {
        name: '경기과학영재학교',
        type: SchoolType.SPECIAL,
        region: '경기',
        address: '경기도 수원시 장안구 수일로 135번길 12',
        website: 'http://gs.hs.kr',
        features: { type: '영재학교', level: '영재학교', research: true },
      },
      {
        name: '인천과학예술영재학교',
        type: SchoolType.SPECIAL,
        region: '인천',
        address: '인천광역시 연수구 아카데미로',
        website: 'http://isa.hs.kr',
        features: { type: '영재학교', level: '영재학교', arts: true },
      },
    ];
  }

  /**
   * 학교알리미 크롤링 (실제 구현시 사용)
   */
  private async crawlSchoolInfo(): Promise<CrawledSchool[]> {
    const schools: CrawledSchool[] = [];
    let browser: puppeteer.Browser | null = null;

    try {
      this.logger.log('학교알리미 크롤링 시작...');

      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      const page = await browser.newPage();
      
      // 학교알리미 고등학교 목록 페이지
      // 실제 URL로 변경 필요
      await page.goto('https://www.schoolinfo.go.kr/ei/ss/Pneiss_a01_s0.do', {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });

      // 페이지 내용 가져오기
      const content = await page.content();
      const $ = cheerio.load(content);

      // 학교 목록 파싱 (실제 HTML 구조에 맞게 수정 필요)
      // 예시 구조
      $('.school-list-item').each((_, element) => {
        const name = $(element).find('.school-name').text().trim();
        const address = $(element).find('.school-address').text().trim();
        const region = this.extractRegion(address);

        if (name) {
          schools.push({
            name,
            type: SchoolType.GENERAL, // 실제로는 파싱 필요
            region,
            address,
          });
        }
      });

      this.logger.log(`학교알리미에서 ${schools.length}개 학교 크롤링 완료`);
    } catch (error) {
      this.logger.error(`학교알리미 크롤링 실패: ${error.message}`);
      // 실패시 샘플 데이터 반환
      return this.getSampleData();
    } finally {
      if (browser) {
        await browser.close();
      }
    }

    return schools.length > 0 ? schools : this.getSampleData();
  }

  /**
   * 하이스쿨 크롤링
   */
  private async crawlHiSchool(): Promise<CrawledSchool[]> {
    const schools: CrawledSchool[] = [];
    let browser: puppeteer.Browser | null = null;

    try {
      this.logger.log('하이스쿨 크롤링 시작...');

      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      const page = await browser.newPage();
      
      // 하이스쿨 고입정보포털
      await page.goto('https://hischool.go.kr', {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });

      const content = await page.content();
      const $ = cheerio.load(content);

      // 학교 목록 파싱 (실제 HTML 구조에 맞게 수정 필요)
      // 구현 예시...

      this.logger.log(`하이스쿨에서 ${schools.length}개 학교 크롤링 완료`);
    } catch (error) {
      this.logger.error(`하이스쿨 크롤링 실패: ${error.message}`);
      return this.getSampleData();
    } finally {
      if (browser) {
        await browser.close();
      }
    }

    return schools.length > 0 ? schools : this.getSampleData();
  }

  /**
   * 주소에서 지역 추출
   */
  private extractRegion(address: string): string {
    const regions = [
      '서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종',
      '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주',
    ];

    for (const region of regions) {
      if (address.includes(region)) {
        return region;
      }
    }
    return '기타';
  }
}
