import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { ModelProfile } from './model-profile.entity';

export enum LanguageProficiency {
    BASIC = 'basic',
    CONVERSATIONAL = 'conversational',
    FLUENT = 'fluent',
    NATIVE = 'native',
}

@Entity()
export class ModelLanguage {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    language: string;

    @Column({
        type: 'enum',
        enum: LanguageProficiency,
        default: LanguageProficiency.BASIC,
    })
    proficiency: LanguageProficiency;

    @ManyToOne(() => ModelProfile, (profile) => profile.languages, { onDelete: 'CASCADE' })
    modelProfile: ModelProfile;
}
