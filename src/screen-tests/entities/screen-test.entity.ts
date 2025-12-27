import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Project } from '../../projects/entities/project.entity';
import { ProjectRole } from '../../projects/entities/project-role.entity';
import { ScreenTestSubmission } from './screen-test-submission.entity';

export enum ScreenTestStatus {
    PENDING = 'pending',
    SUBMITTED = 'submitted',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    RETEST_REQUESTED = 'retest_requested',
}

@Entity()
export class ScreenTest {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Project, { onDelete: 'CASCADE' })
    project: Project;

    @ManyToOne(() => ProjectRole, { nullable: true, onDelete: 'SET NULL' })
    role: ProjectRole;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    model: User;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    director: User;

    @Column({
        type: 'enum',
        enum: ScreenTestStatus,
        default: ScreenTestStatus.PENDING,
    })
    status: ScreenTestStatus;

    @Column({ type: 'text', nullable: true })
    requestNotes: string;

    @OneToOne(() => ScreenTestSubmission, (submission) => submission.screenTest, { cascade: true })
    submission: ScreenTestSubmission;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
