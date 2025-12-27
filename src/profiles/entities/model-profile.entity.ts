import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn, ManyToOne, BeforeInsert, BeforeUpdate } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ModelSkill } from './model-skill.entity';
import { ModelLanguage } from './model-language.entity';
import { ModelPortfolio } from './model-portfolio.entity';

export enum Gender {
    MALE = 'male',
    FEMALE = 'female',
    OTHER = 'other',
}

@Entity()
export class ModelProfile {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn()
    user: User;

    @Column()
    fullName: string;

    @Column()
    age: number;

    @Column({
        type: 'enum',
        enum: Gender,
    })
    gender: Gender;

    @Column({ type: 'float', nullable: true })
    height: number; // in cm or as preferred

    @Column({ type: 'float', nullable: true })
    weight: number; // in kg

    @Column({ type: 'text', nullable: true })
    measurements: string; // Chest-Waist-Hips or similar

    @Column()
    location: string;

    @Column({ type: 'text', nullable: true })
    bioSinhala: string;

    @Column({ type: 'text', nullable: true })
    bioTamil: string;

    @Column({ type: 'text', nullable: true })
    bioEnglish: string;

    @Column({ nullable: true })
    profilePhotoUrl: string;

    @Column({ default: 0 })
    heartCoins: number;

    @Column({ nullable: true })
    leaderboardRank: number;

    @Column({ default: 0 })
    totalProjectsCompleted: number;

    @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
    averageRating: number;

    @Column({ type: 'float', default: 0 })
    profileCompletionPercentage: number;

    @Column({ default: false })
    nicVerified: boolean;

    @Column({ default: false })
    parentalConsent: boolean;

    @OneToMany(() => ModelSkill, (skill) => skill.modelProfile, { cascade: true })
    skills: ModelSkill[];

    @OneToMany(() => ModelLanguage, (language) => language.modelProfile, { cascade: true })
    languages: ModelLanguage[];

    @OneToMany(() => ModelPortfolio, (portfolio) => portfolio.modelProfile, { cascade: true })
    portfolio: ModelPortfolio[];

    @Column({ type: 'simple-array', nullable: true })
    projectPreferences: string[]; // Store selected project types

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    minBudget: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    maxBudget: number;

    @Column({ type: 'simple-json', nullable: true })
    availability: {
        days: string[],
        startTime?: string,
        endTime?: string
    };

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    /** AUTO CALCULATION OF PROFILE COMPLETION */
    @BeforeInsert()
    @BeforeUpdate()
    calculateCompletion() {
        let completedFields = 0;

        // Scalar fields
        if (this.fullName) completedFields++;
        if (this.age) completedFields++;
        if (this.gender) completedFields++;
        if (this.location) completedFields++;
        if (this.bioEnglish || this.bioSinhala || this.bioTamil) completedFields++;
        if (this.profilePhotoUrl) completedFields++;

        // Relational fields - count automatically if property exists
        if (this.skills) completedFields++;
        if (this.languages) completedFields++;

        // Total fields = scalar + relational
        const totalFields = 8;

        this.profileCompletionPercentage = parseFloat(
            ((completedFields / totalFields) * 100).toFixed(2)
        );
    }

}
