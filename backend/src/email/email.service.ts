import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT');
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: port || 587,
        secure: port === 465,
        auth: { user, pass },
      });
      this.logger.log('Email transporter initialized');
    } else {
      this.logger.warn('Email transporter not configured - emails will be logged only');
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    const from = this.configService.get<string>('SMTP_FROM') || 'noreply@roadmap.com';

    if (!this.transporter) {
      this.logger.log(`[Mock Email] To: ${options.to}, Subject: ${options.subject}`);
      this.logger.debug(`Content: ${options.text || options.html}`);
      return true;
    }

    try {
      await this.transporter.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
      this.logger.log(`Email sent to ${options.to}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}:`, error);
      return false;
    }
  }

  // ========== 템플릿 이메일 메서드 ==========

  async sendWelcomeEmail(to: string, name: string, role: string): Promise<boolean> {
    const roleLabel = role === 'STUDENT' ? '학생' : role === 'PARENT' ? '보호자' : '컨설턴트';
    
    return this.sendEmail({
      to,
      subject: '🎉 입시로드맵에 오신 것을 환영합니다!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Apple SD Gothic Neo', sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #0ea5e9, #6366f1); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px; }
            .button { display: inline-block; background: #0ea5e9; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎓 입시로드맵</h1>
              <p>고등학교 입시 준비의 시작</p>
            </div>
            <div class="content">
              <h2>안녕하세요, ${name}님! 👋</h2>
              <p><strong>${roleLabel}</strong>으로 가입해주셔서 감사합니다.</p>
              <p>입시로드맵과 함께 체계적인 입시 준비를 시작해보세요:</p>
              <ul>
                <li>📊 맞춤형 진단 분석</li>
                <li>🤖 AI 멘토 상담</li>
                <li>📚 학습 계획 수립</li>
                <li>🏫 목표 학교 관리</li>
              </ul>
              <a href="http://localhost:4000/login" class="button">시작하기</a>
            </div>
            <div class="footer">
              <p>© 2025 입시로드맵. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `안녕하세요, ${name}님! 입시로드맵에 ${roleLabel}으로 가입해주셔서 감사합니다.`,
    });
  }

  async sendConsultationNotification(
    to: string,
    name: string,
    type: 'requested' | 'confirmed' | 'cancelled' | 'reminder',
    details: { date: string; time: string; consultantName?: string; studentName?: string }
  ): Promise<boolean> {
    const titles = {
      requested: '📋 새로운 상담 요청',
      confirmed: '✅ 상담이 확정되었습니다',
      cancelled: '❌ 상담이 취소되었습니다',
      reminder: '⏰ 상담 일정 알림',
    };

    const messages = {
      requested: `${details.studentName || '학생'}의 상담 요청이 접수되었습니다.`,
      confirmed: '상담 일정이 확정되었습니다.',
      cancelled: '상담이 취소되었습니다.',
      reminder: '예정된 상담이 곧 시작됩니다.',
    };

    return this.sendEmail({
      to,
      subject: titles[type],
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Apple SD Gothic Neo', sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #0ea5e9, #6366f1); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px; }
            .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0ea5e9; }
            .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${titles[type]}</h1>
            </div>
            <div class="content">
              <h2>안녕하세요, ${name}님!</h2>
              <p>${messages[type]}</p>
              <div class="info-box">
                <p><strong>📅 날짜:</strong> ${details.date}</p>
                <p><strong>⏰ 시간:</strong> ${details.time}</p>
                ${details.consultantName ? `<p><strong>👤 컨설턴트:</strong> ${details.consultantName}</p>` : ''}
                ${details.studentName ? `<p><strong>🎓 학생:</strong> ${details.studentName}</p>` : ''}
              </div>
              <a href="http://localhost:4000/dashboard" style="display: inline-block; background: #0ea5e9; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px;">대시보드 확인</a>
            </div>
            <div class="footer">
              <p>© 2025 입시로드맵. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
  }

  async sendInviteCode(to: string, name: string, inviteCode: string): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: '🔑 학생 초대 코드가 생성되었습니다',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Apple SD Gothic Neo', sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #0ea5e9, #6366f1); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px; }
            .code-box { background: white; padding: 30px; border-radius: 12px; text-align: center; margin: 20px 0; border: 2px dashed #0ea5e9; }
            .code { font-size: 32px; font-weight: bold; color: #0ea5e9; letter-spacing: 8px; }
            .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔗 학생 초대 코드</h1>
            </div>
            <div class="content">
              <h2>안녕하세요, ${name}님!</h2>
              <p>학생을 초대하기 위한 코드가 생성되었습니다.</p>
              <div class="code-box">
                <p style="margin: 0; color: #64748b;">초대 코드</p>
                <p class="code">${inviteCode}</p>
                <p style="margin: 0; color: #64748b; font-size: 12px;">7일간 유효</p>
              </div>
              <p>학생이 회원가입 시 이 코드를 입력하면 자동으로 연결됩니다.</p>
            </div>
            <div class="footer">
              <p>© 2025 입시로드맵. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
  }

  async sendDiagnosisComplete(to: string, name: string, score: number): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: '📊 진단 분석이 완료되었습니다',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Apple SD Gothic Neo', sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #0ea5e9, #6366f1); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px; }
            .score-box { background: white; padding: 30px; border-radius: 12px; text-align: center; margin: 20px 0; }
            .score { font-size: 48px; font-weight: bold; color: #0ea5e9; }
            .button { display: inline-block; background: #0ea5e9; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; }
            .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📊 진단 완료</h1>
            </div>
            <div class="content">
              <h2>안녕하세요, ${name}님!</h2>
              <p>입시 준비 진단 분석이 완료되었습니다.</p>
              <div class="score-box">
                <p style="margin: 0; color: #64748b;">종합 점수</p>
                <p class="score">${score}</p>
                <p style="margin: 0; color: #64748b;">/ 100</p>
              </div>
              <p>자세한 분석 결과와 맞춤 추천을 대시보드에서 확인하세요!</p>
              <a href="http://localhost:4000/dashboard/student/diagnosis" class="button">결과 확인하기</a>
            </div>
            <div class="footer">
              <p>© 2025 입시로드맵. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
  }
}



