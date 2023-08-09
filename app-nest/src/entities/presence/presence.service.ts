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

  async upsert(presence: Partial<Presence>) {
    // Select only existing cols for the upsert operation to avoid overriding
    // existing data with defaults/nulls.
    const primaryKeys = ["userId", "date"];
    const updatableCols = Object.keys(presence).filter(
      (key) => !primaryKeys.includes(key),
    );

    return this.dataSource
      .createQueryBuilder()
      .insert()
      .into(Presence)
      .values(presence)
      .orUpdate(updatableCols, primaryKeys)
      .execute();
  }

  async remove(presence: Pick<Presence, "userId" | "date">) {
    return this.presenceRepository.delete(presence);
  }
}
