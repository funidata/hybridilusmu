import { Module, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigurableBoltModule } from "./bolt.module-definition";
import { BoltService } from "./bolt.service";

@Module({
  providers: [BoltService],
  exports: [BoltService],
})
export class BoltModule
  extends ConfigurableBoltModule
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private boltService: BoltService) {
    super();
  }
  async onModuleInit() {
    // TODO: Connect to Slack.
    await this.boltService.connect();
  }

  onModuleDestroy() {
    // TODO: Close Slack connection.
  }
}
