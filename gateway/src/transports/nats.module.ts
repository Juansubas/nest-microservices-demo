import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { EnvironmentVariables, NATS_SERVICE } from "src/config";

@Module({
  imports: [
    ClientsModule.register([
      {
        name: NATS_SERVICE,
        transport: Transport.NATS,
        options: {
          servers: EnvironmentVariables.natsServer
        }
      }
    ])
  ],
  exports: [
    ClientsModule.register([
      {
        name: NATS_SERVICE,
        transport: Transport.NATS,
        options: {
          servers: EnvironmentVariables.natsServer
        }
      }
    ])
  ]
})

export class NatsModule {

}