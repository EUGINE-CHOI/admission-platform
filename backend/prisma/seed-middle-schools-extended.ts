import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

// 경기도 중학교 데이터
const gyeonggiMiddleSchools = [
  // 수원시
  { name: '수원중학교', region: '경기', district: '수원시 팔달구', website: 'https://suwon.goe.ms.kr' },
  { name: '영통중학교', region: '경기', district: '수원시 영통구', website: 'https://yeongtong.goe.ms.kr' },
  { name: '매탄중학교', region: '경기', district: '수원시 영통구', website: 'https://maetan.goe.ms.kr' },
  { name: '광교중학교', region: '경기', district: '수원시 영통구', website: 'https://gwanggyo.goe.ms.kr' },
  { name: '수성중학교', region: '경기', district: '수원시 장안구', website: 'https://suseong.goe.ms.kr' },
  { name: '정자중학교', region: '경기', district: '수원시 장안구', website: 'https://jeongja-sw.goe.ms.kr' },
  { name: '권선중학교', region: '경기', district: '수원시 권선구', website: 'https://gwonseon.goe.ms.kr' },
  { name: '곡선중학교', region: '경기', district: '수원시 권선구', website: 'https://gokseon.goe.ms.kr' },
  
  // 성남시
  { name: '분당중학교', region: '경기', district: '성남시 분당구', website: 'https://bundang.goe.ms.kr' },
  { name: '정자중학교', region: '경기', district: '성남시 분당구', website: 'https://jeongja.goe.ms.kr' },
  { name: '서현중학교', region: '경기', district: '성남시 분당구', website: 'https://seohyun.goe.ms.kr' },
  { name: '야탑중학교', region: '경기', district: '성남시 분당구', website: 'https://yatap.goe.ms.kr' },
  { name: '수내중학교', region: '경기', district: '성남시 분당구', website: 'https://sunae.goe.ms.kr' },
  { name: '불곡중학교', region: '경기', district: '성남시 분당구', website: 'https://bulgok.goe.ms.kr' },
  { name: '판교중학교', region: '경기', district: '성남시 분당구', website: 'https://pangyo.goe.ms.kr' },
  { name: '보평중학교', region: '경기', district: '성남시 분당구', website: 'https://bopyeong.goe.ms.kr' },
  { name: '성남중학교', region: '경기', district: '성남시 수정구', website: 'https://seongnam.goe.ms.kr' },
  { name: '중원중학교', region: '경기', district: '성남시 중원구', website: 'https://jungwon.goe.ms.kr' },
  
  // 용인시
  { name: '용인중학교', region: '경기', district: '용인시 처인구', website: 'https://yongin.goe.ms.kr' },
  { name: '수지중학교', region: '경기', district: '용인시 수지구', website: 'https://suji.goe.ms.kr' },
  { name: '동백중학교', region: '경기', district: '용인시 기흥구', website: 'https://dongbaek.goe.ms.kr' },
  { name: '기흥중학교', region: '경기', district: '용인시 기흥구', website: 'https://giheung.goe.ms.kr' },
  { name: '손곡중학교', region: '경기', district: '용인시 수지구', website: 'https://songok.goe.ms.kr' },
  { name: '정평중학교', region: '경기', district: '용인시 수지구', website: 'https://jeongpyeong.goe.ms.kr' },
  
  // 고양시
  { name: '일산중학교', region: '경기', district: '고양시 일산동구', website: 'https://ilsan.goe.ms.kr' },
  { name: '저동중학교', region: '경기', district: '고양시 일산동구', website: 'https://jeodong.goe.ms.kr' },
  { name: '백석중학교', region: '경기', district: '고양시 일산동구', website: 'https://baekseok.goe.ms.kr' },
  { name: '장항중학교', region: '경기', district: '고양시 일산동구', website: 'https://janghang.goe.ms.kr' },
  { name: '주엽중학교', region: '경기', district: '고양시 일산서구', website: 'https://juyeop.goe.ms.kr' },
  { name: '대화중학교', region: '경기', district: '고양시 일산서구', website: 'https://daehwa.goe.ms.kr' },
  { name: '고양중학교', region: '경기', district: '고양시 덕양구', website: 'https://goyang.goe.ms.kr' },
  { name: '행신중학교', region: '경기', district: '고양시 덕양구', website: 'https://haengsin.goe.ms.kr' },
  
  // 안양시
  { name: '안양중학교', region: '경기', district: '안양시 만안구', website: 'https://anyang.goe.ms.kr' },
  { name: '평촌중학교', region: '경기', district: '안양시 동안구', website: 'https://pyeongchon.goe.ms.kr' },
  { name: '범계중학교', region: '경기', district: '안양시 동안구', website: 'https://beomgye.goe.ms.kr' },
  { name: '귀인중학교', region: '경기', district: '안양시 동안구', website: 'https://gwiin.goe.ms.kr' },
  { name: '부림중학교', region: '경기', district: '안양시 동안구', website: 'https://burim.goe.ms.kr' },
  
  // 부천시
  { name: '부천중학교', region: '경기', district: '부천시', website: 'https://bucheon.goe.ms.kr' },
  { name: '중동중학교', region: '경기', district: '부천시', website: 'https://jungdong.goe.ms.kr' },
  { name: '상동중학교', region: '경기', district: '부천시', website: 'https://sangdong.goe.ms.kr' },
  { name: '원미중학교', region: '경기', district: '부천시', website: 'https://wonmi.goe.ms.kr' },
  { name: '소사중학교', region: '경기', district: '부천시', website: 'https://sosa.goe.ms.kr' },
  
  // 화성시
  { name: '동탄중학교', region: '경기', district: '화성시', website: 'https://dongtan.goe.ms.kr' },
  { name: '병점중학교', region: '경기', district: '화성시', website: 'https://byeongjeom.goe.ms.kr' },
  { name: '반월중학교', region: '경기', district: '화성시', website: 'https://banwol.goe.ms.kr' },
  { name: '능동중학교', region: '경기', district: '화성시', website: 'https://neungdong-hs.goe.ms.kr' },
  
  // 안산시
  { name: '안산중학교', region: '경기', district: '안산시 단원구', website: 'https://ansan.goe.ms.kr' },
  { name: '고잔중학교', region: '경기', district: '안산시 단원구', website: 'https://gojan.goe.ms.kr' },
  { name: '본오중학교', region: '경기', district: '안산시 상록구', website: 'https://bono.goe.ms.kr' },
  { name: '성포중학교', region: '경기', district: '안산시 상록구', website: 'https://seongpo.goe.ms.kr' },
  
  // 평택시
  { name: '평택중학교', region: '경기', district: '평택시', website: 'https://pyeongtaek.goe.ms.kr' },
  { name: '송탄중학교', region: '경기', district: '평택시', website: 'https://songtan.goe.ms.kr' },
  { name: '안중중학교', region: '경기', district: '평택시', website: 'https://anjung.goe.ms.kr' },
  
  // 의정부시
  { name: '의정부중학교', region: '경기', district: '의정부시', website: 'https://uijeongbu.goe.ms.kr' },
  { name: '호원중학교', region: '경기', district: '의정부시', website: 'https://howon.goe.ms.kr' },
  { name: '민락중학교', region: '경기', district: '의정부시', website: 'https://minrak.goe.ms.kr' },
  
  // 시흥시
  { name: '시흥중학교', region: '경기', district: '시흥시', website: 'https://siheung.goe.ms.kr' },
  { name: '배곧중학교', region: '경기', district: '시흥시', website: 'https://baegot.goe.ms.kr' },
  { name: '월곶중학교', region: '경기', district: '시흥시', website: 'https://wolgot.goe.ms.kr' },
  
  // 파주시
  { name: '파주중학교', region: '경기', district: '파주시', website: 'https://paju.goe.ms.kr' },
  { name: '운정중학교', region: '경기', district: '파주시', website: 'https://unjeong.goe.ms.kr' },
  { name: '금촌중학교', region: '경기', district: '파주시', website: 'https://geumchon.goe.ms.kr' },
  
  // 김포시
  { name: '김포중학교', region: '경기', district: '김포시', website: 'https://gimpo.goe.ms.kr' },
  { name: '장기중학교', region: '경기', district: '김포시', website: 'https://janggi.goe.ms.kr' },
  { name: '고촌중학교', region: '경기', district: '김포시', website: 'https://gochon.goe.ms.kr' },
  
  // 광명시
  { name: '광명중학교', region: '경기', district: '광명시', website: 'https://gwangmyeong.goe.ms.kr' },
  { name: '철산중학교', region: '경기', district: '광명시', website: 'https://cheolsan.goe.ms.kr' },
  
  // 광주시
  { name: '광주중학교', region: '경기', district: '광주시', website: 'https://gwangju-gg.goe.ms.kr' },
  { name: '태전중학교', region: '경기', district: '광주시', website: 'https://taejeon.goe.ms.kr' },
  
  // 하남시
  { name: '하남중학교', region: '경기', district: '하남시', website: 'https://hanam.goe.ms.kr' },
  { name: '미사중학교', region: '경기', district: '하남시', website: 'https://misa.goe.ms.kr' },
  { name: '위례중학교', region: '경기', district: '하남시', website: 'https://wirye.goe.ms.kr' },
  
  // 구리시
  { name: '구리중학교', region: '경기', district: '구리시', website: 'https://guri.goe.ms.kr' },
  { name: '인창중학교', region: '경기', district: '구리시', website: 'https://inchang.goe.ms.kr' },
  
  // 남양주시
  { name: '남양주중학교', region: '경기', district: '남양주시', website: 'https://namyangju.goe.ms.kr' },
  { name: '다산중학교', region: '경기', district: '남양주시', website: 'https://dasan.goe.ms.kr' },
  { name: '별내중학교', region: '경기', district: '남양주시', website: 'https://byeolnae.goe.ms.kr' },
];

