import { DiscoveryModule } from "@golevelup/nestjs-discovery";
import { Global, Module, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { BoltRegisterService } from "./bolt-register.service";
import { BoltUserService } from "./bolt-user.service";
import { ConfigurableBoltModule } from "./bolt.module-definition";
import { BoltService } from "./bolt.service";

@Global()
@Module({
  imports: [DiscoveryModule],
  providers: [BoltService, BoltRegisterService, BoltUserService],
  exports: [BoltService, BoltUserService],
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
    await this.boltRegisterService.registerActions();
  }

  async onModuleDestroy() {
    await this.boltService.disconnect();
  }
}
