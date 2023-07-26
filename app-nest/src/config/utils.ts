import configuration from "./configuration";

export const inDevelopmentEnvironment: boolean =
  configuration.nodeEnv === "development";
