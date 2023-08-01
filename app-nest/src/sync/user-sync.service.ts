import { Injectable } from "@nestjs/common";
import { BoltUserService } from "../bolt/bolt-user.service";

@Injectable()
export class UserSyncService {
  constructor(private boltUserService: BoltUserService) {}

  async syncUsers() {
    const users = await this.boltUserService.getUsers();

    // console.log(users);
    for (const user of users.members) {
      console.log(user);
      console.log(user.profile);
    }
  }
}
