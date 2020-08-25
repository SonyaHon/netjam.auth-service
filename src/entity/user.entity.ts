import { Entity, Column, PrimaryColumn } from "typeorm";
import { EPermissions } from "../reference/permissions";
import { UserData } from "../reference/user-data";
import { v4 as uuid } from "uuid";
import { genSalt, hash } from "bcrypt";
import { SALT_ROUNDS } from "../reference/crypto";

export interface ICreateUser {
  username: string;
  password: string;
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
    type: "jsonb",
    nullable: true,
  })
  permissions: EPermissions[];

  @Column({
    type: "jsonb",
    nullable: true,
  })
  data: UserData;

  static async Create(data: ICreateUser): Promise<User> {
    const user = new User();

    user.id = uuid();
    user.username = data.username;
    user.permissions = data.permissions || [EPermissions.GUEST];
    user.data = data.data || {};

    const passwordHash = await hash(data.password, SALT_ROUNDS);
    user.password = passwordHash;

    return user;
  }
}
