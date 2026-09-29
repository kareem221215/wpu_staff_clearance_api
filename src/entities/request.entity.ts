import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { UserRoleEnum } from '../enums/user-role.enum.js';
import { RequestActionEntity } from './request-action.entity.js';

@Entity({ name: 'requests' })
export class RequestEntity {
  @Column()
  readonly archived!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  readonly createdAt!: Date;

  @Column({ name: 'department_id' })
  readonly departmentId!: number;

  @Column({ name: 'next_action_role', nullable: true, type: 'varchar' })
  readonly nextActionRole!: UserRoleEnum | null;

  @PrimaryGeneratedColumn({ name: 'request_id' })
  readonly requestId!: number;

  @Column({ name: 'employee_id', unique: true })
  readonly employeeId!: number;

  @UpdateDateColumn({ name: 'updated_at' })
  readonly updatedAt!: Date;

  @OneToMany(() => RequestActionEntity, (action) => action.request)
  readonly actions?: RequestActionEntity[];
}
