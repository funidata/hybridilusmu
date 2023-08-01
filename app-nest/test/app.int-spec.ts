import { INestApplication } from "@nestjs/common";
import { UserService } from "../src/entities/user/user.service";
import createTestingModule from "./test-app.module";

describe("App", () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture = await createTestingModule().compile();
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it("Find all users", async () => {
    const userService = app.get(UserService);
    const users = await userService.findAll();
    expect(users).toHaveLength(0);
  });
});
