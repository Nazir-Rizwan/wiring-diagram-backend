import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';

@Module({
  providers: [
    {
      provide: 'NEON_CONNECTION',
      inject: [ConfigService],
      useFactory: (config: ConfigService): Pool => {
        return new Pool({
          connectionString: config.getOrThrow<string>('DATABASE_URL'),
        });
      },
    },
  ],
  exports: ['NEON_CONNECTION'],
})
export class DatabaseModule {}