// 부산 중학교 데이터
const busanMiddleSchools = [
  // 해운대구
  { name: '해운대중학교', region: '부산', district: '해운대구', website: 'https://haeundae.pen.ms.kr' },
  { name: '반여중학교', region: '부산', district: '해운대구', website: 'https://banyeo.pen.ms.kr' },
  { name: '센텀중학교', region: '부산', district: '해운대구', website: 'https://centum.pen.ms.kr' },
  { name: '해강중학교', region: '부산', district: '해운대구', website: 'https://haegang.pen.ms.kr' },
  { name: '재송중학교', region: '부산', district: '해운대구', website: 'https://jaesong.pen.ms.kr' },
  
  // 부산진구
  { name: '부산진중학교', region: '부산', district: '부산진구', website: 'https://busanjin.pen.ms.kr' },
  { name: '개금중학교', region: '부산', district: '부산진구', website: 'https://gaegeum.pen.ms.kr' },
  { name: '양정중학교', region: '부산', district: '부산진구', website: 'https://yangjeong.pen.ms.kr' },
  { name: '전포중학교', region: '부산', district: '부산진구', website: 'https://jeonpo.pen.ms.kr' },
  
  // 남구
  { name: '대연중학교', region: '부산', district: '남구', website: 'https://daeyeon.pen.ms.kr' },
  { name: '용호중학교', region: '부산', district: '남구', website: 'https://yongho.pen.ms.kr' },
  { name: '문현중학교', region: '부산', district: '남구', website: 'https://munhyeon.pen.ms.kr' },
  
  // 수영구
  { name: '수영중학교', region: '부산', district: '수영구', website: 'https://suyeong.pen.ms.kr' },
  { name: '망미중학교', region: '부산', district: '수영구', website: 'https://mangmi.pen.ms.kr' },
  { name: '광안중학교', region: '부산', district: '수영구', website: 'https://gwangan.pen.ms.kr' },
  
  // 동래구
  { name: '동래중학교', region: '부산', district: '동래구', website: 'https://dongnae.pen.ms.kr' },
  { name: '내성중학교', region: '부산', district: '동래구', website: 'https://naeseong.pen.ms.kr' },
  { name: '안락중학교', region: '부산', district: '동래구', website: 'https://anrak.pen.ms.kr' },
  
  // 연제구
  { name: '연제중학교', region: '부산', district: '연제구', website: 'https://yeonje.pen.ms.kr' },
  { name: '토곡중학교', region: '부산', district: '연제구', website: 'https://togok.pen.ms.kr' },
  
  // 사하구
  { name: '사하중학교', region: '부산', district: '사하구', website: 'https://saha.pen.ms.kr' },
  { name: '괴정중학교', region: '부산', district: '사하구', website: 'https://goejeong.pen.ms.kr' },
  
  // 북구
  { name: '금곡중학교', region: '부산', district: '북구', website: 'https://geumgok.pen.ms.kr' },
  { name: '화명중학교', region: '부산', district: '북구', website: 'https://hwamyeong.pen.ms.kr' },
  
  // 강서구
  { name: '명지중학교', region: '부산', district: '강서구', website: 'https://myeongji.pen.ms.kr' },
  
  // 금정구
  { name: '금정중학교', region: '부산', district: '금정구', website: 'https://geumjeong.pen.ms.kr' },
  { name: '서동중학교', region: '부산', district: '금정구', website: 'https://seodong.pen.ms.kr' },
  
  // 사상구
  { name: '사상중학교', region: '부산', district: '사상구', website: 'https://sasang.pen.ms.kr' },
  { name: '모라중학교', region: '부산', district: '사상구', website: 'https://mora.pen.ms.kr' },
  
  // 기장군
  { name: '기장중학교', region: '부산', district: '기장군', website: 'https://gijang.pen.ms.kr' },
  { name: '정관중학교', region: '부산', district: '기장군', website: 'https://jeonggwan.pen.ms.kr' },
];

