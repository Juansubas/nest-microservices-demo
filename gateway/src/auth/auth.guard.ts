import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { firstValueFrom, Observable } from "rxjs";
import { NATS_SERVICE } from "src/config";

export class AuthGuard implements CanActivate {
  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy){}
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const token = this.tokenExtractor(request);

    if (!token) {
      throw new UnauthorizedException(); // Corrección: "thrown" → "throw"
    }

    try {
      const { user, token: newToken } = await firstValueFrom(
        this.client.send('verify.token', token)
      );
      request.user = user;
      request.token = newToken;
      return true;
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException();
    }
  }

  private tokenExtractor(request: any): string | undefined { 
    // Corrección: Tipo de "request" cambiado a "any" ya que no se importa "Request" de "express".
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
