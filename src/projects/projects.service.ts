import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project, ProjectStatus } from './entities/project.entity';
import { ProjectRole } from './entities/project-role.entity';
import { ProjectImage } from './entities/project-image.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class ProjectsService {
    constructor(
        @InjectRepository(Project)
        private projectRepository: Repository<Project>,
        @InjectRepository(ProjectRole)
        private projectRoleRepository: Repository<ProjectRole>,
        @InjectRepository(ProjectImage)
        private projectImageRepository: Repository<ProjectImage>,
    ) { }

    async create(user: User, createProjectDto: CreateProjectDto): Promise<Project> {
        const { roles, imageUrls, ...projectData } = createProjectDto;

        const project = this.projectRepository.create({
            ...projectData,
            director: user,
        });

        const savedProject = await this.projectRepository.save(project);

        if (roles && roles.length > 0) {
            const projectRoles = roles.map((role) =>
                this.projectRoleRepository.create({ ...role, project: savedProject }),
            );
            await this.projectRoleRepository.save(projectRoles);
        }

        if (imageUrls && imageUrls.length > 0) {
            const projectImages = imageUrls.map((url) =>
                this.projectImageRepository.create({ imageUrl: url, project: savedProject }),
            );
            await this.projectImageRepository.save(projectImages);
        }

        // Return complete project with relations
        return this.findOne(savedProject.id);
    }

    async findAll(): Promise<Project[]> {
        return this.projectRepository.find({
            order: { createdAt: 'DESC' },
            relations: ['images', 'roles'], // Load relations for list view? Maybe just images.
        });
    }

    async findOne(id: number): Promise<Project> {
        const project = await this.projectRepository.findOne({
            where: { id },
            relations: ['director', 'roles', 'images', 'director.directorProfile'],
        });

        if (!project) {
            throw new NotFoundException(`Project with ID ${id} not found`);
        }

        return project;
    }

    async update(id: number, user: User, updateData: any): Promise<Project> {
        const project = await this.findOne(id);

        if (project.director.id !== user.id && user.role !== UserRole.ADMIN) {
            throw new ForbiddenException('You are not allowed to update this project');
        }

        // Basic update for now, more complex logic needed for roles/images updates
        await this.projectRepository.update(id, updateData);
        return this.findOne(id);
    }

    async remove(id: number, user: User): Promise<void> {
        const project = await this.findOne(id);

        if (project.director.id !== user.id && user.role !== UserRole.ADMIN) {
            throw new ForbiddenException('You are not allowed to delete this project');
        }

        await this.projectRepository.remove(project);
    }
}
