import {
    Controller, Post, Get, Put, Delete, UseGuards, UseInterceptors, UploadedFiles,
    Body, Request, Param, HttpException, HttpStatus, Query
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { VerificationService } from './verification.service';
import { verificationStorage } from 'src/multer.config';
import { VerificationStatus, DocumentType } from 'src/profiles/entities/identity-verification.entity';
import { SubmitVerificationDto } from 'src/profiles/dto/submit-verification.dto';

@Controller('identity-verification')
export class VerificationController {
    constructor(private verificationService: VerificationService) { }

    @Post('submit')
    @UseGuards(AuthGuard('jwt'))
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'frontImage', maxCount: 1 },
        { name: 'backImage', maxCount: 1 },
        { name: 'parentalConsent', maxCount: 1 },
    ], verificationStorage))
    async submitVerification(
        @Request() req,
        @UploadedFiles() files: {
            frontImage?: Express.Multer.File[],
            backImage?: Express.Multer.File[],
            parentalConsent?: Express.Multer.File[],
        },
        @Body() body: SubmitVerificationDto,
    ) {
        try {
            const userId = req.user.userId;
            if (!userId) throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);

            const { documentType, isUnder18 } = body;
            const isUnder18Bool = isUnder18 === 'true';

            if (!files.frontImage || files.frontImage.length === 0)
                throw new HttpException('Front image is required', HttpStatus.BAD_REQUEST);

            if (documentType === DocumentType.NIC && (!files.backImage || files.backImage.length === 0))
                throw new HttpException('Back image is required for NIC', HttpStatus.BAD_REQUEST);

            if (isUnder18Bool && (!files.parentalConsent || files.parentalConsent.length === 0))
                throw new HttpException('Parental consent is required for users under 18', HttpStatus.BAD_REQUEST);

            const verification = await this.verificationService.submitVerification(
                userId,
                documentType,
                isUnder18Bool,
                files.frontImage[0].path,
                files.backImage?.[0]?.path,
                files.parentalConsent?.[0]?.path,
            );

            return { success: true, message: 'Verification submitted successfully', data: verification };
        } catch (error) {
            throw new HttpException(error.message || 'Failed to submit verification', HttpStatus.BAD_REQUEST);
        }
    }

    @Put('update')
    @UseGuards(AuthGuard('jwt'))
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'frontImage', maxCount: 1 },
        { name: 'backImage', maxCount: 1 },
        { name: 'parentalConsent', maxCount: 1 },
    ], verificationStorage))
    async updateVerification(
        @Request() req,
        @UploadedFiles() files: {
            frontImage?: Express.Multer.File[],
            backImage?: Express.Multer.File[],
            parentalConsent?: Express.Multer.File[],
        },
        @Body() body: SubmitVerificationDto,
    ) {
        try {
            const userId = req.user.userId;
            if (!userId) throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);

            const { documentType, isUnder18 } = body;
            const isUnder18Bool = isUnder18 === 'true';

            const existingVerification = await this.verificationService.getUserVerification(userId);

            if (!existingVerification) {
                throw new HttpException('No existing verification found to update', HttpStatus.BAD_REQUEST);
            }

            const verification = await this.verificationService.updateVerification(
                userId,
                documentType,
                isUnder18Bool,
                files.frontImage?.[0]?.path || existingVerification.frontImageUrl,
                files.backImage?.[0]?.path || existingVerification.backImageUrl,
                files.parentalConsent?.[0]?.path || existingVerification.parentalConsentImageUrl,
            );

            return { success: true, message: 'Verification updated successfully', data: verification };
        } catch (error) {
            throw new HttpException(error.message || 'Failed to update verification', HttpStatus.BAD_REQUEST);
        }
    }

    @Get('status')
    @UseGuards(AuthGuard('jwt'))
    async getVerificationStatus(@Request() req) {
        const userId = req.user.id;
        const verification = await this.verificationService.getUserVerification(userId);
        return { success: true, data: verification };
    }

    // Other routes (approve, reject, pending, stats, delete, search, etc.)
    // remain mostly unchanged
}
