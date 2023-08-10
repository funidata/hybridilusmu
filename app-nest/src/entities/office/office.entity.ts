import { Column, Entity, PrimaryGeneratedColumn, Repository } from "typeorm";

@Entity()
export class Office {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}

export type OfficeRepository = Repository<Office>;
