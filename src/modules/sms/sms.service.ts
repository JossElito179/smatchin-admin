import { Injectable} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';


@Injectable()
export class SmsService {
  private readonly API_URL = 'https://api.smsphoneapi.com/v1/sms/send';
  private readonly API_KEY = process.env.SMS_PHONE_API_KEY;

  constructor(private readonly http: HttpService) {}

  async sendSMS(to: string, message: string): Promise<void> {
    await firstValueFrom(
      this.http.post(
        this.API_URL,
        {
          to,
          message,
        },
        {
          headers: {
            Authorization: `Bearer ${this.API_KEY}`,
            'Content-Type': 'application/json',
          },
        },
      ),
    );
  }
}
