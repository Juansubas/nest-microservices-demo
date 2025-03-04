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
import { User } from '../common/decorators/user.decorator';
import { User as IUser } from './entities/auth.entity';
import { Token } from 'src/common/decorators/token.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
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

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('verify')
  verify(@User() user: IUser, @Token() token: string) {
    return {user, token};
  }

}
