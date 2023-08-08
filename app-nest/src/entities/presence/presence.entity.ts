import { Column, Entity, PrimaryGeneratedColumn, Repository } from "typeorm";

@Entity()
export class Presence {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: string;

  @Column({ type: "timestamptz" })
  date: Date;
}

export type PresenceRepository = Repository<Presence>;
