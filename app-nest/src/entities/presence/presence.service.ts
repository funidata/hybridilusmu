import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Presence, PresenceRepository } from "./presence.entity";

@Injectable()
export class PresenceService {
  constructor(
    @InjectRepository(Presence) private presenceRepository: PresenceRepository,
  ) {}

  async add(presence: Partial<Presence>) {
    return this.presenceRepository.save(presence);
  }
}
