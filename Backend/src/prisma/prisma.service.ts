import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

type PrismaInstance = InstanceType<typeof PrismaClient>;

/**
 * PrismaService wraps the Prisma v7 client (composition, not inheritance)
 * and exposes model delegates as properties for use in other services.
 */
@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly _client: PrismaInstance;

  constructor() {
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
    this._client = new PrismaClient({ adapter }) as unknown as PrismaInstance;
  }

  /** Access all Prisma models via this property */
  get db(): PrismaInstance {
    return this._client;
  }

  async onModuleInit() {
    await (this._client as any).$connect();

    // Seed the single-row status if it doesn't exist yet
    await (this._client as any).appStatus.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1, status: 'active' },
    });
  }

  async onModuleDestroy() {
    await (this._client as any).$disconnect();
  }
}

