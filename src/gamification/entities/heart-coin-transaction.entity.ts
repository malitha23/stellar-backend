import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum TransactionType {
    EARNED = 'earned', // From projects, engagement
    SPENT = 'spent', // For featuring profile, etc.
    PURCHASED = 'purchased',
}

@Entity()
export class HeartCoinTransaction {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    user: User;

    @Column()
    amount: number;

    @Column({
        type: 'enum',
        enum: TransactionType,
    })
    type: TransactionType;

    @Column()
    reason: string; // e.g. "Project completion", "Daily login"

    @CreateDateColumn()
    createdAt: Date;
}
