import { IsEmail, isString, IsString, MaxLength, MinLength } from "class-validator";

export class loginUserDto{
  
  @IsEmail()
  @IsString()
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(55)
  password: string;
}