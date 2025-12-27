import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Availability {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    user: User;

    @Column({ type: 'date' })
    date: Date;

    @Column({ default: true })
    isAvailable: boolean;

    @Column({ nullable: true })
    note: string; // e.g. "Traveling", "Fully booked"

    @CreateDateColumn()
    createdAt: Date;
}
