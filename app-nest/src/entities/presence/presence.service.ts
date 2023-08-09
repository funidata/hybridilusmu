import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { Presence, PresenceRepository } from "./presence.entity";

@Injectable()
export class PresenceService {
  constructor(
    @InjectRepository(Presence) private presenceRepository: PresenceRepository,
    private dataSource: DataSource,
  ) {}

  async upsert(presence: Presence) {
    return this.dataSource
      .createQueryBuilder()
      .insert()
      .into(Presence)
      .values(presence)
      .orUpdate(["type"], ["userId", "date"])
      .execute();
  }
}
