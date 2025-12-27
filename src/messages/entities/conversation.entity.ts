import { Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Project } from '../../projects/entities/project.entity';
import { Message } from './message.entity';

@Entity()
export class Conversation {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Project, { nullable: true })
    project: Project;

    @ManyToOne(() => User)
    participant1: User;

    @ManyToOne(() => User)
    participant2: User;

    @OneToMany(() => Message, (message) => message.conversation)
    messages: Message[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
