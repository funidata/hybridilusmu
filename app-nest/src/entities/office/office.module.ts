import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Office } from "./office.entity";
import { OfficeService } from "./office.service";

@Module({
  imports: [TypeOrmModule.forFeature([Office])],
  providers: [OfficeService],
  exports: [TypeOrmModule, OfficeService],
})
export class OfficeModule {}