// 대구 중학교 데이터
const daeguMiddleSchools = [
  // 수성구
  { name: '수성중학교', region: '대구', district: '수성구', website: 'https://suseong.dge.ms.kr' },
  { name: '범어중학교', region: '대구', district: '수성구', website: 'https://beomeo.dge.ms.kr' },
  { name: '만촌중학교', region: '대구', district: '수성구', website: 'https://manchon.dge.ms.kr' },
  { name: '황금중학교', region: '대구', district: '수성구', website: 'https://hwanggeum.dge.ms.kr' },
  { name: '지산중학교', region: '대구', district: '수성구', website: 'https://jisan.dge.ms.kr' },
  { name: '시지중학교', region: '대구', district: '수성구', website: 'https://siji.dge.ms.kr' },
  
  // 달서구
  { name: '달서중학교', region: '대구', district: '달서구', website: 'https://dalseo.dge.ms.kr' },
  { name: '성서중학교', region: '대구', district: '달서구', website: 'https://seongseo.dge.ms.kr' },
  { name: '상인중학교', region: '대구', district: '달서구', website: 'https://sangin.dge.ms.kr' },
  { name: '월성중학교', region: '대구', district: '달서구', website: 'https://wolseong.dge.ms.kr' },
  
  // 동구
  { name: '동구중학교', region: '대구', district: '동구', website: 'https://donggu.dge.ms.kr' },
  { name: '신암중학교', region: '대구', district: '동구', website: 'https://sinam.dge.ms.kr' },
  { name: '동촌중학교', region: '대구', district: '동구', website: 'https://dongchon.dge.ms.kr' },
  
  // 북구
  { name: '북구중학교', region: '대구', district: '북구', website: 'https://bukgu.dge.ms.kr' },
  { name: '칠성중학교', region: '대구', district: '북구', website: 'https://chilseong.dge.ms.kr' },
  { name: '침산중학교', region: '대구', district: '북구', website: 'https://chimsan.dge.ms.kr' },
  
  // 중구
  { name: '대구중학교', region: '대구', district: '중구', website: 'https://daegu.dge.ms.kr' },
  { name: '경북중학교', region: '대구', district: '중구', website: 'https://gyeongbuk.dge.ms.kr' },
  
  // 남구
  { name: '남구중학교', region: '대구', district: '남구', website: 'https://namgu.dge.ms.kr' },
  { name: '대명중학교', region: '대구', district: '남구', website: 'https://daemyeong.dge.ms.kr' },
  
  // 서구
  { name: '서구중학교', region: '대구', district: '서구', website: 'https://seogu.dge.ms.kr' },
  { name: '평리중학교', region: '대구', district: '서구', website: 'https://pyeongri.dge.ms.kr' },
  
  // 달성군
  { name: '달성중학교', region: '대구', district: '달성군', website: 'https://dalseong.dge.ms.kr' },
  { name: '논공중학교', region: '대구', district: '달성군', website: 'https://nongong.dge.ms.kr' },
];

