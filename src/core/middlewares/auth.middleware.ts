import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { RequestAuth } from '../types/request.type';
import { CognitoService } from 'src/infrastructure/aws-services/cognito.service';
import {
  UserAttributes,
  UserRepository,
} from 'src/application/interfaces/user-repository.interface';
import { Response } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    private readonly cognitoService: CognitoService,
  ) {}

  async use(req: RequestAuth, res: Response, next: (error?: any) => void) {
    const { authorization } = req.headers;
    const accessToken = authorization?.split('Bearer ')[1];

    if (!accessToken) {
      return res.status(401).send({ message: 'Unauthorized' });
    } else {
      const userVerified =
        await this.cognitoService.verifyAccessToken(accessToken);
      req.user = { token: accessToken };

      userVerified.UserAttributes.forEach(
        (element: { Name: string; Value: string }) => {
          if (element.Name === 'email') {
            req.user.email = element.Value;
          } else if (element.Name === 'name') {
            req.user.name = element.Value;
          }
        },
      );

      const user = await this.userRepository.getTheFirstByAttribute(
        UserAttributes.EMAIL,
        req.user.email,
      );

      if (!user) return res.status(401).send({ message: 'User not found' });
      req.user.id = user.id;
      next();
    }
  }
}
