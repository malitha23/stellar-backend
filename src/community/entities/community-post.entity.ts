import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class CommunityPost {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    author: User;

    @Column({ type: 'text' })
    content: string;

    @Column({ nullable: true })
    imageUrl: string;

    @Column({ default: 0 })
    likesCount: number;

    @CreateDateColumn()
    createdAt: Date;
}
