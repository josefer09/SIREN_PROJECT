import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { Page } from '@page/entities/page.entity';
import { ElementType, SelectorStrategy, SelectorStatus } from '@selector/enums';

@Entity('selectors')
export class Selector {
  @ApiProperty({ example: 'uuid-here', description: 'Selector ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'usernameInput', description: 'Selector name' })
  @Column('text')
  name: string;

  @ApiProperty({ enum: ElementType, example: ElementType.INPUT })
  @Column({ type: 'enum', enum: ElementType })
  elementType: ElementType;

  @ApiProperty({ enum: SelectorStrategy, example: SelectorStrategy.ID, nullable: true })
  @Column({ type: 'enum', enum: SelectorStrategy, nullable: true })
  selectorStrategy: SelectorStrategy;

  @ApiProperty({ example: '#username', description: 'Selector value', nullable: true })
  @Column('text', { nullable: true })
  selectorValue: string;

  @ApiProperty({ enum: SelectorStatus, example: SelectorStatus.PENDING })
  @Column({ type: 'enum', enum: SelectorStatus, default: SelectorStatus.PENDING })
  status: SelectorStatus;

  @ApiProperty({ example: 'Username text field', description: 'Description' })
  @Column('text', { nullable: true })
  description: string;

  @ManyToOne(() => Page, { onDelete: 'CASCADE' })
  page: Page;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
