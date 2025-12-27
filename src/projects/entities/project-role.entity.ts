import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Project } from './project.entity';
import { Gender } from '../../profiles/entities/model-profile.entity';

@Entity()
export class ProjectRole {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    roleName: string; // e.g. "Main Actor", "Extra"

    @Column({ type: 'text', nullable: true })
    roleDescription: string;

    @Column({
        type: 'enum',
        enum: Gender,
        nullable: true,
    })
    requiredGender: Gender;

    @Column({ nullable: true })
    ageRangeStart: number;

    @Column({ nullable: true })
    ageRangeEnd: number;

    @Column({ default: 1 })
    numberOfOpenings: number;

    @ManyToOne(() => Project, (project) => project.roles, { onDelete: 'CASCADE' })
    project: Project;
}
