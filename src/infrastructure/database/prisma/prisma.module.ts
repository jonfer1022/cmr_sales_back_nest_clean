import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { UserPrismaRepository } from './Repositories/user-prisma.repository';

@Module({
  providers: [PrismaService, UserPrismaRepository],
  exports: [UserPrismaRepository, PrismaService],
})
export class PrismaModule {}