import { BadRequestException, Injectable, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { IJwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { environments } from 'src/config/environments';
import { RpcException } from '@nestjs/microservices';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit {
  constructor(private readonly jwtService: JwtService){
    super();
  }

  async onModuleInit() {
    await this.$connect();
  }

  async register(registerUserDto: RegisterUserDto) {
    const exist = await this.user.findUnique({
      where: {
        email: registerUserDto.email
      }
    })

    if(exist) {
      throw new RpcException({
        status: 400,
        message: `${registerUserDto.email} is already registered`,
      })
    }

    const newUser = await this.user.create({
      data: {
        ...registerUserDto,
        password: bcrypt.hashSync(registerUserDto.password, 10),
      }
    })
    
    return newUser;
  }

  async login(loginUserDto: LoginUserDto) {

    const exist = await this.user.findUnique({
      where: {
        email: loginUserDto.email
      }
    });

    if(!exist) {
      throw new RpcException({
        status: 400, 
        message: 'user is not registered'
      });
    }

    const isPasswordCorrect = bcrypt.compareSync(loginUserDto.password, exist.password);
    if(!isPasswordCorrect) {
      throw new RpcException({
        status: 401, 
        message: 'password is incorrect'
      });
    }

    const { password: _, createdAt: __, updatedAt: ___, ...rest } = exist;

    return {
      user: rest,
      token: this.signJwt(rest),
    }
  }

  async verify(token: string) {
    try {
      const { sub: _, iat: __, exp: ___, ...user} = this.jwtService.verify(token, {
        secret: environments.jwtSecret
      });

      return {
        user: user,
        token: this.signJwt(user),
      }
    } catch (error) {
      throw new RpcException({
        status: 400,
        message: error.message
      })
    }
  }

  signJwt(payload : IJwtPayload) {
    return this.jwtService.sign(payload);
  }
}
