import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { User } from '@user/entities/user.entity';
import { TokenType } from '@auth/enums';

@Entity('tokens')
export class Token {
  @ApiProperty({ example: 'uuid-here', description: 'Token ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column({ type: 'enum', enum: TokenType })
  tokenType: TokenType;

  @Column('text')
  token: string;

  @Column('timestamp')
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @BeforeInsert()
  setExpiration() {
    const now = new Date();
    this.expiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes
  }

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }
}
