import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { User } from '@user/entities/user.entity';
import { DirectoryStrategy } from '@project/enums';

@Entity('projects')
export class Project {
  @ApiProperty({ example: 'uuid-here', description: 'Project ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'My App', description: 'Project name' })
  @Column('text')
  name: string;

  @ApiProperty({ example: 'E2E tests for my app', description: 'Description' })
  @Column('text', { nullable: true })
  description: string;

  @ApiProperty({
    example: 'https://myapp.com',
    description: 'Base URL of target app',
  })
  @Column('text')
  baseUrl: string;

  @ApiProperty({
    example: '/cypress/pages',
    description: 'Filesystem path for .ts output',
  })
  @Column('text', { nullable: true })
  projectPath: string;

  @ApiProperty({
    enum: DirectoryStrategy,
    example: DirectoryStrategy.FLAT,
    description: 'Output directory strategy',
  })
  @Column({ type: 'enum', enum: DirectoryStrategy, default: DirectoryStrategy.FLAT })
  directoryStrategy: DirectoryStrategy;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  owner: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
