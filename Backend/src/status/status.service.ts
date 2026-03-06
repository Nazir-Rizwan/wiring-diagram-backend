import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type AppStatus = 'active' | 'inactive';

@Injectable()
export class StatusService {
  constructor(private readonly prisma: PrismaService) {}

  async getStatus(): Promise<{ status: AppStatus }> {
    const row = await (this.prisma.db as any).appStatus.findUnique({ where: { id: 1 } });
    const status: AppStatus = row?.status === 'inactive' ? 'inactive' : 'active';
    return { status };
  }

  async setStatus(newStatus: AppStatus): Promise<{ status: AppStatus }> {
    const row = await (this.prisma.db as any).appStatus.upsert({
      where: { id: 1 },
      update: { status: newStatus },
      create: { id: 1, status: newStatus },
    });
    return { status: row.status as AppStatus };
  }
}
