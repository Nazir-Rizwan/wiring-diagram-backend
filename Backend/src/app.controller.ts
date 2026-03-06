import { Controller, Get, InternalServerErrorException } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * GET /
   * Tests the Neon Postgres connection and returns the database version.
   */
  @Get()
  async getDbVersion() {
    try {
      return await this.appService.getDbVersion();
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
