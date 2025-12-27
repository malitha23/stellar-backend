import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScreenTest, ScreenTestStatus } from './entities/screen-test.entity';
import { ScreenTestSubmission } from './entities/screen-test-submission.entity';
import { CreateScreenTestDto, SubmitScreenTestDto } from './dto/screen-test.dto';
import { User, UserRole } from '../users/entities/user.entity';
import { Project } from '../projects/entities/project.entity';
import { ProjectRole } from '../projects/entities/project-role.entity';

import { GamificationService } from '../gamification/gamification.service';

@Injectable()
export class ScreenTestsService {
    constructor(
        @InjectRepository(ScreenTest)
        private screenTestRepository: Repository<ScreenTest>,
        @InjectRepository(ScreenTestSubmission)
        private submissionRepository: Repository<ScreenTestSubmission>,
        @InjectRepository(Project)
        private projectRepository: Repository<Project>,
        @InjectRepository(ProjectRole)
        private projectRoleRepository: Repository<ProjectRole>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private gamificationService: GamificationService,
    ) { }

    async createRequest(director: User, dto: CreateScreenTestDto): Promise<ScreenTest> {
        const project = await this.projectRepository.findOneBy({ id: dto.projectId });
        if (!project) throw new NotFoundException('Project not found');

        const model = await this.userRepository.findOneBy({ id: dto.modelId });
        if (!model) throw new NotFoundException('Model not found');

        let role = null;
        if (dto.roleId) {
            role = await this.projectRoleRepository.findOneBy({ id: dto.roleId });
        }

        const request = this.screenTestRepository.create({
            project,
            role,
            model,
            director,
            requestNotes: dto.requestNotes,
            status: ScreenTestStatus.PENDING,
        });

        return this.screenTestRepository.save(request);
    }

    async submitScreenTest(model: User, screenTestId: number, dto: SubmitScreenTestDto): Promise<ScreenTestSubmission> {
        const screenTest = await this.screenTestRepository.findOne({
            where: { id: screenTestId },
            relations: ['model'],
        });

        if (!screenTest) throw new NotFoundException('Screen test request not found');
        if (screenTest.model.id !== model.id) throw new ForbiddenException('This request is not for you');
        if (screenTest.status !== ScreenTestStatus.PENDING) throw new BadRequestException('Already submitted or processed');

        const submission = this.submissionRepository.create({
            screenTest,
            videoUrl: dto.videoUrl,
            modelNotes: dto.modelNotes,
        });

        const savedSubmission = await this.submissionRepository.save(submission);

        screenTest.status = ScreenTestStatus.SUBMITTED;
        await this.screenTestRepository.save(screenTest);

        return savedSubmission;
    }

    async getMyRequests(user: User): Promise<ScreenTest[]> {
        if (user.role === UserRole.MODEL) {
            return this.screenTestRepository.find({
                where: { model: { id: user.id } },
                relations: ['project', 'role', 'director', 'submission'],
            });
        } else {
            return this.screenTestRepository.find({
                where: { director: { id: user.id } },
                relations: ['project', 'role', 'model', 'submission'],
            });
        }
    }

    async updateStatus(director: User, screenTestId: number, status: ScreenTestStatus, feedback?: string): Promise<ScreenTest> {
        const screenTest = await this.screenTestRepository.findOne({
            where: { id: screenTestId },
            relations: ['director', 'submission', 'model'],
        });

        if (!screenTest) throw new NotFoundException('Screen test not found');
        if (screenTest.director.id !== director.id) throw new ForbiddenException('Not your request');

        const oldStatus = screenTest.status;
        screenTest.status = status;

        if (feedback && screenTest.submission) {
            screenTest.submission.directorFeedback = feedback;
            await this.submissionRepository.save(screenTest.submission);
        }

        const saved = await this.screenTestRepository.save(screenTest);

        // Award coins on approval
        if (status === ScreenTestStatus.APPROVED && oldStatus !== ScreenTestStatus.APPROVED) {
            await this.gamificationService.awardCoins(screenTest.model, 200, 'Screen test approved');
        }

        return saved;
    }
}
