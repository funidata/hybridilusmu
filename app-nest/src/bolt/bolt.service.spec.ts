import { Test } from "@nestjs/testing";
import { createMock } from "@golevelup/ts-jest";
import { BoltService } from "./bolt.service";
import { BOLT_MODULE_OPTIONS_TOKEN } from "./bolt.module-definition";
import { App } from "@slack/bolt";
import { StringIndexed } from "@slack/bolt/dist/types/helpers";

jest.mock("@slack/bolt");

describe("BoltService", () => {
  let boltService: BoltService;

  beforeEach(async () => {
    const app = await Test.createTestingModule({
      providers: [
        BoltService,
        {
          provide: BOLT_MODULE_OPTIONS_TOKEN,
          useValue: {
            token: "",
            appToken: "",
            signingSecret: "",
          },
        },
      ],
    }).compile();

    boltService = app.get<BoltService>(BoltService);
    boltService["bolt"] = createMock<App<StringIndexed>>();
  });

  describe("Slack connection", () => {
    it("Connection is initialized", () => {
      expect(boltService["bolt"].start).not.toBeCalled();
      boltService.connect();
      expect(boltService["bolt"].start).toBeCalledTimes(1);
    });

    it("Connection is closed cleanly", () => {
      expect(boltService["bolt"].stop).not.toBeCalled();
      boltService.disconnect();
      expect(boltService["bolt"].stop).toBeCalledTimes(1);
    });
  });
});
