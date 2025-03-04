import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Inject,
} from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import { loginUserDto } from './dto/login-user.dto';
import { AuthGuard } from './auth.guard';
import { NATS_SERVICE } from 'src/config';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError } from 'rxjs';
import { User } from './decorators/user.decorator';
import { Token } from './decorators/token.decorator';
import { User as IUser } from './entities/auth.entity';

@Controller('auth')
export class AuthController {
  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}

  @Post('register')
  register(@Body() registerUserDto: RegisterUserDto) {
    return this.client.send('auth.register', registerUserDto)
      .pipe(
        catchError( error => {
          throw new RpcException(error);
        })
      );
  }

  @Post('login')
  login(@Body() loginUserDto: loginUserDto) {
    return this.client.send('auth.login', loginUserDto)
      .pipe(
        catchError( error => {
          throw new RpcException(error);
        })
      );
  }

  @UseGuards(AuthGuard)
  @Get('verify')
  verify(@User() user: IUser, @Token() token: string) {
    return {user, token};
  }

}
