import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { EnvironmentVariables } from './config';
import { GlobalRpcExceptionFilter } from './common/exceptions/rpc-exception.filter';

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
  await app.listen(EnvironmentVariables.port);
  logger.log(`Gateway is running on port ${EnvironmentVariables.port}`)
}
main();
