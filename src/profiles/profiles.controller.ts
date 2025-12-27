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
    getMyProfile(@Request() req) {
        // req.user has { userId, email, role } from JwtStrategy, but Service expects User entity or ID.
        // Ideally pass ID and let service find User, or just ID.
        // User entity is needed for relations.
        // For now, partial user is enough for ID.
        return this.profilesService.getProfile({ id: req.user.userId } as any);
    }

    // profiles.controller.ts
    @Get('status')
    @UseGuards(AuthGuard('jwt'))
    async getProfileStatus(@Request() req) {
        const userId = req.user?.id || req.user?.userId;

        const user = await this.profilesService.getUser(req.user.userId);

        if (!user) {
            console.log('User not found in database');
            return {
                success: false,
                isLoggedIn: false,
                message: 'User not found',
            };
        }


        let profileStatus = {
            success: true,
            isLoggedIn: true,
            userType: user.role, // Use 'role' from database
            role: user.role, // Also include role for compatibility
            email: user.email,
            name: user.name,
            userId: user.id,
        };

        // Add model-specific status
        if (user.role === UserRole.MODEL && user.modelProfile) {
            const modelProfile = user.modelProfile;
            profileStatus = {
                ...profileStatus,
                isProfileComplete: modelProfile.profileCompletionPercentage >= 80,
                isIdentityVerified: modelProfile.nicVerified,
                profileExists: true,
                profileCompletionPercentage: modelProfile.profileCompletionPercentage,
                nicVerified: modelProfile.nicVerified,
                profileId: modelProfile.id,
                hasProfilePhoto: !!modelProfile.profilePhotoUrl,
                profileCreatedAt: modelProfile.createdAt,
                heartCoins: modelProfile.heartCoins,
                totalProjects: modelProfile.totalProjectsCompleted,
                averageRating: modelProfile.averageRating,
                // Add other model profile fields as needed
                fullName: modelProfile.fullName,
                location: modelProfile.location,
            } as any;
        }
        // Add director-specific status
        else if (user.role === UserRole.DIRECTOR && user.directorProfile) {
            const directorProfile = user.directorProfile;
            profileStatus = {
                ...profileStatus,
                isProfileComplete: true, // Director profiles might have different criteria
                isIdentityVerified: true, // Adjust as needed
                profileExists: true,
                profileId: directorProfile.id,
                // Add director-specific fields
                companyName: directorProfile.companyName,
                // ... other director profile fields
            } as any;
        }
        // For models without profile
        else if (user.role === UserRole.MODEL) {
            profileStatus = {
                ...profileStatus,
                isProfileComplete: false,
                isIdentityVerified: false,
                profileExists: false,
                profileCompletionPercentage: 0,
                nicVerified: false,
            } as any;
        }
        // For directors without profile
        else if (user.role === UserRole.DIRECTOR) {
            profileStatus = {
                ...profileStatus,
                isProfileComplete: false,
                isIdentityVerified: false,
                profileExists: false,
            } as any;
        }
        // For admin/public users
        else {
            profileStatus = {
                ...profileStatus,
                isProfileComplete: false,
                isIdentityVerified: false,
                profileExists: false,
            } as any;
        }


        return profileStatus;
    }
}