// 대전 중학교 데이터
const daejeonMiddleSchools = [
  // 유성구
  { name: '유성중학교', region: '대전', district: '유성구', website: 'https://yuseong.dje.ms.kr' },
  { name: '도안중학교', region: '대전', district: '유성구', website: 'https://doan.dje.ms.kr' },
  { name: '봉명중학교', region: '대전', district: '유성구', website: 'https://bongmyeong.dje.ms.kr' },
  { name: '신성중학교', region: '대전', district: '유성구', website: 'https://sinseong.dje.ms.kr' },
  { name: '전민중학교', region: '대전', district: '유성구', website: 'https://jeonmin.dje.ms.kr' },
  
  // 서구
  { name: '서대전중학교', region: '대전', district: '서구', website: 'https://seodaejeon.dje.ms.kr' },
  { name: '둔산중학교', region: '대전', district: '서구', website: 'https://dunsan.dje.ms.kr' },
  { name: '만년중학교', region: '대전', district: '서구', website: 'https://mannyeon.dje.ms.kr' },
  { name: '탄방중학교', region: '대전', district: '서구', website: 'https://tanbang.dje.ms.kr' },
  { name: '도마중학교', region: '대전', district: '서구', website: 'https://doma.dje.ms.kr' },
  
  // 중구
  { name: '대전중학교', region: '대전', district: '중구', website: 'https://daejeon.dje.ms.kr' },
  { name: '대흥중학교', region: '대전', district: '중구', website: 'https://daeheung.dje.ms.kr' },
  
  // 동구
  { name: '동대전중학교', region: '대전', district: '동구', website: 'https://dongdaejeon.dje.ms.kr' },
  { name: '판암중학교', region: '대전', district: '동구', website: 'https://panam.dje.ms.kr' },
  { name: '대전용전중학교', region: '대전', district: '동구', website: 'https://yongjeon.dje.ms.kr' },
  
  // 대덕구
  { name: '대덕중학교', region: '대전', district: '대덕구', website: 'https://daedeok.dje.ms.kr' },
  { name: '송촌중학교', region: '대전', district: '대덕구', website: 'https://songchon.dje.ms.kr' },
  { name: '신탄진중학교', region: '대전', district: '대덕구', website: 'https://sintanjin.dje.ms.kr' },
];

