import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

interface TossPaymentRequest {
  orderId: string;
  amount: number;
  orderName: string;
  customerName: string;
  customerEmail?: string;
  successUrl: string;
  failUrl: string;
}

interface TossPaymentConfirm {
  paymentKey: string;
  orderId: string;
  amount: number;
}

@Injectable()
export class TossPaymentService {
  private readonly secretKey: string;
  private readonly clientKey: string;
  private readonly baseUrl = 'https://api.tosspayments.com/v1';

  constructor(private configService: ConfigService) {
    // 테스트 키 (실제 결제 발생 안함)
    this.secretKey = this.configService.get<string>('TOSS_SECRET_KEY') || 'test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R';
    this.clientKey = this.configService.get<string>('TOSS_CLIENT_KEY') || 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq';
  }

  // 클라이언트 키 반환 (프론트엔드에서 사용)
  getClientKey(): string {
    return this.clientKey;
  }

  // 결제 준비 정보 생성
  async preparePayment(dto: TossPaymentRequest) {
    const orderId = dto.orderId || `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      clientKey: this.clientKey,
      orderId,
      amount: dto.amount,
      orderName: dto.orderName,
      customerName: dto.customerName,
      customerEmail: dto.customerEmail,
      successUrl: dto.successUrl,
      failUrl: dto.failUrl,
    };
  }

  // 결제 승인 (서버에서 호출)
  async confirmPayment(dto: TossPaymentConfirm) {
    try {
      const encodedSecretKey = Buffer.from(`${this.secretKey}:`).toString('base64');

      const response = await axios.post(
        `${this.baseUrl}/payments/confirm`,
        {
          paymentKey: dto.paymentKey,
          orderId: dto.orderId,
          amount: dto.amount,
        },
        {
          headers: {
            Authorization: `Basic ${encodedSecretKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return {
        success: true,
        payment: response.data,
      };
    } catch (error: any) {
      const errorData = error.response?.data;
      throw new BadRequestException(
        errorData?.message || '결제 승인에 실패했습니다',
      );
    }
  }

  // 결제 조회
  async getPayment(paymentKey: string) {
    try {
      const encodedSecretKey = Buffer.from(`${this.secretKey}:`).toString('base64');

      const response = await axios.get(
        `${this.baseUrl}/payments/${paymentKey}`,
        {
          headers: {
            Authorization: `Basic ${encodedSecretKey}`,
          },
        },
      );

      return response.data;
    } catch (error: any) {
      throw new BadRequestException('결제 조회에 실패했습니다');
    }
  }

  // 결제 취소
  async cancelPayment(paymentKey: string, reason: string) {
    try {
      const encodedSecretKey = Buffer.from(`${this.secretKey}:`).toString('base64');

      const response = await axios.post(
        `${this.baseUrl}/payments/${paymentKey}/cancel`,
        { cancelReason: reason },
        {
          headers: {
            Authorization: `Basic ${encodedSecretKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return {
        success: true,
        cancellation: response.data,
      };
    } catch (error: any) {
      throw new BadRequestException('결제 취소에 실패했습니다');
    }
  }
}




