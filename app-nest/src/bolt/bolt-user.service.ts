import { Injectable } from "@nestjs/common";
import { BoltService } from "./bolt.service";

@Injectable()
export class BoltUserService {
  constructor(private boltService: BoltService) {}

  async getUsers() {
    return this.boltService.getBolt().client.users.list();
  }
}
