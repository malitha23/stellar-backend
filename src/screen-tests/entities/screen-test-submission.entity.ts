import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { ScreenTest } from './screen-test.entity';

@Entity()
export class ScreenTestSubmission {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => ScreenTest, (screenTest) => screenTest.submission, { onDelete: 'CASCADE' })
    @JoinColumn()
    screenTest: ScreenTest;

    @Column()
    videoUrl: string;

    @Column({ type: 'text', nullable: true })
    modelNotes: string;

    @Column({ type: 'text', nullable: true })
    directorFeedback: string;

    @Column({ nullable: true })
    rating: number; // e.g., 1-5

    @CreateDateColumn()
    submittedAt: Date;
}
