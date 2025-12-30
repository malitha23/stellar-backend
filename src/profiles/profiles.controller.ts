import { Controller, Post, Body, UseGuards, Request, Get, UploadedFile, UseInterceptors, BadRequestException, NotFoundException, UploadedFiles, Patch } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { CreateModelProfileDto } from './dto/create-model-profile.dto';
import { CreateDirectorProfileDto } from './dto/create-director-profile.dto';
import { AuthGuard } from '@nestjs/passport';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { directorVerificationStorage, modelProfileStorage } from '../multer.config';
import { UserRole } from 'src/users/entities/user.entity';

@Controller('profiles')
export class ProfilesController {
    constructor(private readonly profilesService: ProfilesService) { }

    // profiles.controller.ts
    @Get('model')
    @UseGuards(AuthGuard('jwt'))
    async getModelProfile(@Request() req) {

        // Get user with model profile and relations
        const user = await this.profilesService.getUser(req.user.userId);

        if (!user || !user.modelProfile) {
            throw new NotFoundException('Model profile not found');
        }

        // Return the profile with all relations
        return {
            success: true,
            profile: user.modelProfile,
            skills: user.modelProfile.skills || [],
            languages: user.modelProfile.languages || [],
        };
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('model')
    @UseInterceptors(FileInterceptor('profileImage', modelProfileStorage))
    async createModelProfile(
        @Request() req,
        @UploadedFile() profileImage: Express.Multer.File,
        @Body() createModelProfileDto: CreateModelProfileDto,
    ) {

        const user = await this.profilesService.getUser(req.user.userId);
        if (!user) throw new BadRequestException('User not found');

        return this.profilesService.createOrUpdateModelProfile(user, createModelProfileDto, profileImage);
    }


    @UseGuards(AuthGuard('jwt'))
    @Get('director')
    async getDirectorProfile(@Request() req) {
        const profile = await this.profilesService.getDirectorProfile(req.user.userId);
        if (!profile) throw new NotFoundException('Director profile not found');
        return { success: true, profile };
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('director')
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'companyLogo', maxCount: 1 },
        { name: 'verificationDocument', maxCount: 1 },
    ], directorVerificationStorage)) // Use this storage
    async createDirectorProfile(
        @Request() req,
        @UploadedFiles() files: {
            companyLogo?: Express.Multer.File[],
            verificationDocument?: Express.Multer.File[]
        },
        @Body() createDirectorProfileDto: CreateDirectorProfileDto
    ) {


        const user = await this.profilesService.getUser(req.user.userId);
        if (!user) throw new BadRequestException('User not found');

        return this.profilesService.createDirectorProfile(
            user,
            createDirectorProfileDto,
            files.companyLogo?.[0],
            files.verificationDocument?.[0]
        );
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch('director')
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'companyLogo', maxCount: 1 },
        { name: 'verificationDocument', maxCount: 1 },
    ], directorVerificationStorage))
    async updateDirectorProfile(
        @Request() req,
        @UploadedFiles() files: {
            companyLogo?: Express.Multer.File[],
            verificationDocument?: Express.Multer.File[]
        },
        @Body() updateDto: Partial<CreateDirectorProfileDto> & {
            deleteCompanyLogo?: boolean;
            deleteVerificationDocument?: boolean;
        },
    ) {
        const user = await this.profilesService.getUser(req.user.userId);
        if (!user) throw new BadRequestException('User not found');

        // Attach new uploaded files
        if (files.companyLogo?.[0]) {
            updateDto.companyLogoUrl = files.companyLogo[0].filename;
            updateDto.deleteCompanyLogo = false; // ignore delete if new file uploaded
        }
        if (files.verificationDocument?.[0]) {
            updateDto.verificationDocumentsUrl = files.verificationDocument[0].filename;
            updateDto.deleteVerificationDocument = false; // ignore delete if new file uploaded
        }

        return this.profilesService.updateDirectorProfile(user, updateDto);
    }


    @UseGuards(AuthGuard('jwt'))
    @Get('me')
    async getMyProfile(@Request() req) {
        const userId = req.user.userId; // from JwtStrategy payload
        return this.profilesService.getProfile(userId);
    }


    // profiles.controller.ts
    @Get('status')
    @UseGuards(AuthGuard('jwt'))
    async getProfileStatus(@Request() req) {

        const userId = Number(req.user?.userId || req.user?.id);

        if (!userId || isNaN(userId)) {
            return {
                success: false,
                isLoggedIn: false,
                message: 'Invalid user token',
            };
        }

        const user = await this.profilesService.getUser(userId);

        if (!user) {
            return {
                success: false,
                isLoggedIn: false,
                message: 'User not found',
            };
        }

        let profileStatus: any = {
            success: true,
            isLoggedIn: true,
            userType: user.role,
            role: user.role,
            email: user.email,
            name: user.name,
            userId: user.id,
            profileExists: false,
            isProfileComplete: false,
            isIdentityVerified: false,
        };

        /* ================= MODEL ================= */
        if (user.role === UserRole.MODEL) {
            if (user.modelProfile) {
                const p = user.modelProfile;
                profileStatus = {
                    ...profileStatus,
                    profileExists: true,
                    isProfileComplete: p.profileCompletionPercentage >= 80,
                    isIdentityVerified: p.nicVerified,
                    profileCompletionPercentage: p.profileCompletionPercentage,
                    nicVerified: p.nicVerified,
                    profileId: p.id,
                    hasProfilePhoto: !!p.profilePhotoUrl,
                    heartCoins: p.heartCoins,
                    totalProjects: p.totalProjectsCompleted,
                    averageRating: p.averageRating,
                    fullName: p.fullName,
                    location: p.location,
                };
            }
        }

        /* ================= DIRECTOR ================= */
        else if (user.role === UserRole.DIRECTOR) {
            if (user.directorProfile) {
                const d = user.directorProfile;
                profileStatus = {
                    ...profileStatus,
                    profileExists: true,
                    isProfileComplete: true,
                    isIdentityVerified: true,
                    profileId: d.id,
                    verificationStatus: d.verificationStatus, // pending / approved / rejected
                    companyName: d.companyName,
                };
            }
        }

        /* ================= ADMIN ================= */
        else if (user.role === UserRole.ADMIN) {
            profileStatus = {
                ...profileStatus,
                profileExists: true,
                isProfileComplete: true,
                isIdentityVerified: true,
            };
        }

        /* ================= PUBLIC ================= */
        else {
            profileStatus = {
                ...profileStatus,
                profileExists: false,
            };
        }

        return profileStatus;
    }

}
