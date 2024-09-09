import { Inject, Injectable } from '@nestjs/common';
import {
  UserAttributes,
  UserRepository,
} from 'src/application/interfaces/user-repository.interface';
import { AuthSignUpDto } from '../../../src/core/dtos/auth.dto';
import { CognitoService } from 'src/infrastructure/aws-services/cognito.service';

@Injectable()
export class AuthUseCase {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    private readonly cognitoService: CognitoService,
  ) {}

  async login(email: string, password: string) {
    try {
      const user = await this.userRepository.getTheFirstByAttribute(
        UserAttributes.EMAIL,
        email,
      );

      if (!user) throw new Error('User not found');

      const {
        AuthenticationResult: { AccessToken, RefreshToken },
      } = await this.cognitoService.signIn(email, password);

      return { accessToken: AccessToken, refreshToken: RefreshToken };
    } catch (error) {
      const { message } = error;
      throw new Error('Failed to sign in: ' + message);
    }
  }

  async signUp(authDto: AuthSignUpDto) {
    try {
      const { email, password, name } = authDto;
      const user = await this.userRepository.getTheFirstByAttribute(
        UserAttributes.EMAIL,
        email,
      );

      if (user) throw new Error('User already exists');

      const attributes = [
        {
          Name: 'name',
          Value: name,
        },
      ];

      const result = await this.cognitoService.signUp(
        email,
        password,
        attributes,
      );

      return result;
    } catch (error) {
      const { message } = error;
      throw new Error('Failed to sign up: ' + message);
    }
  }

  async confirmSignUp(authDto: AuthSignUpDto, code: string) {
    try {
      const { email, name, password } = authDto;

      const user = await this.userRepository.getTheFirstByAttribute(
        UserAttributes.EMAIL,
        email,
      );

      if (user) throw new Error('User already exists');

      await this.cognitoService.confirmSignUp(email, code);

      await this.userRepository.create({
        id: email,
        name,
        email,
      });

      const {
        AuthenticationResult: { AccessToken, RefreshToken },
      } = await this.cognitoService.signIn(email, password);

      return { accessToken: AccessToken, refreshToken: RefreshToken };
    } catch (error) {
      const { message } = error;
      throw new Error('Failed to confirm sign up: ' + message);
    }
  }

  async signOut(accessToken: string) {
    try {
      await this.cognitoService.signOut(accessToken);
      return 'Signed out';
    } catch (error) {
      const { message } = error;
      throw new Error('Failed to sign out: ' + message);
    }
  }
}