// 광주 중학교 데이터
const gwangjuMiddleSchools = [
  // 남구
  { name: '광주남중학교', region: '광주', district: '남구', website: 'https://gjnam.gen.ms.kr' },
  { name: '봉선중학교', region: '광주', district: '남구', website: 'https://bongseon.gen.ms.kr' },
  { name: '주월중학교', region: '광주', district: '남구', website: 'https://juwol.gen.ms.kr' },
  { name: '서강중학교', region: '광주', district: '남구', website: 'https://seogang-gj.gen.ms.kr' },
  
  // 북구
  { name: '광주북중학교', region: '광주', district: '북구', website: 'https://gjbuk.gen.ms.kr' },
  { name: '문흥중학교', region: '광주', district: '북구', website: 'https://munheung.gen.ms.kr' },
  { name: '용봉중학교', region: '광주', district: '북구', website: 'https://yongbong.gen.ms.kr' },
  { name: '일곡중학교', region: '광주', district: '북구', website: 'https://ilgok.gen.ms.kr' },
  { name: '운암중학교', region: '광주', district: '북구', website: 'https://unam.gen.ms.kr' },
  
  // 서구
  { name: '광주서중학교', region: '광주', district: '서구', website: 'https://gjseo.gen.ms.kr' },
  { name: '상무중학교', region: '광주', district: '서구', website: 'https://sangmu.gen.ms.kr' },
  { name: '화정중학교', region: '광주', district: '서구', website: 'https://hwajeong.gen.ms.kr' },
  { name: '금호중학교', region: '광주', district: '서구', website: 'https://geumho.gen.ms.kr' },
  
  // 동구
  { name: '광주동중학교', region: '광주', district: '동구', website: 'https://gjdong.gen.ms.kr' },
  { name: '조선대학교부속중학교', region: '광주', district: '동구', website: 'https://chosun.gen.ms.kr' },
  
  // 광산구
  { name: '광산중학교', region: '광주', district: '광산구', website: 'https://gwangsan.gen.ms.kr' },
  { name: '수완중학교', region: '광주', district: '광산구', website: 'https://suwan.gen.ms.kr' },
  { name: '첨단중학교', region: '광주', district: '광산구', website: 'https://cheomdan.gen.ms.kr' },
  { name: '송정중학교', region: '광주', district: '광산구', website: 'https://songjeong-gj.gen.ms.kr' },
  { name: '하남중학교', region: '광주', district: '광산구', website: 'https://hanam-gj.gen.ms.kr' },
];

