import { Module } from "@nestjs/common";
import { DevToolsBuilder } from "./dev-tools.builder";

@Module({ providers: [DevToolsBuilder], exports: [DevToolsBuilder] })
export class DevToolsModule {}
