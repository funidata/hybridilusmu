const { DATABASE_NAME, DATABASE_USERNAME, DATABASE_PASSWORD, DATABASE_HOST } = process.env;

const commonConfig = {
  username: DATABASE_USERNAME,
  password: DATABASE_PASSWORD,
  database: DATABASE_NAME,
  host: DATABASE_HOST,
  dialect: "postgres",
};

module.exports = {
  development: commonConfig,
  production: commonConfig,
};
