import { Column, Entity, PrimaryColumn, Repository } from "typeorm";

@Entity()
export class User {
  @PrimaryColumn()
  slackId: string;

  @Column()
  displayName: string;

  @Column()
  realName: string;
}

export type UserRepository = Repository<User>;
