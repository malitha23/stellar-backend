import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ProjectImage } from './project-image.entity';
import { ProjectRole } from './project-role.entity';

export enum ProjectType {
    TVC = 'tvc',
    MOVIE = 'movie',
    MUSIC_VIDEO = 'music_video',
    PHOTOSHOOT = 'photoshoot',
    EVENT = 'event',
    OTHER = 'other',
}

export enum ProjectStatus {
    OPEN = 'open',
    CASTING = 'casting',
    CLOSED = 'closed',
    COMPLETED = 'completed',
}

@Entity()
export class Project {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    director: User;

    @Column()
    title: string;

    @Column({ type: 'text' })
    description: string;

    @Column({
        type: 'enum',
        enum: ProjectType,
    })
    projectType: ProjectType;

    @Column()
    location: string;

    @Column({ nullable: true })
    productionCompany: string;

    @Column({ nullable: true })
    budgetRange: string; // e.g. "50k-100k", "Paid", "TBD"

    @Column({ type: 'date' })
    deadline: Date;

    @Column({ type: 'date', nullable: true })
    shootDateStart: Date;

    @Column({
        type: 'enum',
        enum: ProjectStatus,
        default: ProjectStatus.OPEN,
    })
    status: ProjectStatus;

    @OneToMany(() => ProjectRole, (role) => role.project, { cascade: true })
    roles: ProjectRole[];

    @OneToMany(() => ProjectImage, (image) => image.project, { cascade: true })
    images: ProjectImage[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
