import { Controller, Get } from '@nestjs/common';
import { StatusService } from './status.service';

@Controller('status')
export class StatusController {
  constructor(private readonly statusService: StatusService) {}

  /**
   * GET /status  — public
   * Returns { status: 'active' } or { status: 'inactive' }
   * Electron app calls this on every launch.
   */
  @Get()
  async getStatus() {
    return this.statusService.getStatus();
  }
}

