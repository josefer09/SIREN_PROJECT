import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('roles')
export class Role {
  @ApiProperty({ example: 'uuid-here', description: 'Unique identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'admin', description: 'Role name' })
  @Column('text', { unique: true })
  name: string;

  @ApiProperty({ example: 'Administrator role', description: 'Role description' })
  @Column('text', { nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
