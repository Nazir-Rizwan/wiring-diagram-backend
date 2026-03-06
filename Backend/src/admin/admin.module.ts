import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminGuard } from './admin.guard';
import { StatusModule } from '../status/status.module';

@Module({
  imports: [StatusModule],
  controllers: [AdminController],
  providers: [AdminGuard],
})
export class AdminModule {}
