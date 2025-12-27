import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Project } from './project.entity';

@Entity()
export class ProjectImage {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    imageUrl: string;

    // e.g., 'poster', 'moodboard', 'reference'
    @Column({ default: 'poster' })
    imageType: string;

    @ManyToOne(() => Project, (project) => project.images, { onDelete: 'CASCADE' })
    project: Project;
}
