import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum DocumentType {
    NIC = 'nic',
    DRIVING_LICENSE = 'driving_license',
    PASSPORT = 'passport',
}

export enum VerificationStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
}

@Entity('identity_verifications')
export class IdentityVerification {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: number;

    @ManyToOne(() => User, { nullable: false })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({
        type: 'enum',
        enum: DocumentType,
        default: DocumentType.NIC,
    })
    documentType: DocumentType;

    @Column()
    frontImageUrl: string;

    @Column({ nullable: true })
    backImageUrl: string;

    @Column({ nullable: true })
    parentalConsentImageUrl: string;

    @Column({
        type: 'enum',
        enum: VerificationStatus,
        default: VerificationStatus.PENDING,
    })
    status: VerificationStatus;

    @Column({ nullable: true })
    verifiedBy: number;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'verifiedBy' })
    verifier: User;

    @Column({ type: 'datetime', nullable: true })
    verifiedAt: Date;

    @Column({ type: 'text', nullable: true })
    rejectionReason: string;

    @Column({ default: false })
    isUnder18: boolean;

    @CreateDateColumn()
    submittedAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
