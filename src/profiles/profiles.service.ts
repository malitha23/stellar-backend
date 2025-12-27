import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ModelProfile } from './entities/model-profile.entity';
import { DirectorProfile } from './entities/director-profile.entity';
import { CreateModelProfileDto } from './dto/create-model-profile.dto';
import { CreateDirectorProfileDto } from './dto/create-director-profile.dto';
import { User } from '../users/entities/user.entity';
import { ModelLanguage } from './entities/model-language.entity';
import { ModelSkill } from './entities/model-skill.entity';
import * as fs from 'fs';
import * as fsSync from 'fs';
import * as path from 'path';

@Injectable()
export class ProfilesService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(ModelProfile)
        private modelProfileRepository: Repository<ModelProfile>,
        @InjectRepository(DirectorProfile)
        private directorProfileRepository: Repository<DirectorProfile>,
        @InjectRepository(ModelSkill)
        private modelSkillRepository: Repository<ModelSkill>,
        @InjectRepository(ModelLanguage)
        private modelLanguageRepository: Repository<ModelLanguage>,
    ) { }

    async getUser(userId: number) {
        return await this.userRepository.findOne({
            where: { id: userId },
            relations: [
                'modelProfile',
                'modelProfile.skills',
                'modelProfile.languages',
                'directorProfile',
            ],
        });

    }

    async createOrUpdateModelProfile(
        user: User,
        createModelProfileDto: CreateModelProfileDto,
        file?: Express.Multer.File,
    ) {

        // Check if a profile already exists
        let profile = await this.modelProfileRepository.findOne({
            where: { user: { id: user.id } },
            relations: ['skills', 'languages'], // load existing skills/languages
        });

        // Parse JSON strings from FormData
        let skills: any[] = [];
        let languages: any[] = [];
        let projectPreferences: any[] = [];
        let availability: any = {};

        try {
            if (createModelProfileDto.skills) {
                skills = typeof createModelProfileDto.skills === 'string'
                    ? JSON.parse(createModelProfileDto.skills)
                    : createModelProfileDto.skills;
            }

            if (createModelProfileDto.languages) {
                languages = typeof createModelProfileDto.languages === 'string'
                    ? JSON.parse(createModelProfileDto.languages)
                    : createModelProfileDto.languages;
            }

            if (createModelProfileDto.projectPreferences) {
                projectPreferences = typeof createModelProfileDto.projectPreferences === 'string'
                    ? JSON.parse(createModelProfileDto.projectPreferences)
                    : createModelProfileDto.projectPreferences;
            }

            if (createModelProfileDto.availability) {
                availability = typeof createModelProfileDto.availability === 'string'
                    ? JSON.parse(createModelProfileDto.availability)
                    : createModelProfileDto.availability;
            }
        } catch (error) {
            console.error('Error parsing JSON data:', error);
            throw new BadRequestException('Invalid JSON data in request');
        }

        if (!profile) {
            // Create new profile if it doesn't exist
            profile = this.modelProfileRepository.create({
                fullName: createModelProfileDto.fullName,
                age: createModelProfileDto.age,
                gender: createModelProfileDto.gender,
                location: createModelProfileDto.location,
                height: createModelProfileDto.height,
                weight: createModelProfileDto.weight,
                measurements: createModelProfileDto.measurements,
                bioEnglish: createModelProfileDto.bioEnglish,
                bioSinhala: createModelProfileDto.bioSinhala,
                bioTamil: createModelProfileDto.bioTamil,
                profilePhotoUrl: file?.filename,
                projectPreferences: projectPreferences,
                minBudget: createModelProfileDto.minBudget,
                maxBudget: createModelProfileDto.maxBudget,
                availability: availability,
                user,
            });
        } else {
            // Update existing profile
            Object.assign(profile, {
                fullName: createModelProfileDto.fullName,
                age: createModelProfileDto.age,
                gender: createModelProfileDto.gender,
                location: createModelProfileDto.location,
                height: createModelProfileDto.height,
                weight: createModelProfileDto.weight,
                measurements: createModelProfileDto.measurements,
                bioEnglish: createModelProfileDto.bioEnglish,
                bioSinhala: createModelProfileDto.bioSinhala,
                bioTamil: createModelProfileDto.bioTamil,
                profilePhotoUrl: file?.filename ?? profile.profilePhotoUrl,
                projectPreferences: projectPreferences,
                minBudget: createModelProfileDto.minBudget,
                maxBudget: createModelProfileDto.maxBudget,
                availability: availability,
            });

            // Remove existing skills & languages before updating
            await this.modelSkillRepository.delete({ modelProfile: { id: profile.id } });
            await this.modelLanguageRepository.delete({ modelProfile: { id: profile.id } });
        }

        const savedProfile = await this.modelProfileRepository.save(profile);

        // Save new skills
        if (skills.length > 0) {
            await this.modelSkillRepository.delete({ modelProfile: { id: profile.id } });
            const skillEntities = skills.map(skill =>
                this.modelSkillRepository.create({
                    skillName: skill.skillName,
                    proficiencyLevel: skill.proficiencyLevel,
                    modelProfile: savedProfile,
                })
            );
            await this.modelSkillRepository.save(skillEntities);
        }

        // Save new languages
        if (languages.length > 0) {
            await this.modelLanguageRepository.delete({ modelProfile: { id: profile.id } });
            const languageEntities = languages.map(lang =>
                this.modelLanguageRepository.create({
                    language: lang.language,
                    proficiency: lang.proficiency,
                    modelProfile: savedProfile,
                })
            );
            await this.modelLanguageRepository.save(languageEntities);
        }

        // Return profile with relationships
        return this.modelProfileRepository.findOne({
            where: { id: savedProfile.id },
            relations: ['skills', 'languages'],
        });
    }

    async createDirectorProfile(
        user: User,
        createDirectorProfileDto: CreateDirectorProfileDto,
        companyLogo?: Express.Multer.File,
        verificationDocument?: Express.Multer.File,
    ) {
        const existing = await this.directorProfileRepository.findOne({
            where: { user: { id: user.id } },
        });

        if (existing) {
            throw new BadRequestException('Director profile already exists for this user');
        }

        const profile = this.directorProfileRepository.create({
            ...createDirectorProfileDto,
            user: { id: user.id }, // wrap in object to satisfy DeepPartial<User>
            companyLogoUrl: companyLogo?.filename,
            verificationDocumentsUrl: verificationDocument?.filename, // match entity column
        });

        return this.directorProfileRepository.save(profile);
    }

    async updateDirectorProfile(
        user: User,
        updateDto: Partial<CreateDirectorProfileDto> & {
            companyLogo?: Express.Multer.File;
            verificationDocument?: Express.Multer.File;
        },
    ) {
        const profile = await this.directorProfileRepository.findOne({
            where: { user: { id: user.id } },
        });

        if (!profile) {
            throw new NotFoundException('Director profile not found');
        }

        // Store old file names
        const oldFiles = {
            companyLogo: profile.companyLogoUrl,
            verificationDocument: profile.verificationDocumentsUrl,
        };

        // Update files only if a new file is uploaded
        if (updateDto.companyLogo) {
            profile.companyLogoUrl = updateDto.companyLogo.filename;
        }

        if (updateDto.verificationDocument) {
            profile.verificationDocumentsUrl = updateDto.verificationDocument.filename;
        }

        // Update other fields
        Object.assign(profile, updateDto);

        // Save profile
        const updatedProfile = await this.directorProfileRepository.save(profile);

        // Delete old files only if replaced
        await this.deleteOldDirectorFiles(oldFiles, {
            companyLogo: profile.companyLogoUrl,
            verificationDocument: profile.verificationDocumentsUrl,
        });

        return updatedProfile;
    }

    private async deleteOldDirectorFiles(
        oldFiles: { companyLogo?: string; verificationDocument?: string },
        newFiles: { companyLogo?: string; verificationDocument?: string }
    ) {
        try {
            // Company logo path
            if (oldFiles.companyLogo && newFiles.companyLogo && oldFiles.companyLogo !== newFiles.companyLogo) {
                const logoPath = path.join(process.cwd(), 'uploads', 'directors', 'logo', oldFiles.companyLogo);
                await this.safeDeleteFile(logoPath);
            }

            // Verification document path
            if (oldFiles.verificationDocument && newFiles.verificationDocument && oldFiles.verificationDocument !== newFiles.verificationDocument) {
                const verificationPath = path.join(process.cwd(), 'uploads', 'directors', 'verification', oldFiles.verificationDocument);
                await this.safeDeleteFile(verificationPath);
            }
        } catch (error) {
            console.error('Error deleting old director files:', error);
        }
    }

    private async safeDeleteFile(filePath: string) {
        try {
            if (filePath && fsSync.existsSync(filePath)) {
                await fs.promises.unlink(filePath);
                console.log(`Deleted file: ${filePath}`);
            } else {
                console.log(`File not found, skipping delete: ${filePath}`);
            }
        } catch (error) {
            console.error(`Failed to delete file ${filePath}:`, error);
        }
    }

    // In profiles.service.ts
    async getDirectorProfile(userId: number) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['directorProfile'],
        });

        if (!user || !user.directorProfile) {
            return null;
        }

        // Return plain object for frontend consumption
        return {
            id: user.directorProfile.id,
            companyName: user.directorProfile.companyName,
            companyType: user.directorProfile.companyType,
            companyRegistrationNumber: user.directorProfile.companyRegistrationNumber,
            bio: user.directorProfile.bio,
            officeLocation: user.directorProfile.officeLocation,
            contactPersonName: user.directorProfile.contactPersonName,
            contactEmail: user.directorProfile.contactEmail,
            contactPhone: user.directorProfile.contactPhone,
            pastProjects: user.directorProfile.pastProjects,
            companyWebsite: user.directorProfile.companyWebsite,
            companyLogo: user.directorProfile.companyLogoUrl,
            verificationDocumentsUrl: user.directorProfile.verificationDocumentsUrl,
            verificationStatus: user.directorProfile.verificationStatus,
            createdAt: user.directorProfile.createdAt,
            updatedAt: user.directorProfile.updatedAt,
        };
    }

    async getProfile(user: User) {
        const modelProfile = await this.modelProfileRepository.findOne({
            where: { user: { id: user.id } },
            relations: ['skills', 'languages', 'portfolio'],
        });

        if (modelProfile) {
            return { ...modelProfile, profileType: 'model' };
        }

        const directorProfile = await this.directorProfileRepository.findOne({
            where: { user: { id: user.id } },
        });

        if (directorProfile) {
            return { ...directorProfile, profileType: 'director' };
        }

        return null;
    }
}
