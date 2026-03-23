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

import { Project } from '@project/entities/project.entity';

@Entity('pages')
export class Page {
  @ApiProperty({ example: 'uuid-here', description: 'Page ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'LoginPage', description: 'Page name' })
  @Column('text')
  name: string;

  @ApiProperty({ example: '/login', description: 'URL path' })
  @Column('text')
  path: string;

  @ApiProperty({ example: 'Login page of the app', description: 'Description' })
  @Column('text', { nullable: true })
  description: string;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  project: Project;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
