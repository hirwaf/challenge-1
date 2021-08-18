export default {
  type: process.env.TYPEORM_TYPE,
  host: process.env.TYPEORM_HOST,
  username: process.env.TYPEORM_USERNAME,
  password: process.env.TYPEORM_PASSWORD,
  database: process.env.TYPEORM_DATABASE,
  port: parseInt(process.env.TYPEORM_PORT),
  logging: process.env.TYPEORM_LOGGING === 'true',
  entities: ['../app/**/entities/*.entity{.ts,.js}'],
  migrationsRun: process.env.TYPEORM_MIGRATIONS_RUN === 'true',
  synchronize: process.env.TYPEORM_SYNCHRONIZE === 'true',
  autoLoadEntities: true,
};
