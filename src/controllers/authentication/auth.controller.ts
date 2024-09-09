import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import {
  AuthConfirmSignUpDto,
  AuthSignInDto,
  AuthSignUpDto,
} from 'src/core/dtos/auth.dto';
import { RequestAuth } from 'src/core/types/request.type';
import { AuthUseCase } from 'src/use-cases/authentication/auth.usecase';

@Controller('api/auth')
export class AuthController {
  constructor(private authUseCase: AuthUseCase) {}

  @Post('/login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() authDto: AuthSignInDto) {
    return this.authUseCase.login(authDto.email, authDto.password);
  }

  @Post('/signup')
  @HttpCode(HttpStatus.CREATED)
  async signUp(@Body() authDto: AuthSignUpDto) {
    return await this.authUseCase.signUp(authDto);
  }

  @Post('/confirm-signup')
  @HttpCode(HttpStatus.OK)
  async confirmSignUp(@Body() authDto: AuthConfirmSignUpDto) {
    return await this.authUseCase.confirmSignUp(authDto, authDto.code);
  }

  @Post('/signout')
  @HttpCode(HttpStatus.OK)
  async signOut(@Req() req: RequestAuth) {
    return await this.authUseCase.signOut(req.user.token);
  }
}
