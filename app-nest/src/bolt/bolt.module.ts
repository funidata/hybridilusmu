import { DiscoveryModule } from "@golevelup/nestjs-discovery";
import { Global, Module, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { BoltRegisterService } from "./bolt-register.service";
import { ConfigurableBoltModule } from "./bolt.module-definition";
import { BoltService } from "./bolt.service";

@Global()
@Module({
  imports: [DiscoveryModule],
  providers: [BoltService, BoltRegisterService],
  exports: [BoltService],
})
export class BoltModule
  extends ConfigurableBoltModule
  implements OnModuleInit, OnModuleDestroy
{
  constructor(
    private boltService: BoltService,
    private boltRegisterService: BoltRegisterService,
  ) {
    super();
  }

  async onModuleInit() {
    await this.boltService.connect();
    await this.boltRegisterService.registerEvents();
  }

  async onModuleDestroy() {
    await this.boltService.disconnect();
  }
}
