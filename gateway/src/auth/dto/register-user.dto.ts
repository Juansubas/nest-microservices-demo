import { IsEmail, isString, IsString, MaxLength, MinLength } from "class-validator";

export class RegisterUserDto {

  @IsString()
  name: string;

  @IsEmail()
  @IsString()
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(55)
  password: string;
}