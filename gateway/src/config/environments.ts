import 'dotenv/config';
import * as joi from 'joi';

interface EnvironmentVariables {
  PORT: number;
  NATS_SERVER: string;
}

const environmentSchema = joi
  .object({
    PORT: joi.number().required(),
    NATS_SERVER: joi.string().required(),
  })
  .unknown();

const { error, value } = environmentSchema.validate({
  ...process.env,
});

if (error) {
  throw new Error(`Environments error ${error.message}`);
}

const env: EnvironmentVariables = value;

export const EnvironmentVariables = {
  port: env.PORT,
  natsServer: env.NATS_SERVER,
};
