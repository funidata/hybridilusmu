import { Column, Entity, ManyToOne, PrimaryColumn, Repository } from "typeorm";
import { Office } from "../office/office.entity";

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

  @ManyToOne(() => Office, { nullable: true })
  office: Office;
}

export type PresenceRepository = Repository<Presence>;
