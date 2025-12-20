/**
 * 통일된 API 응답 형식
 * 
 * 사용 예시:
 * - ApiResponse.success(data) - 데이터 응답
 * - ApiResponse.message('삭제되었습니다') - 메시지만 응답
 * - ApiResponse.created(data, '생성되었습니다') - 생성 응답
 * - ApiResponse.deleted('삭제되었습니다') - 삭제 응답
 */

export interface IApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface IPaginatedResponse<T> extends IApiResponse<T[]> {
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class ApiResponse {
  /**
   * 성공 응답 (데이터 포함)
   */
  static success<T>(data: T, message?: string): IApiResponse<T> {
    return {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 메시지만 응답
   */
  static message(message: string): IApiResponse<null> {
    return {
      success: true,
      message,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 생성 성공 응답
   */
  static created<T>(data: T, message = '생성되었습니다'): IApiResponse<T> {
    return {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 수정 성공 응답
   */
  static updated<T>(data: T, message = '수정되었습니다'): IApiResponse<T> {
    return {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 삭제 성공 응답
   */
  static deleted(message = '삭제되었습니다'): IApiResponse<null> {
    return {
      success: true,
      message,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 페이지네이션 응답
   */
  static paginated<T>(
    data: T[],
    total: number,
    page: number,
    limit: number,
  ): IPaginatedResponse<T> {
    return {
      success: true,
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 에러 응답
   */
  static error(error: string, message?: string): IApiResponse<null> {
    return {
      success: false,
      error,
      message,
      timestamp: new Date().toISOString(),
    };
  }
}




