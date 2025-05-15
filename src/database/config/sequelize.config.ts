import { SequelizeOptions } from 'sequelize-typescript';
import { Dialect } from 'sequelize';

const commonConfig: Partial<SequelizeOptions> = {
  dialect: 'postgres' as Dialect,
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'rickandmorty',
  models: [__dirname + '../entities/*.entity.ts'],
  logging: false,
};

const config: { [key: string]: SequelizeOptions } = {
  development: {
    ...commonConfig
  }
};

export = config;