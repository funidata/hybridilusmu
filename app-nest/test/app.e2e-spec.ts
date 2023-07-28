import { DiscoveryModule } from "@golevelup/nestjs-discovery";
import { createMock } from "@golevelup/ts-jest";
import { INestApplication, Module } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BoltModule } from "../src/bolt/bolt.module";
import { BoltService } from "../src/bolt/bolt.service";
import configuration from "../src/config/configuration";
import { EntitiesModule } from "../src/entities/entities.module";
import { UserService } from "../src/entities/user/user.service";
import { GuiModule } from "../src/gui/gui.module";
import testConfiguration from "./testConfiguration";

@Module({
  imports: [DiscoveryModule],
  providers: [],
  exports: [createMock<BoltService>],
})
class MockBolt {}

describe("AppController (e2e)", () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      // imports: [AppModule],
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
    })
      .overrideModule(BoltModule)
      .useModule(MockBolt)
      // .overrideProvider(BoltService)
      // .useClass(createMock<BoltService>())
      // .overrideProvider(BoltRegisterService)
      // .useClass(createMock<BoltRegisterService>())
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("Find all users", async () => {
    const userService = app.get(UserService);
    const users = await userService.findAll();
    expect(users).toHaveLength(1);
  });
});
