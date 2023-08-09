import { Column, Entity, PrimaryColumn, Repository } from "typeorm";

export enum PresenceType {
  AT_OFFICE = "at_office",
  REMOTE = "remote",
}

@Entity()
export class Presence {
  @PrimaryColumn()
  userId: string;

  @PrimaryColumn({ type: "date" })
  date: Date;

  @Column({ type: "enum", enum: PresenceType })
  type: PresenceType;
}

export type PresenceRepository = Repository<Presence>;
