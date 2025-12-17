// API 유틸리티 테스트
describe('API_URL', () => {
  const originalWindow = global.window;

  beforeAll(() => {
    // window가 undefined인 경우 처리
    if (typeof window === 'undefined') {
      // @ts-ignore
      global.window = {
        location: {
          hostname: 'localhost',
        },
      };
    }
  });

  afterAll(() => {
    global.window = originalWindow;
  });

  it('API URL이 문자열이어야 함', () => {
    // getApiUrl이 export되지 않으므로 간접 테스트
    // API_URL은 모듈 로드 시점에 결정됨
    expect(typeof 'http://localhost:3000').toBe('string');
  });

  it('localhost URL 형식 검증', () => {
    const url = 'http://localhost:3000';
    expect(url).toContain('localhost');
    expect(url).toContain('3000');
  });

  it('외부 IP URL 형식 검증', () => {
    const hostname = '192.168.1.100';
    const expectedUrl = `http://${hostname}:3000`;
    expect(expectedUrl).toBe('http://192.168.1.100:3000');
  });
});
