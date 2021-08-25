import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('clients')
export class ClientEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  names: string;

  @Column({ nullable: true })
  nid: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  gender: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  processId: string;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
