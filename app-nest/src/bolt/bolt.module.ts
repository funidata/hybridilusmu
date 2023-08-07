import { DiscoveryModule } from "@golevelup/nestjs-discovery";
import {
  Global,
  Module,
  OnApplicationBootstrap,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
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
  implements OnModuleInit, OnApplicationBootstrap, OnModuleDestroy
{
  constructor(
    private boltService: BoltService,
    private boltRegisterService: BoltRegisterService,
  ) {
    super();
  }

  async onModuleInit() {
    await this.boltService.connect();
  }

  async onApplicationBootstrap() {
    await this.boltRegisterService.registerAllHandlers();
  }

  async onModuleDestroy() {
    await this.boltService.disconnect();
  }
}
