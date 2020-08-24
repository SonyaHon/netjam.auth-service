import { Entity, Column, PrimaryColumn } from "typeorm";
import { EPermissions } from "../reference/permissions";
import { UserData } from "../reference/user-data";
import { v4 as uuid } from "uuid";

export interface ICreateUser {
  username: string;
  password: string;
  salt: string;
  permissions?: EPermissions[];
  data?: UserData;
}

@Entity()
export class User {
  @PrimaryColumn("varchar")
  id: string;

  @Column({
    type: "varchar",
    length: "255",
    unique: true,
    nullable: false,
  })
  username: string;

  @Column({
    type: "varchar",
    length: 255,
    nullable: false,
  })
  password: string;

  @Column({
    type: "varchar",
    length: 255,
    nullable: false,
  })
  salt: string;

  @Column({
    type: "jsonb",
    nullable: true,
  })
  permissions: EPermissions[];

  @Column({
    type: "jsonb",
    nullable: true,
  })
  data: UserData;

  static Create(data: ICreateUser): User {
    const user = new User();

    user.id = uuid();
    user.username = data.username;
    user.password = data.password;
    user.salt = data.salt;
    user.permissions = data.permissions || [EPermissions.GUEST];
    user.data = data.data || {};

    return user;
  }
}