// 울산 중학교 데이터
const ulsanMiddleSchools = [
  // 남구
  { name: '울산남중학교', region: '울산', district: '남구', website: 'https://usnam.use.ms.kr' },
  { name: '삼산중학교', region: '울산', district: '남구', website: 'https://samsan.use.ms.kr' },
  { name: '신정중학교', region: '울산', district: '남구', website: 'https://sinjeong.use.ms.kr' },
  { name: '무거중학교', region: '울산', district: '남구', website: 'https://mugeo.use.ms.kr' },
  
  // 중구
  { name: '울산중학교', region: '울산', district: '중구', website: 'https://ulsan.use.ms.kr' },
  { name: '학성중학교', region: '울산', district: '중구', website: 'https://hakseong.use.ms.kr' },
  
  // 동구
  { name: '동구중학교', region: '울산', district: '동구', website: 'https://donggu-us.use.ms.kr' },
  { name: '방어진중학교', region: '울산', district: '동구', website: 'https://bangeojin.use.ms.kr' },
  
  // 북구
  { name: '울산북중학교', region: '울산', district: '북구', website: 'https://usbuk.use.ms.kr' },
  { name: '송정중학교', region: '울산', district: '북구', website: 'https://songjeong.use.ms.kr' },
  { name: '호계중학교', region: '울산', district: '북구', website: 'https://hogye.use.ms.kr' },
  
  // 울주군
  { name: '언양중학교', region: '울산', district: '울주군', website: 'https://eonyang.use.ms.kr' },
  { name: '범서중학교', region: '울산', district: '울주군', website: 'https://beomseo.use.ms.kr' },
];

// 세종 중학교 데이터
const sejongMiddleSchools = [
  { name: '세종중학교', region: '세종', district: '조치원읍', website: 'https://sejong.sje.ms.kr' },
  { name: '도담중학교', region: '세종', district: '세종시', website: 'https://dodam.sje.ms.kr' },
  { name: '아름중학교', region: '세종', district: '세종시', website: 'https://areum.sje.ms.kr' },
  { name: '한솔중학교', region: '세종', district: '세종시', website: 'https://hansol.sje.ms.kr' },
  { name: '새롬중학교', region: '세종', district: '세종시', website: 'https://saerom.sje.ms.kr' },
  { name: '소담중학교', region: '세종', district: '세종시', website: 'https://sodam.sje.ms.kr' },
  { name: '반곡중학교', region: '세종', district: '세종시', website: 'https://bangok.sje.ms.kr' },
  { name: '보람중학교', region: '세종', district: '세종시', website: 'https://boram.sje.ms.kr' },
  { name: '고운중학교', region: '세종', district: '세종시', website: 'https://goun.sje.ms.kr' },
];

async function main() {
  console.log('🏫 확장 중학교 시드 데이터 삽입 시작...');
  
  const allSchools = [
    ...gyeonggiMiddleSchools,
    ...busanMiddleSchools,
    ...daeguMiddleSchools,
    ...daejeonMiddleSchools,
    ...gwangjuMiddleSchools,
    ...ulsanMiddleSchools,
    ...sejongMiddleSchools,
  ];
  
  let created = 0;
  let skipped = 0;
  
  for (const school of allSchools) {
    try {
      await prisma.middleSchool.upsert({
        where: {
          name_region: {
            name: school.name,
            region: school.region,
          },
        },
        update: {
          district: school.district,
          website: school.website,
        },
        create: {
          name: school.name,
          region: school.region,
          district: school.district,
          website: school.website,
        },
      });
      created++;
    } catch (error) {
      console.error(`❌ ${school.name} 삽입 실패:`, error);
      skipped++;
    }
  }
  
  console.log(`✅ 확장 중학교 시드 완료: ${created}개 생성/업데이트, ${skipped}개 건너뜀`);
  console.log(`   - 경기: ${gyeonggiMiddleSchools.length}개`);
  console.log(`   - 부산: ${busanMiddleSchools.length}개`);
  console.log(`   - 대구: ${daeguMiddleSchools.length}개`);
  console.log(`   - 대전: ${daejeonMiddleSchools.length}개`);
  console.log(`   - 광주: ${gwangjuMiddleSchools.length}개`);
  console.log(`   - 울산: ${ulsanMiddleSchools.length}개`);
  console.log(`   - 세종: ${sejongMiddleSchools.length}개`);
  
  // 전체 통계
  const stats = await prisma.middleSchool.groupBy({
    by: ['region'],
    _count: { id: true },
  });
  
  console.log('\n📊 전체 중학교 통계:');
  let total = 0;
  for (const stat of stats) {
    console.log(`   - ${stat.region}: ${stat._count.id}개`);
    total += stat._count.id;
  }
  console.log(`   총합: ${total}개`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });







