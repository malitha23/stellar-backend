import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Project } from '../../projects/entities/project.entity';

export enum PaymentStatus {
    PENDING = 'pending',
    ESCROWED = 'escrowed',
    COMPLETED = 'completed',
    FAILED = 'failed',
    REFUNDED = 'refunded',
}

@Entity()
export class Payment {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User)
    payer: User;

    @ManyToOne(() => User)
    payee: User;

    @ManyToOne(() => Project, { nullable: true })
    project: Project;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    totalAmount: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    modelFee: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    platformFee: number;

    @Column({ default: 'LKR' })
    currency: string;

    @Column({
        type: 'enum',
        enum: PaymentStatus,
        default: PaymentStatus.PENDING,
    })
    status: PaymentStatus;

    @Column({ nullable: true })
    transactionId: string;

    @Column({ nullable: true })
    paymentMethod: string; // e.g., "card", "friMi"

    @CreateDateColumn()
    createdAt: Date;
}
