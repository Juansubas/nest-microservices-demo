import { Injectable, OnModuleInit } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaClient } from '@prisma/client';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {
  async create(createOrderDto: CreateOrderDto) {
    try {
      return await this.order.create({
        data: createOrderDto,
      });
    } catch (error) {
      throw new RpcException({
        status: 400,
        message: error.message,
      });
    }
  }

  async onModuleInit() {
    await this.$connect();
  }

  async findAll(userId: string) {
    return await this.order.findMany({
      where: { userId },
    });
  }

  async update(orderId: string, updateOrderDto: UpdateOrderDto) {
    const { orderId: _, ...data } = updateOrderDto; // Eliminar orderId de los datos
  
    return await this.order.update({
      where: { id: orderId },
      data
    });
  }
  
}
