import { Controller, Get } from '@nestjs/common';
import { StatusService } from './status.service';

@Controller('status')
export class StatusController {
  constructor(private readonly statusService: StatusService) {}

  /**
   * GET /status
   * Returns { status: 'active' } or { status: 'inactive' }
   * Electron app polls this endpoint on startup.
   */
  @Get()
  getStatus() {
    return this.statusService.getStatus();
  }
}
