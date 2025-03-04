import { Body, Controller, Get, Inject, Post, Put, UseGuards } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { AuthGuard } from 'src/auth/auth.guard';
import { NATS_SERVICE } from 'src/config';
import { CreateOrderDto } from './dtos/create-order.dto';
import { User as IUser } from 'src/auth/entities/auth.entity';
import { User } from 'src/common/decorators/user.decorator';
import { catchError } from 'rxjs';
import { UpdateOrderDto } from './dtos/update-order.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}

  @UseGuards(AuthGuard)
  @Post('create')
  create(@Body() createOrderDto: CreateOrderDto, @User() user: IUser){
    return this.client.send('order.create', {...createOrderDto, userId: user.id})
    .pipe(
      catchError(error => {
        throw new RpcException(error)
      })
    );
  }

  @UseGuards(AuthGuard)
  @Get('findAll')
  findAll(@User() user: IUser){
    return this.client.send('order.findAll', user.id)
    .pipe(
      catchError(error => {
        throw new RpcException(error)
      })
    );
  }

  @UseGuards(AuthGuard)
  @Put('update')
  update(@Body() updateOrderDto: UpdateOrderDto, @User() user: IUser) {
    return this.client.send('order.update', 
      { ...updateOrderDto, userId: user.id } 
    ).pipe(
      catchError(error => {
        throw new RpcException(error);
      })
    );
  }

}
