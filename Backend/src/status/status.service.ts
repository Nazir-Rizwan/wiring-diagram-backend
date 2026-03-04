import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type AppStatus = 'active' | 'inactive';

@Injectable()
export class StatusService {
  constructor(private readonly configService: ConfigService) {}

  getStatus(): { status: AppStatus } {
    const raw = this.configService.get<string>('APP_STATUS', 'active');
    const status: AppStatus = raw === 'inactive' ? 'inactive' : 'active';
    return { status };
  }
}
