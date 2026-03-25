import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { Role } from '@role/entities/role.entity';

@Entity('users')
export class User {
  @ApiProperty({ example: 'uuid-here', description: 'Unique identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'user@email.com', description: 'User email' })
  @Column('text', { unique: true })
  email: string;

  @Column('text', { select: false })
  password: string;

  @ApiProperty({ example: 'John Doe', description: 'Full name' })
  @Column('text')
  fullName: string;

  @ApiProperty({ example: true, description: 'Whether the user is active' })
  @Column('boolean', { default: true })
  isActive: boolean;

  @ApiProperty({ example: false, description: 'Whether email is verified' })
  @Column('boolean', { default: false })
  isVerified: boolean;

  @ApiProperty({ example: 'https://example.com/avatar.jpg', description: 'Profile picture URL', required: false })
  @Column('text', { nullable: true, default: null })
  avatar: string;

  @ApiProperty({ example: 'QA Engineer with 5 years of experience', description: 'Short user bio', required: false })
  @Column('text', { nullable: true, default: null })
  bio: string;

  @ApiProperty({ example: '+1 555 123 4567', description: 'Phone number', required: false })
  @Column('varchar', { length: 20, nullable: true, default: null })
  phone: string;

  @ApiProperty({ type: () => [Role], description: 'User roles' })
  @ManyToMany(() => Role, { eager: true })
  @JoinTable({ name: 'users_roles' })
  roles: Role[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  normalizeEmailInsert() {
    this.email = this.email.toLowerCase().trim();
  }

  @BeforeUpdate()
  normalizeEmailUpdate() {
    if (this.email) {
      this.email = this.email.toLowerCase().trim();
    }
  }
}
