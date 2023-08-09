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

  @Column({ type: "enum", enum: PresenceType, nullable: true })
  type: PresenceType | null;

  @Column({ nullable: true })
  office: string | null;
}

export type PresenceRepository = Repository<Presence>;
