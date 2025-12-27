import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { ModelProfile } from './model-profile.entity';

export enum ProficiencyLevel {
    BEGINNER = 'beginner',
    INTERMEDIATE = 'intermediate',
    ADVANCED = 'advanced',
}

@Entity()
export class ModelSkill {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    skillName: string;

    @Column({
        type: 'enum',
        enum: ProficiencyLevel,
        default: ProficiencyLevel.BEGINNER,
    })
    proficiencyLevel: ProficiencyLevel;

    @ManyToOne(() => ModelProfile, (profile) => profile.skills, { onDelete: 'CASCADE' })
    modelProfile: ModelProfile;
}
