import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import { IEvent } from "../reference/event";

export enum ELogLevel {
  INFO = "info",
  WARNING = "warning",
  ERROR = "error",
}

export interface ICreateLog {
  level: ELogLevel;
  event: IEvent;
}

@Entity()
export class Log {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: "timestamp",
  })
  timestamp: number;

  @Column({
    type: "varchar",
    length: 10,
  })
  level: string;

  @Column({
    type: "jsonb",
  })
  event: IEvent;

  static CreateEvent(data: ICreateLog) {
    const event = new Log();
    event.timestamp = Date.now();
    event.level = data.level;
    event.event = data.event;
    return event;
  }
}
