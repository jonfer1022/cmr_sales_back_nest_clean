import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthModule } from './use-cases/authentication/auth.module';
import { PrismaModule } from './infrastructure/database/prisma/prisma.module';
import { AuthMiddleware } from './core/middlewares/auth.middleware';
import { UserPrismaRepository } from './infrastructure/database/prisma/Repositories/user-prisma.repository';
import { CognitoService } from './infrastructure/aws-services/cognito.service';
import { SalesModule } from './use-cases/sales/sales.module';

const api = 'api';
export const pathsExcluded = [
  `${api}/auth/signup`,
  `${api}/auth/confirm-signup`,
  `${api}/auth/login`,
];

@Module({
  imports: [AuthModule, PrismaModule, SalesModule],
  providers: [
    {
      provide: 'UserRepository', //This provider was added to the Middleware works fine.
      useClass: UserPrismaRepository,
    },
    {
      provide: CognitoService, //Service required for AuthMiddleware
      useFactory: () => {
        return new CognitoService(
          process.env.AWS_COGNITO_REGION || 'us-east-1',
          process.env.AWS_COGNITO_CLIENT_ID || 'client-id',
          process.env.AWS_COGNITO_CLIENT_SECRET || 'client-secret',
        );
      },
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(...pathsExcluded)
      .forRoutes('*');
  }
}
