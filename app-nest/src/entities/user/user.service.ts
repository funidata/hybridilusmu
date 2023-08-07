import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { User, UserRepository } from "./user.entity";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: UserRepository,
    private dataSource: DataSource,
  ) {}

  async findAll() {
    return this.userRepository.find();
  }

  async upsert(users: User[]) {
    return this.dataSource
      .createQueryBuilder()
      .insert()
      .into(User)
      .values(users)
      .orUpdate(["displayName", "realName"], ["slackId"])
      .execute();
  }
}
