import { Test } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import configuration from "../src/config/configuration";
import { EntitiesModule } from "../src/entities/entities.module";
import { GuiModule } from "../src/gui/gui.module";
import testConfiguration from "./testConfiguration";

const createTestingModule = () =>
  Test.createTestingModule({
    imports: [
      TypeOrmModule.forRoot({
        type: "postgres",
        host: testConfiguration.database.host,
        port: configuration.database.port,
        username: testConfiguration.database.username,
        password: testConfiguration.database.password,
        database: testConfiguration.database.name,
        synchronize: true,
        autoLoadEntities: true,
      }),
      GuiModule,
      EntitiesModule,
    ],
  });

export default createTestingModule;
