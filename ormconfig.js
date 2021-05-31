// eslint-disable-next-line @typescript-eslint/no-var-requires
const { config } = require('dotenv');
config();

module.exports = {
  type: 'mysql',
  host: process.env.DB_HOST,
  port: 3306,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities: ['entities/*.js', 'entities/*.ts'],
  migrations: ['dist/migrations/*.js'],
  cli: {
    migrationsDir: 'migrations',
  },
};
