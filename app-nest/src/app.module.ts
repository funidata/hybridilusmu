import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BoltModule } from "./bolt/bolt.module";
import configuration from "./config/configuration";
import { inDevelopmentEnvironment } from "./config/utils";

@Module({
  imports: [
    BoltModule.register({
      token: configuration.bolt.token,
      appToken: configuration.bolt.appToken,
      signingSecret: configuration.bolt.signingSecret,
    }),
    TypeOrmModule.forRoot({
      type: "postgres",
      host: configuration.database.host,
      port: configuration.database.port,
      username: configuration.database.username,
      password: configuration.database.password,
      database: configuration.database.name,
      synchronize: inDevelopmentEnvironment,
      autoLoadEntities: true,
    }),
  ],
})
export class AppModule {}
