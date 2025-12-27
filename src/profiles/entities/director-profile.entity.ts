import {
    Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn,
    CreateDateColumn, UpdateDateColumn, BeforeInsert, BeforeUpdate
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum VerificationStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
}

@Entity()
export class DirectorProfile {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => User, { cascade: true, onDelete: 'CASCADE' })
    @JoinColumn()
    user: User;

    @Column()
    companyName: string;

    @Column({ nullable: true })
    companyType: string;

    @Column({ nullable: true })
    companyRegistrationNumber: string;

    @Column({ nullable: true })
    companyLogoUrl: string;

    @Column({ type: 'text', nullable: true })
    bio: string;

    @Column({ nullable: true })
    officeLocation: string;

    @Column()
    contactPersonName: string;

    @Column({ nullable: true })
    contactEmail: string;

    @Column({ nullable: true })
    contactPhone: string;

    @Column({ type: 'text', nullable: true })
    pastProjects: string;

    @Column({ nullable: true })
    companyWebsite: string;

    @Column({
        type: 'enum',
        enum: VerificationStatus,
        default: VerificationStatus.PENDING,
    })
    verificationStatus: VerificationStatus;

    @Column({ nullable: true })
    verificationDocumentsUrl: string;

    @Column({ nullable: true })
    verifiedAt: Date;

    @Column({ default: 0 })
    totalProjectsPosted: number;

    @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
    averageRating: number;

    @Column({ type: 'float', default: 0 })
    profileCompletionPercentage: number;

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
        if (this.companyName) completedFields++;
        if (this.companyType) completedFields++;
        if (this.bio) completedFields++;
        if (this.contactPersonName) completedFields++;
        if (this.contactEmail) completedFields++;
        if (this.contactPhone) completedFields++;
        if (this.companyLogoUrl) completedFields++;

        // Total fields considered
        const totalFields = 7;

        this.profileCompletionPercentage = parseFloat(
            ((completedFields / totalFields) * 100).toFixed(2)
        );
    }
}
