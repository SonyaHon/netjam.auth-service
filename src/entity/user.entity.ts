import { Entity, Column, PrimaryColumn } from "typeorm";
import { EPermissions } from "../reference/permissions";
import { UserData } from "../reference/user-data";
import { v1 as uuid } from "uuid";

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
}
