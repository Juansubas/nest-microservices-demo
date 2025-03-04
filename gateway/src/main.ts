import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { EnvironmentVariables } from './config';
import { GlobalRpcExceptionFilter } from './common/exceptions/rpc-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function main() {
  const logger = new Logger("Gateway");
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalFilters((
    new GlobalRpcExceptionFilter()
  ));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, //Elimina propiedades no permitidas
      forbidNonWhitelisted: true //Prohibe las propiedades que no estan permitidas.
    })
  );

  const config = new DocumentBuilder()
    .setTitle("App Pedidos")
    .setDescription("La app de pedidos con microservicios")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("swagger", app, document,  {
    jsonDocumentUrl: 'swagger/json',
  });

  await app.listen(EnvironmentVariables.port);
  logger.log(`Gateway is running on port ${EnvironmentVariables.port}`)
}
main();
