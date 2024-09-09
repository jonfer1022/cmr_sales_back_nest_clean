import { IsNotEmpty, IsString } from 'class-validator';

export class AuthSignInDto {
  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}

export class AuthSignUpDto extends AuthSignInDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}

export class AuthConfirmSignUpDto extends AuthSignUpDto {
  @IsNotEmpty()
  @IsString()
  code: string;
}
