import { Global, Module, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigurableBoltModule } from "./bolt.module-definition";
import { BoltService } from "./bolt.service";

@Global()
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
    await this.boltService.connect();
  }

  async onModuleDestroy() {
    await this.boltService.disconnect();
  }
}
