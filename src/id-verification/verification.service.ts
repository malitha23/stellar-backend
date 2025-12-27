import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IdentityVerification, VerificationStatus, DocumentType } from 'src/profiles/entities/identity-verification.entity';
import { User } from 'src/users/entities/user.entity';
import * as fs from 'fs/promises';
import * as fsSync from 'fs'; // Import sync fs for existsSync
import * as path from 'path';

@Injectable()
export class VerificationService {
    constructor(
        @InjectRepository(IdentityVerification)
        private verificationRepository: Repository<IdentityVerification>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    async submitVerification(
        userId: number,
        documentType: DocumentType,
        isUnder18: boolean,
        frontImage: string,
        backImage?: string,
        parentalConsent?: string,
    ) {
        const userIdNum = Number(userId);
        if (isNaN(userIdNum)) throw new Error('Invalid user ID');

        const existing = await this.verificationRepository.findOne({
            where: [
                { userId: userIdNum, status: VerificationStatus.PENDING },
                { userId: userIdNum, status: VerificationStatus.APPROVED },
            ],
        });

        if (existing) {
            if (existing.status === VerificationStatus.PENDING) {
                throw new Error('You already have a pending verification request');
            }
            if (existing.status === VerificationStatus.APPROVED) {
                throw new Error('Your identity is already verified');
            }
        }

        const verification = this.verificationRepository.create({
            userId: userIdNum,
            documentType,
            frontImageUrl: frontImage,
            backImageUrl: backImage,
            parentalConsentImageUrl: parentalConsent,
            isUnder18,
            status: VerificationStatus.PENDING,
        });

        return await this.verificationRepository.save(verification);
    }

    async updateVerification(
        userId: number,
        documentType: DocumentType,
        isUnder18: boolean,
        frontImage?: string,
        backImage?: string,
        parentalConsent?: string,
    ) {
        const userIdNum = Number(userId);
        if (isNaN(userIdNum)) throw new Error('Invalid user ID');

        const existing = await this.verificationRepository.findOne({
            where: { userId: userIdNum }
        });

        if (!existing) {
            throw new Error('No verification found to update');
        }

        // Store old file paths for deletion
        const oldFiles = {
            frontImage: existing.frontImageUrl,
            backImage: existing.backImageUrl,
            parentalConsent: existing.parentalConsentImageUrl,
        };

        // Update fields only if new values are provided
        if (documentType) existing.documentType = documentType;
        if (frontImage) existing.frontImageUrl = frontImage;
        if (backImage !== undefined) existing.backImageUrl = backImage;
        if (parentalConsent !== undefined) existing.parentalConsentImageUrl = parentalConsent;
        if (isUnder18 !== undefined) existing.isUnder18 = isUnder18;

        existing.status = VerificationStatus.PENDING;
        existing.rejectionReason = null;
        existing.updatedAt = new Date();

        const updated = await this.verificationRepository.save(existing);

        // Delete old files after successful update
        await this.deleteOldFiles(oldFiles, {
            frontImage,
            backImage,
            parentalConsent
        });

        return updated;
    }

    private async deleteOldFiles(
        oldFiles: { frontImage?: string; backImage?: string; parentalConsent?: string },
        newFiles: { frontImage?: string; backImage?: string; parentalConsent?: string }
    ) {
        try {
            // Delete old front image if a new one was uploaded
            if (oldFiles.frontImage && newFiles.frontImage && oldFiles.frontImage !== newFiles.frontImage) {
                await this.safeDeleteFile(oldFiles.frontImage);
            }

            // Delete old back image if a new one was uploaded or if it's being removed
            if (oldFiles.backImage) {
                if (newFiles.backImage === null) {
                    // Back image is being removed (switching to driving license)
                    await this.safeDeleteFile(oldFiles.backImage);
                } else if (newFiles.backImage && oldFiles.backImage !== newFiles.backImage) {
                    // New back image uploaded
                    await this.safeDeleteFile(oldFiles.backImage);
                }
            }

            // Delete old parental consent if a new one was uploaded or if user is no longer under 18
            if (oldFiles.parentalConsent) {
                if (newFiles.parentalConsent === null) {
                    // Parental consent is being removed (user is now over 18)
                    await this.safeDeleteFile(oldFiles.parentalConsent);
                } else if (newFiles.parentalConsent && oldFiles.parentalConsent !== newFiles.parentalConsent) {
                    // New parental consent uploaded
                    await this.safeDeleteFile(oldFiles.parentalConsent);
                }
            }
        } catch (error) {
            console.error('Error deleting old files:', error);
            // Don't throw error - file deletion failure shouldn't break the update
        }
    }

    private async safeDeleteFile(filePath: string) {
        try {
            if (filePath && fsSync.existsSync(filePath)) {
                await fs.unlink(filePath);
            }
        } catch (error) {
            console.error(`Failed to delete file ${filePath}:`, error);
        }
    }



    async getUserVerification(userId: number) {
        const verification = await this.verificationRepository.findOne({
            where: { userId },
            relations: ['user'],
            order: { submittedAt: 'DESC' },
        });

        if (!verification) {
            throw new NotFoundException('No verification found for this user');
        }

        return verification;
    }

    async approveVerification(id: number, adminId: number) {
        const verification = await this.verificationRepository.findOne({ where: { id }, relations: ['user'] });
        if (!verification) throw new NotFoundException('Verification not found');
        if (verification.status !== VerificationStatus.PENDING) {
            throw new Error(`Verification is already ${verification.status}`);
        }

        verification.status = VerificationStatus.APPROVED;
        verification.verifiedBy = adminId;
        verification.verifiedAt = new Date();

        if (verification.user) {
            verification.user.modelProfile.nicVerified = true;
            await this.userRepository.save(verification.user);
        }

        return await this.verificationRepository.save(verification);
    }

    async rejectVerification(id: number, adminId: number, reason: string) {
        const verification = await this.verificationRepository.findOne({ where: { id }, relations: ['user'] });
        if (!verification) throw new NotFoundException('Verification not found');
        if (verification.status !== VerificationStatus.PENDING) {
            throw new Error(`Verification is already ${verification.status}`);
        }

        verification.status = VerificationStatus.REJECTED;
        verification.verifiedBy = adminId;
        verification.verifiedAt = new Date();
        verification.rejectionReason = reason;

        if (verification.user && verification.user.modelProfile.nicVerified) {
            verification.user.modelProfile.nicVerified = false;
            await this.userRepository.save(verification.user);
        }

        return await this.verificationRepository.save(verification);
    }

    async getVerificationById(id: number) {
        const verification = await this.verificationRepository.findOne({ where: { id }, relations: ['user', 'verifier'] });
        if (!verification) throw new NotFoundException('Verification not found');
        return verification;
    }

    async getPendingVerifications() {
        return await this.verificationRepository.find({
            where: { status: VerificationStatus.PENDING },
            relations: ['user'],
            order: { submittedAt: 'DESC' },
        });
    }

    async getVerificationStats() {
        const total = await this.verificationRepository.count();
        const pending = await this.verificationRepository.count({ where: { status: VerificationStatus.PENDING } });
        const approved = await this.verificationRepository.count({ where: { status: VerificationStatus.APPROVED } });
        const rejected = await this.verificationRepository.count({ where: { status: VerificationStatus.REJECTED } });

        return { total, pending, approved, rejected };
    }

    async deleteVerification(id: number, userId: number) {
        const verification = await this.verificationRepository.findOne({ where: { id, userId } });
        if (!verification) throw new NotFoundException('Verification not found');
        if (verification.status === VerificationStatus.APPROVED) throw new Error('Cannot delete approved verification');

        await this.verificationRepository.remove(verification);
        return { success: true, message: 'Verification deleted successfully' };
    }
}
