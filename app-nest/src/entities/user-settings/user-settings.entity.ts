import {
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
  Repository,
} from "typeorm";
import { Office } from "../office/office.entity";
import { User } from "../user/user.entity";

@Entity()
export class UserSettings {
  // Use `user` 1:1 relation as primary key. Field name must exactly match the generated column name!
  @PrimaryColumn()
  userSlackId: string;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @ManyToOne(() => Office)
  visibleOffice: Office;
}

export type UserSettingsRepository = Repository<UserSettings>;
