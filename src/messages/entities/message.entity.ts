import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Conversation } from './conversation.entity';

@Entity()
export class Message {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Conversation, (conversation) => conversation.messages, { onDelete: 'CASCADE' })
    conversation: Conversation;

    @ManyToOne(() => User)
    sender: User;

    @Column({ type: 'text' })
    content: string;

    @Column({ default: false })
    isBlocked: boolean; // For automated contact details blocking

    @CreateDateColumn()
    createdAt: Date;
}
