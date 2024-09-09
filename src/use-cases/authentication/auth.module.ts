import { Module } from '@nestjs/common';
import { AuthUseCase } from './auth.usecase';
import { PrismaModule } from 'src/infrastructure/database/prisma/prisma.module';
import { UserPrismaRepository } from 'src/infrastructure/database/prisma/Repositories/user-prisma.repository';
import { CognitoService } from 'src/infrastructure/aws-services/cognito.service';
import { AuthController } from 'src/controllers/authentication/auth.controller';

@Module({
  imports: [PrismaModule],
  controllers: [AuthController],
  providers: [
    AuthUseCase,
    {
      provide: CognitoService,
      useFactory: () => {
        return new CognitoService(
          process.env.AWS_COGNITO_REGION || 'us-east-1',
          process.env.AWS_COGNITO_CLIENT_ID || 'client-id',
          process.env.AWS_COGNITO_CLIENT_SECRET || 'client-secret',
        );
      },
    },
    {
      provide: 'UserRepository',
      useClass: UserPrismaRepository,
    },
  ],
  exports: [AuthUseCase],
})
export class AuthModule {}
