import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { RequestActionTypeEnum } from '../enums/request-action-type.enum.js';
import { UserRoleEnum } from '../enums/user-role.enum.js';
import { RequestEntity } from './request.entity.js';

@Entity('request_actions')
@Unique(['requestId', 'takenById', 'type'])
export class RequestActionEntity {
  @Column({ nullable: true, type: 'varchar' })
  readonly note!: string | null;

  @PrimaryGeneratedColumn({ name: 'request_action_id' })
  readonly requestActionId!: number;

  @Column({ name: 'request_id' })
  readonly requestId!: number;

  @Column({ type: 'varchar' })
  readonly role!: UserRoleEnum;

  @CreateDateColumn({ name: 'taken_at' })
  readonly takenAt!: Date;

  @Column({ name: 'taken_by_id' })
  readonly takenById!: number;

  @Column()
  readonly type!: RequestActionTypeEnum;

  @ManyToOne(() => RequestEntity)
  @JoinColumn({ name: 'request_id', referencedColumnName: 'requestId' })
  readonly request?: RequestEntity;
}
