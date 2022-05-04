import { PrismaService } from '../db/prisma.service';
import { Module } from '@nestjs/common';
import { DbService } from './db.service';

@Module({
  imports: [PrismaService],
  controllers: [],
  providers: [DbService, PrismaService],
  exports: [DbService],
})
export class DbModule {}
