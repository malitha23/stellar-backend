import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum NotificationType {
    SYSTEM = 'system',
    SCREEN_TEST_REQUEST = 'screen_test_request',
    PROJECT_INVITATION = 'project_invitation',
    REVIEW_RECEIVED = 'review_received',
    COINS_EARNED = 'coins_earned',
    PAYMENT_RECEIVED = 'payment_received',
    ESCROW_RELEASED = 'escrow_released',
}

@Entity()
export class Notification {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    user: User;

    @Column()
    title: string;

    @Column()
    message: string;

    @Column({
        type: 'enum',
        enum: NotificationType,
    })
    type: NotificationType;

    @Column({ default: false })
    isRead: boolean;

    @Column({ nullable: true })
    relatedId: string; // ID of project, screen test, etc.

    @CreateDateColumn()
    createdAt: Date;
}
