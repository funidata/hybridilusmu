import configuration from "../src/config/configuration";

/**
 * This configuration enables running integration test both in the Docker
 * container and on local machine (given that at least the database container
 * is running).
 */
const testConfiguration = {
  database: {
    host: configuration.database.host || "localhost",
    name: "test",
    username: configuration.database.username || "postgres",
    password: configuration.database.password || "postgres",
  },
};

export default testConfiguration;
