import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({
    path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development',
});

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3307,
  username: process.env.DB_USERNAME || 'user',
  password: process.env.DB_PASSWORD || 'userpass',
  database: process.env.DB_NAME || 'smatching_db',
  synchronize: false,
  logging: false,
  entities: [path.join(__dirname, '/**/*.entity{.ts,.js}')],
  migrations: [path.join(__dirname, '/migration/**/*{.ts,.js}')],
  charset: 'utf8mb4',
  subscribers: [],
  extra: {
    charset: 'utf8mb4',
    connectionLimit: 10,
    connectTimeout: 10000,
    acquireTimeout: 10000,
    waitForConnections: true,
    enableKeepAlive: true,
    keepAliveInitialDelayMs: 0,
    initSql: [
      "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
    ],
  },
});
