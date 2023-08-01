import { ConfigurableModuleBuilder } from "@nestjs/common";

export interface BoltModuleOptions {
  token: string;
  appToken: string;
  signingSecret: string;
}

const {
  ConfigurableModuleClass: ConfigurableBoltModule,
  MODULE_OPTIONS_TOKEN: BOLT_MODULE_OPTIONS_TOKEN,
} = new ConfigurableModuleBuilder<BoltModuleOptions>().build();

export { ConfigurableBoltModule, BOLT_MODULE_OPTIONS_TOKEN };
