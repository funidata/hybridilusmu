import { Column, Entity, PrimaryGeneratedColumn, Repository } from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  slackId: string;
}

export type UserRepository = Repository<User>;
