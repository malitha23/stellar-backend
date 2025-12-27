import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Project } from '../../projects/entities/project.entity';

@Entity()
export class Review {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.reviewsGiven)
    reviewer: User;

    @ManyToOne(() => User, (user) => user.reviewsReceived)
    reviewee: User;

    @ManyToOne(() => Project, { nullable: true })
    project: Project;

    @Column({ type: 'int' })
    rating: number; // 1-5

    @Column({ type: 'text', nullable: true })
    comment: string;

    @CreateDateColumn()
    createdAt: Date;
}
