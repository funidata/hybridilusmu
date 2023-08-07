import { Module } from "@nestjs/common";
import { SyncModule } from "../sync/sync.module";
import { DevToolsController } from "./dev-tools.controller";

@Module({ imports: [SyncModule], controllers: [DevToolsController] })
export class DevToolsModule {}
