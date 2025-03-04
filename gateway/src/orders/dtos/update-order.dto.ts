import { IsEnum, IsInt, IsString, MaxLength, Min } from "class-validator";

export enum OrderStatus {
  PENDIENTE = 'Pendiente',
  EN_PROCESO = 'En proceso',
  COMPLETADO = 'Completado',
}

export class UpdateOrderDto {
  @IsString()
  productId: string;

  @IsString()
  @MaxLength(55)
  title: string;
  
  @IsInt()
  @Min(1, { message: 'La cantidad debe ser al menos 1' })
  quantity: number;

  @IsEnum(OrderStatus, { message: "El estatus debe ser 'Pendiente', 'En proceso' o 'Completado'" })
  status: OrderStatus;

  @IsString()
  orderId: string;
}
